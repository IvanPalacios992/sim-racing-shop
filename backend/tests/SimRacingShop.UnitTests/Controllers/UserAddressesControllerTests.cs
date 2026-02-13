using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using SimRacingShop.API.Controllers;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Enums;
using SimRacingShop.Core.Repositories;
using System.Security.Claims;

namespace SimRacingShop.UnitTests.Controllers;

public class UserAddressesControllerTests
{
    private readonly Mock<IUserAddressRepository> _repositoryMock;
    private readonly Mock<ILogger<UserAddressesController>> _loggerMock;
    private readonly UserAddressesController _controller;
    private readonly Guid _userId;

    public UserAddressesControllerTests()
    {
        _repositoryMock = new Mock<IUserAddressRepository>();
        _loggerMock = new Mock<ILogger<UserAddressesController>>();
        _controller = new UserAddressesController(_repositoryMock.Object, _loggerMock.Object);
        _userId = Guid.NewGuid();

        SetupAuthenticatedUser(_userId);
    }

    private void SetupAuthenticatedUser(Guid userId)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString())
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };
    }

    #region CreateCurrentUserBillingAddress Tests

    [Fact]
    public async Task CreateCurrentUserBillingAddress_WithValidData_ReturnsCreated()
    {
        // Arrange
        var dto = new CreateBillingAddressDto
        {
            UserId = _userId,
            Street = "Main Street 123",
            City = "Madrid",
            State = "Madrid",
            PostalCode = "28001",
            Country = "ES"
        };

        _repositoryMock.Setup(x => x.CreateAsync(It.IsAny<UserAddress>()))
            .ReturnsAsync((UserAddress ua) => ua);

        // Act
        var result = await _controller.CreateCurrentUserBillingAddress(dto);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.StatusCode.Should().Be(201);

        var response = createdResult.Value.Should().BeOfType<BillingAddressDetailDto>().Subject;
        response.Street.Should().Be(dto.Street);
        response.City.Should().Be(dto.City);
        response.PostalCode.Should().Be(dto.PostalCode);

        _repositoryMock.Verify(x => x.CreateAsync(It.Is<UserAddress>(
            ua => ua.UserId == _userId &&
                  ua.Street == dto.Street &&
                  ua.AddressType == AddressType.Billing &&
                  ua.IsDefault == true
        )), Times.Once);
    }

    [Fact]
    public async Task CreateCurrentUserBillingAddress_WithMismatchedUserId_ReturnsUnauthorized()
    {
        // Arrange
        var dto = new CreateBillingAddressDto
        {
            UserId = Guid.NewGuid(), // Different from authenticated user
            Street = "Main Street 123",
            City = "Madrid",
            PostalCode = "28001",
            Country = "ES"
        };

        // Act
        var result = await _controller.CreateCurrentUserBillingAddress(dto);

        // Assert
        result.Should().BeOfType<UnauthorizedResult>();
        _repositoryMock.Verify(x => x.CreateAsync(It.IsAny<UserAddress>()), Times.Never);
    }

    [Fact]
    public async Task CreateCurrentUserBillingAddress_WithNoAuth_ReturnsUnauthorized()
    {
        // Arrange
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(new ClaimsIdentity()) }
        };

        var dto = new CreateBillingAddressDto
        {
            UserId = Guid.NewGuid(),
            Street = "Main Street 123",
            City = "Madrid",
            PostalCode = "28001",
            Country = "ES"
        };

        // Act
        var result = await _controller.CreateCurrentUserBillingAddress(dto);

        // Assert
        result.Should().BeOfType<UnauthorizedResult>();
    }

    #endregion

    #region UpdateCurrentUserBillingAddress Tests

    [Fact]
    public async Task UpdateCurrentUserBillingAddress_WithValidData_ReturnsOk()
    {
        // Arrange
        var existingAddress = new UserAddress
        {
            Id = Guid.NewGuid(),
            UserId = _userId,
            AddressType = AddressType.Billing,
            Street = "Old Street",
            City = "Madrid",
            PostalCode = "28001",
            Country = "ES"
        };

        var dto = new UpdateBillingAddressDto
        {
            Street = "New Street 456",
            City = "Barcelona",
            State = "Barcelona",
            PostalCode = "08001",
            Country = "ES"
        };

        _repositoryMock.Setup(x => x.GetBillingAddressByUserIdAsync(_userId))
            .ReturnsAsync(existingAddress);

        _repositoryMock.Setup(x => x.UpdateAsync(It.IsAny<UserAddress>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.UpdateCurrentUserBillingAddress(dto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<BillingAddressDetailDto>().Subject;
        response.Street.Should().Be(dto.Street);
        response.City.Should().Be(dto.City);

        _repositoryMock.Verify(x => x.UpdateAsync(It.Is<UserAddress>(
            ua => ua.Street == dto.Street && ua.City == dto.City
        )), Times.Once);
    }

    [Fact]
    public async Task UpdateCurrentUserBillingAddress_WithNonExistentAddress_ReturnsNotFound()
    {
        // Arrange
        var dto = new UpdateBillingAddressDto
        {
            Street = "New Street",
            City = "Madrid",
            PostalCode = "28001",
            Country = "ES"
        };

        _repositoryMock.Setup(x => x.GetBillingAddressByUserIdAsync(_userId))
            .ReturnsAsync((UserAddress?)null);

        // Act
        var result = await _controller.UpdateCurrentUserBillingAddress(dto);

        // Assert
        result.Should().BeOfType<NotFoundObjectResult>();
        _repositoryMock.Verify(x => x.UpdateAsync(It.IsAny<UserAddress>()), Times.Never);
    }

    #endregion

    #region GetCurrentUserBillingAddress Tests

    [Fact]
    public async Task GetCurrentUserBillingAddress_WithExistingAddress_ReturnsOk()
    {
        // Arrange
        var address = new UserAddress
        {
            Id = Guid.NewGuid(),
            UserId = _userId,
            AddressType = AddressType.Billing,
            Street = "Main Street 123",
            City = "Madrid",
            PostalCode = "28001",
            Country = "ES"
        };

        _repositoryMock.Setup(x => x.GetBillingAddressByUserIdAsync(_userId))
            .ReturnsAsync(address);

        // Act
        var result = await _controller.GetCurrentUserBillingAdress();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().BeOfType<UserAddress>();
    }

    [Fact]
    public async Task GetCurrentUserBillingAddress_WithNoAddress_ReturnsNotFound()
    {
        // Arrange
        _repositoryMock.Setup(x => x.GetBillingAddressByUserIdAsync(_userId))
            .ReturnsAsync((UserAddress?)null);

        // Act
        var result = await _controller.GetCurrentUserBillingAdress();

        // Assert
        result.Should().BeOfType<NotFoundResult>();
    }

    #endregion

    #region CreateCurrentUserDeliveryAddress Tests

    [Fact]
    public async Task CreateCurrentUserDeliveryAddress_WithValidData_ReturnsCreated()
    {
        // Arrange
        var dto = new CreateDeliveryAddressDto
        {
            UserId = _userId,
            Name = "Home",
            Street = "Main Street 123",
            City = "Madrid",
            State = "Madrid",
            PostalCode = "28001",
            Country = "ES",
            IsDefault = true
        };

        _repositoryMock.Setup(x => x.CreateAsync(It.IsAny<UserAddress>()))
            .ReturnsAsync((UserAddress ua) => ua);

        // Act
        var result = await _controller.CreateCurrentUserDeliveryAddress(dto);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.StatusCode.Should().Be(201);

        var response = createdResult.Value.Should().BeOfType<DeliveryAddressDetailDto>().Subject;
        response.Name.Should().Be(dto.Name);
        response.Street.Should().Be(dto.Street);
        response.IsDefault.Should().Be(dto.IsDefault);
    }

    [Fact]
    public async Task CreateCurrentUserDeliveryAddress_WithMismatchedUserId_ReturnsUnauthorized()
    {
        // Arrange
        var dto = new CreateDeliveryAddressDto
        {
            UserId = Guid.NewGuid(),
            Name = "Home",
            Street = "Main Street 123",
            City = "Madrid",
            PostalCode = "28001",
            Country = "ES"
        };

        // Act
        var result = await _controller.CreateCurrentUserDeliveryAddress(dto);

        // Assert
        result.Should().BeOfType<UnauthorizedResult>();
    }

    #endregion

    #region UpdateCurrentUserDeliveryAddress Tests

    [Fact]
    public async Task UpdateCurrentUserDeliveryAddress_WithValidData_ReturnsOk()
    {
        // Arrange
        var addressId = Guid.NewGuid();
        var existingAddress = new UserAddress
        {
            Id = addressId,
            UserId = _userId,
            AddressType = AddressType.Delivery,
            Name = "Home",
            Street = "Old Street",
            City = "Madrid",
            PostalCode = "28001",
            Country = "ES",
            IsDefault = false
        };

        var dto = new UpdateDeliveryAddressDto
        {
            Name = "Office",
            Street = "New Street 456",
            City = "Barcelona",
            State = "Barcelona",
            PostalCode = "08001",
            Country = "ES",
            IsDefault = true
        };

        _repositoryMock.Setup(x => x.GetDeliveryAddressByIdAsync(addressId))
            .ReturnsAsync(existingAddress);

        _repositoryMock.Setup(x => x.UpdateAsync(It.IsAny<UserAddress>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.UpdateCurrentUserDeliveryAddress(addressId, dto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<DeliveryAddressDetailDto>().Subject;
        response.Name.Should().Be(dto.Name);
        response.IsDefault.Should().Be(dto.IsDefault);
    }

    [Fact]
    public async Task UpdateCurrentUserDeliveryAddress_WithNonExistentAddress_ReturnsNotFound()
    {
        // Arrange
        var addressId = Guid.NewGuid();
        var dto = new UpdateDeliveryAddressDto
        {
            Name = "Home",
            Street = "New Street",
            City = "Madrid",
            PostalCode = "28001",
            Country = "ES"
        };

        _repositoryMock.Setup(x => x.GetDeliveryAddressByIdAsync(addressId))
            .ReturnsAsync((UserAddress?)null);

        // Act
        var result = await _controller.UpdateCurrentUserDeliveryAddress(addressId, dto);

        // Assert
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task UpdateCurrentUserDeliveryAddress_WithDifferentUser_ReturnsUnauthorized()
    {
        // Arrange
        var addressId = Guid.NewGuid();
        var existingAddress = new UserAddress
        {
            Id = addressId,
            UserId = Guid.NewGuid(), // Different user
            AddressType = AddressType.Delivery,
            Name = "Home",
            Street = "Old Street",
            City = "Madrid",
            PostalCode = "28001",
            Country = "ES"
        };

        var dto = new UpdateDeliveryAddressDto
        {
            Name = "Office",
            Street = "New Street",
            City = "Madrid",
            PostalCode = "28001",
            Country = "ES"
        };

        _repositoryMock.Setup(x => x.GetDeliveryAddressByIdAsync(addressId))
            .ReturnsAsync(existingAddress);

        // Act
        var result = await _controller.UpdateCurrentUserDeliveryAddress(addressId, dto);

        // Assert
        result.Should().BeOfType<UnauthorizedResult>();
        _repositoryMock.Verify(x => x.UpdateAsync(It.IsAny<UserAddress>()), Times.Never);
    }

    #endregion

    #region DeleteCurrentUserDeliveryAddress Tests

    [Fact]
    public async Task DeleteCurrentUserDeliveryAddress_WithValidAddress_ReturnsNoContent()
    {
        // Arrange
        var addressId = Guid.NewGuid();
        var existingAddress = new UserAddress
        {
            Id = addressId,
            UserId = _userId,
            AddressType = AddressType.Delivery,
            Name = "Home",
            Street = "Main Street",
            City = "Madrid",
            PostalCode = "28001",
            Country = "ES"
        };

        _repositoryMock.Setup(x => x.GetDeliveryAddressByIdAsync(addressId))
            .ReturnsAsync(existingAddress);

        _repositoryMock.Setup(x => x.DeleteAsync(It.IsAny<UserAddress>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.DeleteCurrentUserDeliveryAddress(addressId);

        // Assert
        result.Should().BeOfType<NoContentResult>();
        _repositoryMock.Verify(x => x.DeleteAsync(existingAddress), Times.Once);
    }

    [Fact]
    public async Task DeleteCurrentUserDeliveryAddress_WithNonExistentAddress_ReturnsNotFound()
    {
        // Arrange
        var addressId = Guid.NewGuid();

        _repositoryMock.Setup(x => x.GetDeliveryAddressByIdAsync(addressId))
            .ReturnsAsync((UserAddress?)null);

        // Act
        var result = await _controller.DeleteCurrentUserDeliveryAddress(addressId);

        // Assert
        result.Should().BeOfType<NotFoundObjectResult>();
        _repositoryMock.Verify(x => x.DeleteAsync(It.IsAny<UserAddress>()), Times.Never);
    }

    [Fact]
    public async Task DeleteCurrentUserDeliveryAddress_WithDifferentUser_ReturnsUnauthorized()
    {
        // Arrange
        var addressId = Guid.NewGuid();
        var existingAddress = new UserAddress
        {
            Id = addressId,
            UserId = Guid.NewGuid(), // Different user
            AddressType = AddressType.Delivery,
            Name = "Home",
            Street = "Main Street",
            City = "Madrid",
            PostalCode = "28001",
            Country = "ES"
        };

        _repositoryMock.Setup(x => x.GetDeliveryAddressByIdAsync(addressId))
            .ReturnsAsync(existingAddress);

        // Act
        var result = await _controller.DeleteCurrentUserDeliveryAddress(addressId);

        // Assert
        result.Should().BeOfType<UnauthorizedResult>();
        _repositoryMock.Verify(x => x.DeleteAsync(It.IsAny<UserAddress>()), Times.Never);
    }

    #endregion

    #region GetCurrentUserDeliveryAddresses Tests

    [Fact]
    public async Task GetCurrentUserDeliveryAddresses_WithAddresses_ReturnsOk()
    {
        // Arrange
        var addresses = new List<UserAddress>
        {
            new()
            {
                Id = Guid.NewGuid(),
                UserId = _userId,
                AddressType = AddressType.Delivery,
                Name = "Home",
                Street = "Street 1",
                City = "Madrid",
                PostalCode = "28001",
                Country = "ES",
                IsDefault = true
            },
            new()
            {
                Id = Guid.NewGuid(),
                UserId = _userId,
                AddressType = AddressType.Delivery,
                Name = "Office",
                Street = "Street 2",
                City = "Barcelona",
                PostalCode = "08001",
                Country = "ES",
                IsDefault = false
            }
        };

        _repositoryMock.Setup(x => x.GetDeliveryAddressesByUserIdAsync(_userId))
            .ReturnsAsync(addresses);

        // Act
        var result = await _controller.GetCurrentUserDeliveryAdresses();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeAssignableTo<IEnumerable<UserAddress>>().Subject;
        response.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetCurrentUserDeliveryAddresses_WithNoAddresses_ReturnsNotFound()
    {
        // Arrange
        _repositoryMock.Setup(x => x.GetDeliveryAddressesByUserIdAsync(_userId))
            .ReturnsAsync(new List<UserAddress>());

        // Act
        var result = await _controller.GetCurrentUserDeliveryAdresses();

        // Assert
        result.Should().BeOfType<NotFoundResult>();
    }

    #endregion
}
