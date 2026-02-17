using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using SimRacingShop.Core.Entities;
using SimRacingShop.Infrastructure.Data;
using SimRacingShop.Infrastructure.Repositories;

namespace SimRacingShop.UnitTests.Repositories;

public class ShippingZoneRepositoryTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly ShippingZoneRepository _repository;

    public ShippingZoneRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);
        _repository = new ShippingZoneRepository(_context);
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    #region Helper Methods

    private async Task<ShippingZone> SeedZone(
        string name = "Península",
        string postalCodePrefixes = "28,08,41",
        decimal baseCost = 5.99m,
        decimal costPerKg = 0.50m,
        decimal freeShippingThreshold = 100m,
        bool isActive = true)
    {
        var zone = new ShippingZone
        {
            Id = Guid.NewGuid(),
            Name = name,
            PostalCodePrefixes = postalCodePrefixes,
            BaseCost = baseCost,
            CostPerKg = costPerKg,
            FreeShippingThreshold = freeShippingThreshold,
            IsActive = isActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.ShippingZones.Add(zone);
        await _context.SaveChangesAsync();
        return zone;
    }

    #endregion

    #region GetByPostalCodeAsync Tests

    [Fact]
    public async Task GetByPostalCodeAsync_WithMatchingPostalCode_ReturnsZone()
    {
        // Arrange
        var zone = await SeedZone(name: "Península", postalCodePrefixes: "28,08,41");

        // Act
        var result = await _repository.GetByPostalCodeAsync("28013");

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(zone.Id);
        result.Name.Should().Be("Península");
    }

    [Fact]
    public async Task GetByPostalCodeAsync_WithNonMatchingPostalCode_ReturnsNull()
    {
        // Arrange
        await SeedZone(postalCodePrefixes: "28,08");

        // Act
        var result = await _repository.GetByPostalCodeAsync("35001");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByPostalCodeAsync_WithNullPostalCode_ReturnsNull()
    {
        // Arrange
        await SeedZone();

        // Act
        var result = await _repository.GetByPostalCodeAsync(null!);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByPostalCodeAsync_WithEmptyPostalCode_ReturnsNull()
    {
        // Arrange
        await SeedZone();

        // Act
        var result = await _repository.GetByPostalCodeAsync("");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByPostalCodeAsync_WithWhitespacePostalCode_ReturnsNull()
    {
        // Arrange
        await SeedZone();

        // Act
        var result = await _repository.GetByPostalCodeAsync("   ");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByPostalCodeAsync_WithSingleCharPostalCode_ReturnsNull()
    {
        // Arrange
        await SeedZone(postalCodePrefixes: "2");

        // Act — código de un solo carácter no llega a los 2 dígitos mínimos
        var result = await _repository.GetByPostalCodeAsync("2");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByPostalCodeAsync_WithInactiveZone_ReturnsNull()
    {
        // Arrange
        await SeedZone(postalCodePrefixes: "35,38", isActive: false);

        // Act
        var result = await _repository.GetByPostalCodeAsync("35001");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByPostalCodeAsync_WithMultipleActiveZones_ReturnsCorrectZone()
    {
        // Arrange
        await SeedZone(name: "Península", postalCodePrefixes: "28,08,41");
        var canarias = await SeedZone(name: "Canarias", postalCodePrefixes: "35,38");

        // Act
        var result = await _repository.GetByPostalCodeAsync("35001");

        // Assert
        result.Should().NotBeNull();
        result!.Name.Should().Be("Canarias");
        result.Id.Should().Be(canarias.Id);
    }

    [Fact]
    public async Task GetByPostalCodeAsync_WithPrefixesWithSpaces_StillMatches()
    {
        // Arrange — prefijos con espacios alrededor de la coma
        await SeedZone(name: "Baleares", postalCodePrefixes: "07 , 08");

        // Act
        var result = await _repository.GetByPostalCodeAsync("07001");

        // Assert
        result.Should().NotBeNull();
        result!.Name.Should().Be("Baleares");
    }

    [Fact]
    public async Task GetByPostalCodeAsync_UsesFirstTwoCharsOfPostalCode()
    {
        // Arrange
        await SeedZone(name: "Ceuta", postalCodePrefixes: "51");

        // Act — código postal de Ceuta empieza por 51
        var result = await _repository.GetByPostalCodeAsync("51001");

        // Assert
        result.Should().NotBeNull();
        result!.Name.Should().Be("Ceuta");
    }

    #endregion

    #region GetAllActiveAsync Tests

    [Fact]
    public async Task GetAllActiveAsync_WithMultipleZones_ReturnsOnlyActive()
    {
        // Arrange
        await SeedZone(name: "Activa A", isActive: true);
        await SeedZone(name: "Activa B", isActive: true);
        await SeedZone(name: "Inactiva", isActive: false);

        // Act
        var result = await _repository.GetAllActiveAsync();

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(z => z.IsActive);
    }

    [Fact]
    public async Task GetAllActiveAsync_WithNoZones_ReturnsEmpty()
    {
        // Act
        var result = await _repository.GetAllActiveAsync();

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAllActiveAsync_ReturnsZonesOrderedByName()
    {
        // Arrange
        await SeedZone(name: "Península");
        await SeedZone(name: "Canarias", postalCodePrefixes: "35,38");
        await SeedZone(name: "Baleares", postalCodePrefixes: "07");

        // Act
        var result = (await _repository.GetAllActiveAsync()).ToList();

        // Assert
        result.Should().HaveCount(3);
        result[0].Name.Should().Be("Baleares");
        result[1].Name.Should().Be("Canarias");
        result[2].Name.Should().Be("Península");
    }

    [Fact]
    public async Task GetAllActiveAsync_WithAllInactive_ReturnsEmpty()
    {
        // Arrange
        await SeedZone(name: "Zona A", isActive: false);
        await SeedZone(name: "Zona B", isActive: false);

        // Act
        var result = await _repository.GetAllActiveAsync();

        // Assert
        result.Should().BeEmpty();
    }

    #endregion

    #region GetByIdAsync Tests

    [Fact]
    public async Task GetByIdAsync_WithExistingId_ReturnsZone()
    {
        // Arrange
        var zone = await SeedZone(name: "Península");

        // Act
        var result = await _repository.GetByIdAsync(zone.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(zone.Id);
        result.Name.Should().Be("Península");
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistentId_ReturnsNull()
    {
        // Act
        var result = await _repository.GetByIdAsync(Guid.NewGuid());

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsInactiveZoneToo()
    {
        // Arrange
        var inactive = await SeedZone(name: "Zona Inactiva", isActive: false);

        // Act
        var result = await _repository.GetByIdAsync(inactive.Id);

        // Assert
        result.Should().NotBeNull();
        result!.IsActive.Should().BeFalse();
    }

    #endregion

    #region CreateAsync Tests

    [Fact]
    public async Task CreateAsync_WithValidZone_CreatesSuccessfully()
    {
        // Arrange
        var zone = new ShippingZone
        {
            Id = Guid.NewGuid(),
            Name = "Nueva Zona",
            PostalCodePrefixes = "99",
            BaseCost = 12m,
            CostPerKg = 1m,
            FreeShippingThreshold = 150m,
            IsActive = true
        };

        // Act
        var result = await _repository.CreateAsync(zone);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(zone.Id);
        result.Name.Should().Be("Nueva Zona");

        var saved = await _context.ShippingZones.FindAsync(new object[] { zone.Id }, TestContext.Current.CancellationToken);
        saved.Should().NotBeNull();
        saved!.BaseCost.Should().Be(12m);
        saved.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task CreateAsync_SetsCreatedAtAndUpdatedAt()
    {
        // Arrange
        var before = DateTime.UtcNow.AddSeconds(-1);
        var zone = new ShippingZone
        {
            Id = Guid.NewGuid(),
            Name = "Zona Con Timestamps",
            PostalCodePrefixes = "00",
            BaseCost = 5m,
            CostPerKg = 0.5m,
            FreeShippingThreshold = 100m,
            IsActive = true
        };

        // Act
        var result = await _repository.CreateAsync(zone);

        // Assert
        var after = DateTime.UtcNow.AddSeconds(1);
        result.CreatedAt.Should().BeAfter(before).And.BeBefore(after);
        result.UpdatedAt.Should().BeAfter(before).And.BeBefore(after);
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_WithValidChanges_UpdatesSuccessfully()
    {
        // Arrange
        var zone = await SeedZone(name: "Zona Original", baseCost: 5m);
        zone.Name = "Zona Actualizada";
        zone.BaseCost = 8m;

        // Act
        await _repository.UpdateAsync(zone);

        // Assert
        var updated = await _context.ShippingZones.FindAsync(new object[] { zone.Id }, TestContext.Current.CancellationToken);
        updated.Should().NotBeNull();
        updated!.Name.Should().Be("Zona Actualizada");
        updated.BaseCost.Should().Be(8m);
    }

    [Fact]
    public async Task UpdateAsync_SetsUpdatedAtTimestamp()
    {
        // Arrange
        var zone = await SeedZone();
        var originalUpdatedAt = zone.UpdatedAt;

        await Task.Delay(100, TestContext.Current.CancellationToken);

        zone.BaseCost = 9.99m;

        // Act
        await _repository.UpdateAsync(zone);

        // Assert
        var updated = await _context.ShippingZones.FindAsync(new object[] { zone.Id }, TestContext.Current.CancellationToken);
        updated.Should().NotBeNull();
        updated!.UpdatedAt.Should().BeAfter(originalUpdatedAt);
    }

    [Fact]
    public async Task UpdateAsync_CanDeactivateZone()
    {
        // Arrange
        var zone = await SeedZone(isActive: true);
        zone.IsActive = false;

        // Act
        await _repository.UpdateAsync(zone);

        // Assert
        var updated = await _context.ShippingZones.FindAsync(new object[] { zone.Id }, TestContext.Current.CancellationToken);
        updated.Should().NotBeNull();
        updated!.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task UpdateAsync_DoesNotAffectOtherZones()
    {
        // Arrange
        var zone1 = await SeedZone(name: "Zona 1", baseCost: 5m);
        var zone2 = await SeedZone(name: "Zona 2", postalCodePrefixes: "99", baseCost: 10m);

        zone1.BaseCost = 7m;

        // Act
        await _repository.UpdateAsync(zone1);

        // Assert
        var untouched = await _context.ShippingZones.FindAsync(new object[] { zone2.Id }, TestContext.Current.CancellationToken);
        untouched.Should().NotBeNull();
        untouched!.BaseCost.Should().Be(10m);
    }

    #endregion
}
