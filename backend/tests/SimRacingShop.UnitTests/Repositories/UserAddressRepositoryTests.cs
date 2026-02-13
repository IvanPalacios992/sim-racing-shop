using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Enums;
using SimRacingShop.Infrastructure.Data;
using SimRacingShop.Infrastructure.Repositories;

namespace SimRacingShop.UnitTests.Repositories;

public class UserAddressRepositoryTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly UserAddressRepository _repository;
    private readonly Guid _userId;

    public UserAddressRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);
        _repository = new UserAddressRepository(_context);
        _userId = Guid.NewGuid();
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    #region Helper Methods

    private async Task<UserAddress> SeedBillingAddress(
        Guid? userId = null,
        string street = "Main Street 123",
        string city = "Madrid",
        string postalCode = "28001",
        string country = "ES")
    {
        var address = new UserAddress
        {
            Id = Guid.NewGuid(),
            UserId = userId ?? _userId,
            AddressType = AddressType.Billing,
            Street = street,
            City = city,
            PostalCode = postalCode,
            Country = country,
            IsDefault = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.UserAddresses.Add(address);
        await _context.SaveChangesAsync();
        return address;
    }

    private async Task<UserAddress> SeedDeliveryAddress(
        Guid? userId = null,
        string name = "Home",
        string street = "Main Street 123",
        string city = "Madrid",
        string postalCode = "28001",
        string country = "ES",
        bool isDefault = false)
    {
        var address = new UserAddress
        {
            Id = Guid.NewGuid(),
            UserId = userId ?? _userId,
            AddressType = AddressType.Delivery,
            Name = name,
            Street = street,
            City = city,
            PostalCode = postalCode,
            Country = country,
            IsDefault = isDefault,
            CreatedAt = DateTime.UtcNow
        };

        _context.UserAddresses.Add(address);
        await _context.SaveChangesAsync();
        return address;
    }

    #endregion

    #region CreateAsync Tests

    [Fact]
    public async Task CreateAsync_WithValidBillingAddress_CreatesSuccessfully()
    {
        // Arrange
        var address = new UserAddress
        {
            Id = Guid.NewGuid(),
            UserId = _userId,
            AddressType = AddressType.Billing,
            Street = "New Street",
            City = "Barcelona",
            PostalCode = "08001",
            Country = "ES",
            IsDefault = true,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var result = await _repository.CreateAsync(address);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(address.Id);

        var savedAddress = await _context.UserAddresses.FindAsync(address.Id);
        savedAddress.Should().NotBeNull();
        savedAddress!.Street.Should().Be("New Street");
        savedAddress.AddressType.Should().Be(AddressType.Billing);
    }

    [Fact]
    public async Task CreateAsync_WithValidDeliveryAddress_CreatesSuccessfully()
    {
        // Arrange
        var address = new UserAddress
        {
            Id = Guid.NewGuid(),
            UserId = _userId,
            AddressType = AddressType.Delivery,
            Name = "Office",
            Street = "Office Street",
            City = "Valencia",
            PostalCode = "46001",
            Country = "ES",
            IsDefault = false,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var result = await _repository.CreateAsync(address);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Office");

        var savedAddress = await _context.UserAddresses.FindAsync(address.Id);
        savedAddress.Should().NotBeNull();
        savedAddress!.AddressType.Should().Be(AddressType.Delivery);
    }

    #endregion

    #region GetBillingAddressByUserIdAsync Tests

    [Fact]
    public async Task GetBillingAddressByUserIdAsync_WithExistingAddress_ReturnsAddress()
    {
        // Arrange
        var billingAddress = await SeedBillingAddress();

        // Act
        var result = await _repository.GetBillingAddressByUserIdAsync(_userId);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(billingAddress.Id);
        result.AddressType.Should().Be(AddressType.Billing);
        result.UserId.Should().Be(_userId);
    }

    [Fact]
    public async Task GetBillingAddressByUserIdAsync_WithNonExistentAddress_ReturnsNull()
    {
        // Act
        var result = await _repository.GetBillingAddressByUserIdAsync(_userId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetBillingAddressByUserIdAsync_WithOnlyDeliveryAddress_ReturnsNull()
    {
        // Arrange
        await SeedDeliveryAddress();

        // Act
        var result = await _repository.GetBillingAddressByUserIdAsync(_userId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetBillingAddressByUserIdAsync_WithDifferentUser_ReturnsNull()
    {
        // Arrange
        await SeedBillingAddress(userId: Guid.NewGuid());

        // Act
        var result = await _repository.GetBillingAddressByUserIdAsync(_userId);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region GetDeliveryAddressByIdAsync Tests

    [Fact]
    public async Task GetDeliveryAddressByIdAsync_WithExistingAddress_ReturnsAddress()
    {
        // Arrange
        var deliveryAddress = await SeedDeliveryAddress();

        // Act
        var result = await _repository.GetDeliveryAddressByIdAsync(deliveryAddress.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(deliveryAddress.Id);
        result.AddressType.Should().Be(AddressType.Delivery);
        result.Name.Should().Be("Home");
    }

    [Fact]
    public async Task GetDeliveryAddressByIdAsync_WithNonExistentId_ReturnsNull()
    {
        // Act
        var result = await _repository.GetDeliveryAddressByIdAsync(Guid.NewGuid());

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetDeliveryAddressByIdAsync_WithBillingAddress_ReturnsNull()
    {
        // Arrange
        var billingAddress = await SeedBillingAddress();

        // Act
        var result = await _repository.GetDeliveryAddressByIdAsync(billingAddress.Id);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region GetDeliveryAddressesByUserIdAsync Tests

    [Fact]
    public async Task GetDeliveryAddressesByUserIdAsync_WithMultipleAddresses_ReturnsAll()
    {
        // Arrange
        await SeedDeliveryAddress(name: "Home", isDefault: true);
        await SeedDeliveryAddress(name: "Office", isDefault: false);
        await SeedDeliveryAddress(name: "Vacation", isDefault: false);

        // Act
        var result = await _repository.GetDeliveryAddressesByUserIdAsync(_userId);

        // Assert
        result.Should().HaveCount(3);
        result.Should().OnlyContain(a => a.AddressType == AddressType.Delivery);
        result.Should().OnlyContain(a => a.UserId == _userId);
    }

    [Fact]
    public async Task GetDeliveryAddressesByUserIdAsync_WithNoAddresses_ReturnsEmpty()
    {
        // Act
        var result = await _repository.GetDeliveryAddressesByUserIdAsync(_userId);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetDeliveryAddressesByUserIdAsync_ExcludesBillingAddresses()
    {
        // Arrange
        await SeedBillingAddress();
        await SeedDeliveryAddress(name: "Home");

        // Act
        var result = await _repository.GetDeliveryAddressesByUserIdAsync(_userId);

        // Assert
        result.Should().HaveCount(1);
        result.Should().OnlyContain(a => a.AddressType == AddressType.Delivery);
    }

    [Fact]
    public async Task GetDeliveryAddressesByUserIdAsync_ExcludesOtherUsers()
    {
        // Arrange
        var otherUserId = Guid.NewGuid();
        await SeedDeliveryAddress(userId: _userId, name: "My Home");
        await SeedDeliveryAddress(userId: otherUserId, name: "Other Home");

        // Act
        var result = await _repository.GetDeliveryAddressesByUserIdAsync(_userId);

        // Assert
        result.Should().HaveCount(1);
        result.First().Name.Should().Be("My Home");
    }

    #endregion

    #region ExistBillingAddressForUser Tests

    [Fact]
    public void ExistBillingAddressForUser_WithExistingAddress_ReturnsTrue()
    {
        // Arrange
        _context.UserAddresses.Add(new UserAddress
        {
            Id = Guid.NewGuid(),
            UserId = _userId,
            AddressType = AddressType.Billing,
            Street = "Test Street",
            City = "Test City",
            PostalCode = "12345",
            Country = "ES",
            CreatedAt = DateTime.UtcNow
        });
        _context.SaveChanges();

        // Act
        var result = _repository.ExistBillingAddressForUser(_userId);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void ExistBillingAddressForUser_WithNoAddress_ReturnsFalse()
    {
        // Act
        var result = _repository.ExistBillingAddressForUser(_userId);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void ExistBillingAddressForUser_WithOnlyDeliveryAddress_ReturnsFalse()
    {
        // Arrange
        _context.UserAddresses.Add(new UserAddress
        {
            Id = Guid.NewGuid(),
            UserId = _userId,
            AddressType = AddressType.Delivery,
            Name = "Home",
            Street = "Test Street",
            City = "Test City",
            PostalCode = "12345",
            Country = "ES",
            CreatedAt = DateTime.UtcNow
        });
        _context.SaveChanges();

        // Act
        var result = _repository.ExistBillingAddressForUser(_userId);

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_WithValidAddress_UpdatesSuccessfully()
    {
        // Arrange
        var address = await SeedDeliveryAddress(name: "Original Name");
        address.Name = "Updated Name";
        address.Street = "Updated Street";

        // Act
        await _repository.UpdateAsync(address);

        // Assert
        var updatedAddress = await _context.UserAddresses.FindAsync(address.Id);
        updatedAddress.Should().NotBeNull();
        updatedAddress!.Name.Should().Be("Updated Name");
        updatedAddress.Street.Should().Be("Updated Street");
    }

    [Fact]
    public async Task UpdateAsync_UpdatesBillingAddress_Successfully()
    {
        // Arrange
        var address = await SeedBillingAddress(city: "Original City");
        address.City = "Updated City";
        address.PostalCode = "99999";

        // Act
        await _repository.UpdateAsync(address);

        // Assert
        var updatedAddress = await _context.UserAddresses.FindAsync(address.Id);
        updatedAddress.Should().NotBeNull();
        updatedAddress!.City.Should().Be("Updated City");
        updatedAddress.PostalCode.Should().Be("99999");
    }

    #endregion

    #region DeleteAsync Tests

    [Fact]
    public async Task DeleteAsync_WithExistingAddress_DeletesSuccessfully()
    {
        // Arrange
        var address = await SeedDeliveryAddress();
        var addressId = address.Id;

        // Act
        await _repository.DeleteAsync(address);

        // Assert
        var deletedAddress = await _context.UserAddresses.FindAsync(addressId);
        deletedAddress.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_WithBillingAddress_DeletesSuccessfully()
    {
        // Arrange
        var address = await SeedBillingAddress();
        var addressId = address.Id;

        // Act
        await _repository.DeleteAsync(address);

        // Assert
        var deletedAddress = await _context.UserAddresses.FindAsync(addressId);
        deletedAddress.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_DoesNotAffectOtherAddresses()
    {
        // Arrange
        var address1 = await SeedDeliveryAddress(name: "Address 1");
        var address2 = await SeedDeliveryAddress(name: "Address 2");

        // Act
        await _repository.DeleteAsync(address1);

        // Assert
        var remainingAddress = await _context.UserAddresses.FindAsync(address2.Id);
        remainingAddress.Should().NotBeNull();
        remainingAddress!.Name.Should().Be("Address 2");

        var allAddresses = await _context.UserAddresses.ToListAsync(TestContext.Current.CancellationToken);
        allAddresses.Should().HaveCount(1);
    }

    #endregion
}
