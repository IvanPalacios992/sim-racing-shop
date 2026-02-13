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

public class UserControllerTests
{
    private readonly Mock<IUserRepository> _repositoryMock;
    private readonly Mock<ILogger<UserController>> _loggerMock;
    private readonly UserController _controller;
    private readonly Guid _userId;

    public UserControllerTests()
    {
        _repositoryMock = new Mock<IUserRepository>();
        _loggerMock = new Mock<ILogger<UserController>>();
        _controller = new UserController(_repositoryMock.Object, _loggerMock.Object);
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

    #region UpdateCurrentUserAddress Tests

    [Fact]
    public async Task UpdateCurrentUserAddress_WithValidData_ReturnsOk()
    {
        // Arrange
        var existingUser = new User
        {
            Id = _userId,
            Email = "old@example.com",
            FirstName = "Old",
            LastName = "Name",
            Language = "es"
        };

        var dto = new UpdateUserDto
        {
            Email = "new@example.com",
            FirstName = "New",
            LastName = "Updated",
            Language = "en",
            EmailVerified = true
        };

        _repositoryMock.Setup(x => x.GetUserByIdAsync(_userId))
            .ReturnsAsync(existingUser);

        _repositoryMock.Setup(x => x.UpdateAsync(It.IsAny<User>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.UpdateCurrentUserAddress(dto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<UserDetailDto>().Subject;
        response.Email.Should().Be(dto.Email);
        response.FirstName.Should().Be(dto.FirstName);
        response.LastName.Should().Be(dto.LastName);

        _repositoryMock.Verify(x => x.UpdateAsync(It.Is<User>(
            u => u.Email == dto.Email &&
                 u.FirstName == dto.FirstName &&
                 u.LastName == dto.LastName
        )), Times.Once);
    }

    [Fact]
    public async Task UpdateCurrentUserAddress_WithNonExistentUser_ReturnsNotFound()
    {
        // Arrange
        var dto = new UpdateUserDto
        {
            Email = "new@example.com",
            FirstName = "New",
            LastName = "User",
            Language = "es",
            EmailVerified = false
        };

        _repositoryMock.Setup(x => x.GetUserByIdAsync(_userId))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _controller.UpdateCurrentUserAddress(dto);

        // Assert
        var notFoundResult = result.Should().BeOfType<NotFoundObjectResult>().Subject;
        notFoundResult.Value.Should().BeEquivalentTo(new { message = "Usuario no encontrado" });

        _repositoryMock.Verify(x => x.UpdateAsync(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task UpdateCurrentUserAddress_WithNoAuth_ReturnsUnauthorized()
    {
        // Arrange
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(new ClaimsIdentity()) }
        };

        var dto = new UpdateUserDto
        {
            Email = "new@example.com",
            FirstName = "New",
            LastName = "User",
            Language = "es",
            EmailVerified = false
        };

        // Act
        var result = await _controller.UpdateCurrentUserAddress(dto);

        // Assert
        result.Should().BeOfType<UnauthorizedResult>();
        _repositoryMock.Verify(x => x.GetUserByIdAsync(It.IsAny<Guid>()), Times.Never);
    }

    [Fact]
    public async Task UpdateCurrentUserAddress_WithInvalidUserId_ReturnsUnauthorized()
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

        var dto = new UpdateUserDto
        {
            Email = "new@example.com",
            FirstName = "New",
            LastName = "User",
            Language = "es",
            EmailVerified = false
        };

        // Act
        var result = await _controller.UpdateCurrentUserAddress(dto);

        // Assert
        result.Should().BeOfType<UnauthorizedResult>();
    }

    #endregion

    #region DeleteCurrentUser Tests

    [Fact]
    public async Task DeleteCurrentUser_WithExistingUser_ReturnsNoContent()
    {
        // Arrange
        var existingUser = new User
        {
            Id = _userId,
            Email = "test@example.com",
            FirstName = "Test",
            LastName = "User",
            Language = "es"
        };

        _repositoryMock.Setup(x => x.GetUserByIdAsync(_userId))
            .ReturnsAsync(existingUser);

        _repositoryMock.Setup(x => x.DeleteAsync(It.IsAny<User>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.DeleteCurrentUser();

        // Assert
        result.Should().BeOfType<NoContentResult>();
        _repositoryMock.Verify(x => x.DeleteAsync(existingUser), Times.Once);
    }

    [Fact]
    public async Task DeleteCurrentUser_WithNonExistentUser_ReturnsNotFound()
    {
        // Arrange
        _repositoryMock.Setup(x => x.GetUserByIdAsync(_userId))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _controller.DeleteCurrentUser();

        // Assert
        var notFoundResult = result.Should().BeOfType<NotFoundObjectResult>().Subject;
        notFoundResult.Value.Should().BeEquivalentTo(new { message = "Usuario no encontrado" });

        _repositoryMock.Verify(x => x.DeleteAsync(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task DeleteCurrentUser_WithNoAuth_ReturnsUnauthorized()
    {
        // Arrange
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(new ClaimsIdentity()) }
        };

        // Act
        var result = await _controller.DeleteCurrentUser();

        // Assert
        result.Should().BeOfType<UnauthorizedResult>();
        _repositoryMock.Verify(x => x.GetUserByIdAsync(It.IsAny<Guid>()), Times.Never);
    }

    [Fact]
    public async Task DeleteCurrentUser_LogsInformation()
    {
        // Arrange
        var existingUser = new User
        {
            Id = _userId,
            Email = "test@example.com",
            FirstName = "Test",
            LastName = "User",
            Language = "es"
        };

        _repositoryMock.Setup(x => x.GetUserByIdAsync(_userId))
            .ReturnsAsync(existingUser);

        _repositoryMock.Setup(x => x.DeleteAsync(It.IsAny<User>()))
            .Returns(Task.CompletedTask);

        // Act
        await _controller.DeleteCurrentUser();

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Deleting user")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);

        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("User deleted")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    #endregion
}
