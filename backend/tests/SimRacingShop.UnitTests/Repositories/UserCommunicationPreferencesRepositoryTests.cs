using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using SimRacingShop.Core.Entities;
using SimRacingShop.Infrastructure.Data;
using SimRacingShop.Infrastructure.Repositories;

namespace SimRacingShop.UnitTests.Repositories;

public class UserCommunicationPreferencesRepositoryTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly UserCommunicationPreferencesRepository _repository;
    private readonly Guid _userId;

    public UserCommunicationPreferencesRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);
        _repository = new UserCommunicationPreferencesRepository(_context);
        _userId = Guid.NewGuid();
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    #region Helper Methods

    private async Task<UserCommunicationPreferences> SeedPreferences(
        Guid? userId = null,
        bool newsletter = false,
        bool orderNotifications = true,
        bool smsPromotions = false)
    {
        var preferences = new UserCommunicationPreferences
        {
            Id = Guid.NewGuid(),
            UserId = userId ?? _userId,
            Newsletter = newsletter,
            OrderNotifications = orderNotifications,
            SmsPromotions = smsPromotions,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.UserCommunicationPreferences.Add(preferences);
        await _context.SaveChangesAsync();
        return preferences;
    }

    #endregion

    #region GetByUserIdAsync Tests

    [Fact]
    public async Task GetByUserIdAsync_WithExistingPreferences_ReturnsPreferences()
    {
        // Arrange
        var preferences = await SeedPreferences(newsletter: true, orderNotifications: false, smsPromotions: true);

        // Act
        var result = await _repository.GetByUserIdAsync(_userId);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(preferences.Id);
        result.UserId.Should().Be(_userId);
        result.Newsletter.Should().BeTrue();
        result.OrderNotifications.Should().BeFalse();
        result.SmsPromotions.Should().BeTrue();
    }

    [Fact]
    public async Task GetByUserIdAsync_WithNoPreferences_ReturnsNull()
    {
        // Act
        var result = await _repository.GetByUserIdAsync(_userId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByUserIdAsync_WithDifferentUser_ReturnsNull()
    {
        // Arrange
        var otherUserId = Guid.NewGuid();
        await SeedPreferences(userId: otherUserId);

        // Act
        var result = await _repository.GetByUserIdAsync(_userId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByUserIdAsync_WithMultipleUsers_ReturnsCorrectPreferences()
    {
        // Arrange
        var user1Id = Guid.NewGuid();
        var user2Id = Guid.NewGuid();

        var prefs1 = await SeedPreferences(userId: user1Id, newsletter: true);
        await SeedPreferences(userId: user2Id, newsletter: false);

        // Act
        var result = await _repository.GetByUserIdAsync(user1Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(prefs1.Id);
        result.Newsletter.Should().BeTrue();
    }

    #endregion

    #region CreateAsync Tests

    [Fact]
    public async Task CreateAsync_WithValidPreferences_CreatesSuccessfully()
    {
        // Arrange
        var preferences = new UserCommunicationPreferences
        {
            Id = Guid.NewGuid(),
            UserId = _userId,
            Newsletter = true,
            OrderNotifications = false,
            SmsPromotions = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Act
        var result = await _repository.CreateAsync(preferences);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(preferences.Id);

        var savedPreferences = await _context.UserCommunicationPreferences.FindAsync(new object[] { preferences.Id }, TestContext.Current.CancellationToken);
        savedPreferences.Should().NotBeNull();
        savedPreferences!.UserId.Should().Be(_userId);
        savedPreferences.Newsletter.Should().BeTrue();
        savedPreferences.OrderNotifications.Should().BeFalse();
        savedPreferences.SmsPromotions.Should().BeTrue();
    }

    [Fact]
    public async Task CreateAsync_WithDefaultValues_CreatesSuccessfully()
    {
        // Arrange
        var preferences = new UserCommunicationPreferences
        {
            Id = Guid.NewGuid(),
            UserId = _userId,
            Newsletter = false,
            OrderNotifications = true, // Valor por defecto
            SmsPromotions = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Act
        var result = await _repository.CreateAsync(preferences);

        // Assert
        result.Should().NotBeNull();
        var savedPreferences = await _context.UserCommunicationPreferences.FindAsync(new object[] { preferences.Id }, TestContext.Current.CancellationToken);
        savedPreferences.Should().NotBeNull();
        savedPreferences!.Newsletter.Should().BeFalse();
        savedPreferences.OrderNotifications.Should().BeTrue();
        savedPreferences.SmsPromotions.Should().BeFalse();
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_WithExistingPreferences_UpdatesSuccessfully()
    {
        // Arrange
        var preferences = await SeedPreferences(newsletter: false, orderNotifications: true, smsPromotions: false);

        preferences.Newsletter = true;
        preferences.OrderNotifications = false;
        preferences.SmsPromotions = true;

        // Act
        await _repository.UpdateAsync(preferences);

        // Assert
        var updatedPreferences = await _context.UserCommunicationPreferences.FindAsync(new object[] { preferences.Id }, TestContext.Current.CancellationToken);
        updatedPreferences.Should().NotBeNull();
        updatedPreferences!.Newsletter.Should().BeTrue();
        updatedPreferences.OrderNotifications.Should().BeFalse();
        updatedPreferences.SmsPromotions.Should().BeTrue();
    }

    [Fact]
    public async Task UpdateAsync_SetsUpdatedAtTimestamp()
    {
        // Arrange
        var preferences = await SeedPreferences();
        var originalUpdatedAt = preferences.UpdatedAt;

        // Esperar un poco para asegurar diferencia de tiempo
        await Task.Delay(100, TestContext.Current.CancellationToken);

        preferences.Newsletter = true;

        // Act
        await _repository.UpdateAsync(preferences);

        // Assert
        var updatedPreferences = await _context.UserCommunicationPreferences.FindAsync(new object[] { preferences.Id }, TestContext.Current.CancellationToken);
        updatedPreferences.Should().NotBeNull();
        updatedPreferences!.UpdatedAt.Should().BeAfter(originalUpdatedAt);
    }

    [Fact]
    public async Task UpdateAsync_DoesNotChangeCreatedAt()
    {
        // Arrange
        var preferences = await SeedPreferences();
        var originalCreatedAt = preferences.CreatedAt;

        preferences.Newsletter = true;

        // Act
        await _repository.UpdateAsync(preferences);

        // Assert
        var updatedPreferences = await _context.UserCommunicationPreferences.FindAsync(new object[] { preferences.Id }, TestContext.Current.CancellationToken);
        updatedPreferences.Should().NotBeNull();
        updatedPreferences!.CreatedAt.Should().Be(originalCreatedAt);
    }

    [Fact]
    public async Task UpdateAsync_UpdatesOnlySpecifiedPreferences()
    {
        // Arrange
        var preferences1 = await SeedPreferences(userId: _userId, newsletter: false);
        var preferences2 = await SeedPreferences(userId: Guid.NewGuid(), newsletter: false);

        preferences1.Newsletter = true;

        // Act
        await _repository.UpdateAsync(preferences1);

        // Assert
        var updatedPreferences1 = await _context.UserCommunicationPreferences.FindAsync(new object[] { preferences1.Id }, TestContext.Current.CancellationToken);
        var updatedPreferences2 = await _context.UserCommunicationPreferences.FindAsync(new object[] { preferences2.Id }, TestContext.Current.CancellationToken);

        updatedPreferences1.Should().NotBeNull();
        updatedPreferences1!.Newsletter.Should().BeTrue();

        updatedPreferences2.Should().NotBeNull();
        updatedPreferences2!.Newsletter.Should().BeFalse(); // No debe cambiar
    }

    [Fact]
    public async Task UpdateAsync_WithAllFalse_UpdatesSuccessfully()
    {
        // Arrange
        var preferences = await SeedPreferences(newsletter: true, orderNotifications: true, smsPromotions: true);

        preferences.Newsletter = false;
        preferences.OrderNotifications = false;
        preferences.SmsPromotions = false;

        // Act
        await _repository.UpdateAsync(preferences);

        // Assert
        var updatedPreferences = await _context.UserCommunicationPreferences.FindAsync(new object[] { preferences.Id }, TestContext.Current.CancellationToken);
        updatedPreferences.Should().NotBeNull();
        updatedPreferences!.Newsletter.Should().BeFalse();
        updatedPreferences.OrderNotifications.Should().BeFalse();
        updatedPreferences.SmsPromotions.Should().BeFalse();
    }

    #endregion
}
