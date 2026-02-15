using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using SimRacingShop.API.Controllers;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Repositories;
using System.Security.Claims;

namespace SimRacingShop.UnitTests.Controllers;

public class CommunicationPreferencesControllerTests
{
    private readonly Mock<IUserCommunicationPreferencesRepository> _repositoryMock;
    private readonly Mock<ILogger<CommunicationPreferences>> _loggerMock;
    private readonly CommunicationPreferences _controller;
    private readonly Guid _userId;

    public CommunicationPreferencesControllerTests()
    {
        _repositoryMock = new Mock<IUserCommunicationPreferencesRepository>();
        _loggerMock = new Mock<ILogger<CommunicationPreferences>>();
        _controller = new CommunicationPreferences(_repositoryMock.Object, _loggerMock.Object);
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

    #region GetCommunicationPreferences Tests

    [Fact]
    public async Task GetCommunicationPreferences_WithExistingPreferences_ReturnsOk()
    {
        // Arrange
        var existingPreferences = new UserCommunicationPreferences
        {
            Id = Guid.NewGuid(),
            UserId = _userId,
            Newsletter = true,
            OrderNotifications = false,
            SmsPromotions = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _repositoryMock.Setup(x => x.GetByUserIdAsync(_userId))
            .ReturnsAsync(existingPreferences);

        // Act
        var result = await _controller.GetCommunicationPreferences();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<UserCommunicationPreferencesDto>().Subject;
        response.Newsletter.Should().BeTrue();
        response.OrderNotifications.Should().BeFalse();
        response.SmsPromotions.Should().BeTrue();

        _repositoryMock.Verify(x => x.CreateAsync(It.IsAny<UserCommunicationPreferences>()), Times.Never);
    }

    [Fact]
    public async Task GetCommunicationPreferences_WithNoPreferences_CreatesDefaultAndReturnsOk()
    {
        // Arrange
        _repositoryMock.Setup(x => x.GetByUserIdAsync(_userId))
            .ReturnsAsync((UserCommunicationPreferences?)null);

        _repositoryMock.Setup(x => x.CreateAsync(It.IsAny<UserCommunicationPreferences>()))
            .ReturnsAsync((UserCommunicationPreferences prefs) => prefs);

        // Act
        var result = await _controller.GetCommunicationPreferences();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<UserCommunicationPreferencesDto>().Subject;

        // Verificar valores por defecto
        response.Newsletter.Should().BeFalse();
        response.OrderNotifications.Should().BeTrue(); // Activo por defecto
        response.SmsPromotions.Should().BeFalse();

        _repositoryMock.Verify(x => x.CreateAsync(It.Is<UserCommunicationPreferences>(
            p => p.UserId == _userId &&
                 p.Newsletter == false &&
                 p.OrderNotifications == true &&
                 p.SmsPromotions == false
        )), Times.Once);
    }

    [Fact]
    public async Task GetCommunicationPreferences_WithNoAuth_ReturnsUnauthorized()
    {
        // Arrange
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(new ClaimsIdentity()) }
        };

        // Act
        var result = await _controller.GetCommunicationPreferences();

        // Assert
        result.Should().BeOfType<UnauthorizedResult>();
        _repositoryMock.Verify(x => x.GetByUserIdAsync(It.IsAny<Guid>()), Times.Never);
    }

    [Fact]
    public async Task GetCommunicationPreferences_WithInvalidUserId_ReturnsUnauthorized()
    {
        // Arrange
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, "invalid-guid")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };

        // Act
        var result = await _controller.GetCommunicationPreferences();

        // Assert
        result.Should().BeOfType<UnauthorizedResult>();
        _repositoryMock.Verify(x => x.GetByUserIdAsync(It.IsAny<Guid>()), Times.Never);
    }

    [Fact]
    public async Task GetCommunicationPreferences_LogsInformation()
    {
        // Arrange
        var existingPreferences = new UserCommunicationPreferences
        {
            Id = Guid.NewGuid(),
            UserId = _userId,
            Newsletter = false,
            OrderNotifications = true,
            SmsPromotions = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _repositoryMock.Setup(x => x.GetByUserIdAsync(_userId))
            .ReturnsAsync(existingPreferences);

        // Act
        await _controller.GetCommunicationPreferences();

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Getting communication preferences")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    #endregion

    #region UpdateCommunicationPreferences Tests

    [Fact]
    public async Task UpdateCommunicationPreferences_WithExistingPreferences_UpdatesAndReturnsOk()
    {
        // Arrange
        var existingPreferences = new UserCommunicationPreferences
        {
            Id = Guid.NewGuid(),
            UserId = _userId,
            Newsletter = false,
            OrderNotifications = true,
            SmsPromotions = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var dto = new UserCommunicationPreferencesDto
        {
            Newsletter = true,
            OrderNotifications = false,
            SmsPromotions = true
        };

        _repositoryMock.Setup(x => x.GetByUserIdAsync(_userId))
            .ReturnsAsync(existingPreferences);

        _repositoryMock.Setup(x => x.UpdateAsync(It.IsAny<UserCommunicationPreferences>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.UpdateCommunicationPreferences(dto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<UserCommunicationPreferencesDto>().Subject;
        response.Newsletter.Should().BeTrue();
        response.OrderNotifications.Should().BeFalse();
        response.SmsPromotions.Should().BeTrue();

        _repositoryMock.Verify(x => x.UpdateAsync(It.Is<UserCommunicationPreferences>(
            p => p.Newsletter == dto.Newsletter &&
                 p.OrderNotifications == dto.OrderNotifications &&
                 p.SmsPromotions == dto.SmsPromotions
        )), Times.Once);

        _repositoryMock.Verify(x => x.CreateAsync(It.IsAny<UserCommunicationPreferences>()), Times.Never);
    }

    [Fact]
    public async Task UpdateCommunicationPreferences_WithNoPreferences_CreatesAndReturnsOk()
    {
        // Arrange
        var dto = new UserCommunicationPreferencesDto
        {
            Newsletter = true,
            OrderNotifications = false,
            SmsPromotions = true
        };

        _repositoryMock.Setup(x => x.GetByUserIdAsync(_userId))
            .ReturnsAsync((UserCommunicationPreferences?)null);

        _repositoryMock.Setup(x => x.CreateAsync(It.IsAny<UserCommunicationPreferences>()))
            .ReturnsAsync((UserCommunicationPreferences prefs) => prefs);

        // Act
        var result = await _controller.UpdateCommunicationPreferences(dto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<UserCommunicationPreferencesDto>().Subject;
        response.Newsletter.Should().BeTrue();
        response.OrderNotifications.Should().BeFalse();
        response.SmsPromotions.Should().BeTrue();

        _repositoryMock.Verify(x => x.CreateAsync(It.Is<UserCommunicationPreferences>(
            p => p.UserId == _userId &&
                 p.Newsletter == dto.Newsletter &&
                 p.OrderNotifications == dto.OrderNotifications &&
                 p.SmsPromotions == dto.SmsPromotions
        )), Times.Once);

        _repositoryMock.Verify(x => x.UpdateAsync(It.IsAny<UserCommunicationPreferences>()), Times.Never);
    }

    [Fact]
    public async Task UpdateCommunicationPreferences_WithNoAuth_ReturnsUnauthorized()
    {
        // Arrange
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(new ClaimsIdentity()) }
        };

        var dto = new UserCommunicationPreferencesDto
        {
            Newsletter = true,
            OrderNotifications = true,
            SmsPromotions = false
        };

        // Act
        var result = await _controller.UpdateCommunicationPreferences(dto);

        // Assert
        result.Should().BeOfType<UnauthorizedResult>();
        _repositoryMock.Verify(x => x.GetByUserIdAsync(It.IsAny<Guid>()), Times.Never);
    }

    [Fact]
    public async Task UpdateCommunicationPreferences_WithInvalidUserId_ReturnsUnauthorized()
    {
        // Arrange
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, "invalid-guid")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };

        var dto = new UserCommunicationPreferencesDto
        {
            Newsletter = true,
            OrderNotifications = true,
            SmsPromotions = false
        };

        // Act
        var result = await _controller.UpdateCommunicationPreferences(dto);

        // Assert
        result.Should().BeOfType<UnauthorizedResult>();
        _repositoryMock.Verify(x => x.GetByUserIdAsync(It.IsAny<Guid>()), Times.Never);
    }

    [Fact]
    public async Task UpdateCommunicationPreferences_LogsInformation()
    {
        // Arrange
        var existingPreferences = new UserCommunicationPreferences
        {
            Id = Guid.NewGuid(),
            UserId = _userId,
            Newsletter = false,
            OrderNotifications = true,
            SmsPromotions = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var dto = new UserCommunicationPreferencesDto
        {
            Newsletter = true,
            OrderNotifications = false,
            SmsPromotions = true
        };

        _repositoryMock.Setup(x => x.GetByUserIdAsync(_userId))
            .ReturnsAsync(existingPreferences);

        _repositoryMock.Setup(x => x.UpdateAsync(It.IsAny<UserCommunicationPreferences>()))
            .Returns(Task.CompletedTask);

        // Act
        await _controller.UpdateCommunicationPreferences(dto);

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Updating communication preferences")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);

        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Communication preferences updated")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    #endregion
}
