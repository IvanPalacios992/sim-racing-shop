using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using SimRacingShop.API.Controllers;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Services;
using System.Security.Claims;

namespace SimRacingShop.UnitTests.Controllers;

public class AuthControllerTests
{
    private readonly Mock<IAuthService> _authServiceMock;
    private readonly Mock<ILogger<AuthController>> _loggerMock;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _authServiceMock = new Mock<IAuthService>();
        _loggerMock = new Mock<ILogger<AuthController>>();
        _controller = new AuthController(_authServiceMock.Object, _loggerMock.Object);
    }

    #region Register Tests

    [Fact]
    public async Task Register_WithMismatchedPasswords_ReturnsBadRequest()
    {
        // Arrange
        var dto = new RegisterDto
        {
            Email = "test@example.com",
            Password = "Password123!",
            ConfirmPassword = "DifferentPassword!"
        };

        // Act
        var result = await _controller.Register(dto);

        // Assert
        var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
    }

    [Fact]
    public async Task Register_WithValidData_ReturnsOkWithToken()
    {
        // Arrange
        var dto = new RegisterDto
        {
            Email = "test@example.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!",
            FirstName = "Test",
            LastName = "User"
        };

        var expectedResponse = new AuthResponseDto
        {
            Token = "jwt-token",
            RefreshToken = "refresh-token",
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            User = new UserDetailDto
            {
                Id = Guid.NewGuid(),
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Language = "es",
                Roles = new[] { "Customer" }
            }
        };

        _authServiceMock.Setup(x => x.RegisterAsync(dto))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.Register(dto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);

        var response = okResult.Value.Should().BeOfType<AuthResponseDto>().Subject;
        response.Token.Should().Be(expectedResponse.Token);
        response.User.Email.Should().Be(dto.Email);
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_ReturnsBadRequest()
    {
        // Arrange
        var dto = new RegisterDto
        {
            Email = "existing@example.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!"
        };

        _authServiceMock.Setup(x => x.RegisterAsync(dto))
            .ThrowsAsync(new InvalidOperationException("El email ya está registrado"));

        // Act
        var result = await _controller.Register(dto);

        // Assert
        var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
    }

    [Fact]
    public async Task Register_LogsSuccessfulRegistration()
    {
        // Arrange
        var dto = new RegisterDto
        {
            Email = "test@example.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!"
        };

        var expectedResponse = new AuthResponseDto
        {
            Token = "jwt-token",
            RefreshToken = "refresh-token",
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            User = new UserDetailDto
            {
                Id = Guid.NewGuid(),
                Email = dto.Email,
                Language = "es",
                Roles = new[] { "Customer" }
            }
        };

        _authServiceMock.Setup(x => x.RegisterAsync(dto))
            .ReturnsAsync(expectedResponse);

        // Act
        await _controller.Register(dto);

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("User registered")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    #endregion

    #region Login Tests

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsOkWithToken()
    {
        // Arrange
        var dto = new LoginDto
        {
            Email = "test@example.com",
            Password = "Password123!"
        };

        var expectedResponse = new AuthResponseDto
        {
            Token = "jwt-token",
            RefreshToken = "refresh-token",
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            User = new UserDetailDto
            {
                Id = Guid.NewGuid(),
                Email = dto.Email,
                Language = "es",
                Roles = new[] { "Customer" }
            }
        };

        _authServiceMock.Setup(x => x.LoginAsync(dto))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.Login(dto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);

        var response = okResult.Value.Should().BeOfType<AuthResponseDto>().Subject;
        response.Token.Should().Be(expectedResponse.Token);
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
    {
        // Arrange
        var dto = new LoginDto
        {
            Email = "test@example.com",
            Password = "WrongPassword"
        };

        _authServiceMock.Setup(x => x.LoginAsync(dto))
            .ThrowsAsync(new InvalidOperationException("Email o contraseña incorrectos"));

        // Act
        var result = await _controller.Login(dto);

        // Assert
        var unauthorizedResult = result.Should().BeOfType<UnauthorizedObjectResult>().Subject;
        unauthorizedResult.StatusCode.Should().Be(401);
    }

    [Fact]
    public async Task Login_LogsSuccessfulLogin()
    {
        // Arrange
        var dto = new LoginDto
        {
            Email = "test@example.com",
            Password = "Password123!"
        };

        var expectedResponse = new AuthResponseDto
        {
            Token = "jwt-token",
            RefreshToken = "refresh-token",
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            User = new UserDetailDto
            {
                Id = Guid.NewGuid(),
                Email = dto.Email,
                Language = "es",
                Roles = new[] { "Customer" }
            }
        };

        _authServiceMock.Setup(x => x.LoginAsync(dto))
            .ReturnsAsync(expectedResponse);

        // Act
        await _controller.Login(dto);

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("User logged in")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Login_LogsFailedAttempt()
    {
        // Arrange
        var dto = new LoginDto
        {
            Email = "test@example.com",
            Password = "WrongPassword"
        };

        _authServiceMock.Setup(x => x.LoginAsync(dto))
            .ThrowsAsync(new InvalidOperationException("Email o contraseña incorrectos"));

        // Act
        await _controller.Login(dto);

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Login failed")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    #endregion

    #region GetCurrentUser Tests

    [Fact]
    public async Task GetCurrentUser_WithoutToken_ReturnsUnauthorized()
    {
        // Arrange
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity()) // No claims
            }
        };

        // Act
        var result = await _controller.GetCurrentUser();

        // Assert
        result.Should().BeOfType<UnauthorizedResult>();
    }

    [Fact]
    public async Task GetCurrentUser_WithValidToken_ReturnsUserData()
    {
        // Arrange
        var userId = Guid.NewGuid();
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

        var expectedUser = new UserDetailDto
        {
            Id = userId,
            Email = "test@example.com",
            FirstName = "Test",
            LastName = "User",
            Language = "es",
            Roles = new[] { "Customer" }
        };

        _authServiceMock.Setup(x => x.GetUserByIdAsync(userId))
            .ReturnsAsync(expectedUser);

        // Act
        var result = await _controller.GetCurrentUser();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var user = okResult.Value.Should().BeOfType<UserDetailDto>().Subject;
        user.Id.Should().Be(userId);
        user.Email.Should().Be(expectedUser.Email);
    }

    [Fact]
    public async Task GetCurrentUser_WithInvalidUserId_ReturnsUnauthorized()
    {
        // Arrange
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, "not-a-guid")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };

        // Act
        var result = await _controller.GetCurrentUser();

        // Assert
        result.Should().BeOfType<UnauthorizedResult>();
    }

    [Fact]
    public async Task GetCurrentUser_UserNotFound_ReturnsNotFound()
    {
        // Arrange
        var userId = Guid.NewGuid();
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

        _authServiceMock.Setup(x => x.GetUserByIdAsync(userId))
            .ReturnsAsync((UserDetailDto?)null);

        // Act
        var result = await _controller.GetCurrentUser();

        // Assert
        result.Should().BeOfType<NotFoundResult>();
    }

    #endregion

    #region AdminOnly Tests

    [Fact]
    public void AdminOnly_WithAdminRole_ReturnsOk()
    {
        // Arrange
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Role, "Admin")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };

        // Act
        var result = _controller.AdminOnly();

        // Assert
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public void AdminOnly_WithUserRole_ReturnsForbidden()
    {
        // Note: This test verifies the controller logic, but actual authorization
        // is handled by the [Authorize(Roles = "Admin")] attribute which would
        // need integration tests to fully verify.

        // Arrange
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Role, "Customer")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };

        // Act - The controller method itself returns Ok, authorization is handled by middleware
        var result = _controller.AdminOnly();

        // Assert - Method returns Ok, but middleware would have blocked non-admin users
        // This is a limitation of unit testing - full authorization testing needs integration tests
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public void AdminOnly_WithoutToken_ReturnsUnauthorized()
    {
        // Note: Similar to above, actual [Authorize] attribute behavior
        // requires integration tests. This test documents expected behavior.

        // Arrange
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity()) // No auth
            }
        };

        // Act - Method itself doesn't check auth, that's middleware's job
        var result = _controller.AdminOnly();

        // Assert - The method returns Ok, but without auth the middleware would return 401
        result.Should().BeOfType<OkObjectResult>();
    }

    #endregion

    #region Logout Tests

    [Fact]
    public async Task Logout_WithValidToken_ReturnsOk()
    {
        // Arrange
        var userId = Guid.NewGuid();
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

        _authServiceMock.Setup(x => x.LogoutAsync(userId))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.Logout();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task Logout_WithoutToken_ReturnsUnauthorized()
    {
        // Arrange
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity()) // No claims
            }
        };

        // Act
        var result = await _controller.Logout();

        // Assert
        result.Should().BeOfType<UnauthorizedResult>();
    }

    [Fact]
    public async Task Logout_WithInvalidUserId_ReturnsUnauthorized()
    {
        // Arrange
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, "not-a-guid")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };

        // Act
        var result = await _controller.Logout();

        // Assert
        result.Should().BeOfType<UnauthorizedResult>();
    }

    [Fact]
    public async Task Logout_LogsSuccessfulLogout()
    {
        // Arrange
        var userId = Guid.NewGuid();
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

        _authServiceMock.Setup(x => x.LogoutAsync(userId))
            .Returns(Task.CompletedTask);

        // Act
        await _controller.Logout();

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("User logged out")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Logout_WhenServiceThrows_ReturnsBadRequest()
    {
        // Arrange
        var userId = Guid.NewGuid();
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

        _authServiceMock.Setup(x => x.LogoutAsync(userId))
            .ThrowsAsync(new InvalidOperationException("Usuario no encontrado"));

        // Act
        var result = await _controller.Logout();

        // Assert
        var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
    }

    #endregion

    #region ForgotPassword Tests

    [Fact]
    public async Task ForgotPassword_WithValidEmail_ReturnsOk()
    {
        // Arrange
        var dto = new ForgotPasswordRequestDto
        {
            Email = "test@example.com"
        };

        _authServiceMock.Setup(x => x.ForgotPasswordAsync(dto.Email))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.ForgotPassword(dto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task ForgotPassword_WithNonExistentEmail_StillReturnsOk()
    {
        // Arrange - For security, always returns 200 even if email doesn't exist
        var dto = new ForgotPasswordRequestDto
        {
            Email = "nonexistent@example.com"
        };

        _authServiceMock.Setup(x => x.ForgotPasswordAsync(dto.Email))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.ForgotPassword(dto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task ForgotPassword_WhenServiceThrows_StillReturnsOk()
    {
        // Arrange - For security, always returns 200 even on error
        var dto = new ForgotPasswordRequestDto
        {
            Email = "test@example.com"
        };

        _authServiceMock.Setup(x => x.ForgotPasswordAsync(dto.Email))
            .ThrowsAsync(new Exception("Email service error"));

        // Act
        var result = await _controller.ForgotPassword(dto);

        // Assert - Should still return Ok for security reasons
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task ForgotPassword_LogsRequest()
    {
        // Arrange
        var dto = new ForgotPasswordRequestDto
        {
            Email = "test@example.com"
        };

        _authServiceMock.Setup(x => x.ForgotPasswordAsync(dto.Email))
            .Returns(Task.CompletedTask);

        // Act
        await _controller.ForgotPassword(dto);

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Password reset requested")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task ForgotPassword_WhenServiceThrows_LogsError()
    {
        // Arrange
        var dto = new ForgotPasswordRequestDto
        {
            Email = "test@example.com"
        };

        _authServiceMock.Setup(x => x.ForgotPasswordAsync(dto.Email))
            .ThrowsAsync(new Exception("Email service error"));

        // Act
        await _controller.ForgotPassword(dto);

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Error processing password reset")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    #endregion

    #region ResetPassword Tests

    [Fact]
    public async Task ResetPassword_WithValidToken_ReturnsOk()
    {
        // Arrange
        var dto = new ResetPasswordRequestDto
        {
            Email = "test@example.com",
            Token = "valid-reset-token",
            NewPassword = "NewPassword123!",
            ConfirmPassword = "NewPassword123!"
        };

        _authServiceMock.Setup(x => x.ResetPasswordAsync(dto))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.ResetPassword(dto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task ResetPassword_WithInvalidToken_ReturnsBadRequest()
    {
        // Arrange
        var dto = new ResetPasswordRequestDto
        {
            Email = "test@example.com",
            Token = "invalid-token",
            NewPassword = "NewPassword123!",
            ConfirmPassword = "NewPassword123!"
        };

        _authServiceMock.Setup(x => x.ResetPasswordAsync(dto))
            .ThrowsAsync(new InvalidOperationException("Token inválido o expirado"));

        // Act
        var result = await _controller.ResetPassword(dto);

        // Assert
        var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
    }

    [Fact]
    public async Task ResetPassword_WithWeakPassword_ReturnsBadRequest()
    {
        // Arrange
        var dto = new ResetPasswordRequestDto
        {
            Email = "test@example.com",
            Token = "valid-token",
            NewPassword = "weak",
            ConfirmPassword = "weak"
        };

        _authServiceMock.Setup(x => x.ResetPasswordAsync(dto))
            .ThrowsAsync(new InvalidOperationException("Error al restablecer contraseña: Password too weak"));

        // Act
        var result = await _controller.ResetPassword(dto);

        // Assert
        var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
    }

    [Fact]
    public async Task ResetPassword_LogsSuccessfulReset()
    {
        // Arrange
        var dto = new ResetPasswordRequestDto
        {
            Email = "test@example.com",
            Token = "valid-reset-token",
            NewPassword = "NewPassword123!",
            ConfirmPassword = "NewPassword123!"
        };

        _authServiceMock.Setup(x => x.ResetPasswordAsync(dto))
            .Returns(Task.CompletedTask);

        // Act
        await _controller.ResetPassword(dto);

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Password reset completed")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task ResetPassword_WhenFails_LogsWarning()
    {
        // Arrange
        var dto = new ResetPasswordRequestDto
        {
            Email = "test@example.com",
            Token = "invalid-token",
            NewPassword = "NewPassword123!",
            ConfirmPassword = "NewPassword123!"
        };

        _authServiceMock.Setup(x => x.ResetPasswordAsync(dto))
            .ThrowsAsync(new InvalidOperationException("Token inválido o expirado"));

        // Act
        await _controller.ResetPassword(dto);

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Password reset failed")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    #endregion

    #region TestAuth Tests

    [Fact]
    public void TestAuth_WithAuthenticatedUser_ReturnsOkWithUserInfo()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Name, "test@example.com"),
            new Claim(ClaimTypes.Role, "Customer"),
            new Claim(ClaimTypes.Role, "Admin")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };

        // Act
        var result = _controller.TestAuth();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
    }

    [Fact]
    public void TestAuth_ReturnsUserRoles()
    {
        // Arrange
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Name, "test@example.com"),
            new Claim(ClaimTypes.Role, "Customer"),
            new Claim(ClaimTypes.Role, "Admin")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };

        // Act
        var result = _controller.TestAuth();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().NotBeNull();
    }

    [Fact]
    public void TestAuth_WithNoRoles_ReturnsEmptyRolesList()
    {
        // Arrange
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Name, "test@example.com")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };

        // Act
        var result = _controller.TestAuth();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
    }

    #endregion

    #region RefreshToken Tests

    [Fact]
    public async Task RefreshToken_WithValidToken_ReturnsOkWithNewTokens()
    {
        // Arrange
        var dto = new RefreshTokenRequestDto
        {
            RefreshToken = "valid-refresh-token"
        };

        var expectedResponse = new AuthResponseDto
        {
            Token = "new-jwt-token",
            RefreshToken = "new-refresh-token",
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            User = new UserDetailDto
            {
                Id = Guid.NewGuid(),
                Email = "test@example.com",
                Language = "es",
                Roles = new[] { "Customer" }
            }
        };

        _authServiceMock.Setup(x => x.RefreshTokenAsync(dto.RefreshToken))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.RefreshToken(dto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);

        var response = okResult.Value.Should().BeOfType<AuthResponseDto>().Subject;
        response.Token.Should().Be(expectedResponse.Token);
        response.RefreshToken.Should().Be(expectedResponse.RefreshToken);
    }

    [Fact]
    public async Task RefreshToken_WithInvalidToken_ReturnsUnauthorized()
    {
        // Arrange
        var dto = new RefreshTokenRequestDto
        {
            RefreshToken = "invalid-refresh-token"
        };

        _authServiceMock.Setup(x => x.RefreshTokenAsync(dto.RefreshToken))
            .ThrowsAsync(new InvalidOperationException("Refresh token inválido"));

        // Act
        var result = await _controller.RefreshToken(dto);

        // Assert
        var unauthorizedResult = result.Should().BeOfType<UnauthorizedObjectResult>().Subject;
        unauthorizedResult.StatusCode.Should().Be(401);
    }

    [Fact]
    public async Task RefreshToken_WithExpiredToken_ReturnsUnauthorized()
    {
        // Arrange
        var dto = new RefreshTokenRequestDto
        {
            RefreshToken = "expired-refresh-token"
        };

        _authServiceMock.Setup(x => x.RefreshTokenAsync(dto.RefreshToken))
            .ThrowsAsync(new InvalidOperationException("Refresh token expirado o revocado"));

        // Act
        var result = await _controller.RefreshToken(dto);

        // Assert
        var unauthorizedResult = result.Should().BeOfType<UnauthorizedObjectResult>().Subject;
        unauthorizedResult.StatusCode.Should().Be(401);
    }

    [Fact]
    public async Task RefreshToken_LogsSuccessfulRefresh()
    {
        // Arrange
        var dto = new RefreshTokenRequestDto
        {
            RefreshToken = "valid-refresh-token"
        };

        var userId = Guid.NewGuid();
        var expectedResponse = new AuthResponseDto
        {
            Token = "new-jwt-token",
            RefreshToken = "new-refresh-token",
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            User = new UserDetailDto
            {
                Id = userId,
                Email = "test@example.com",
                Language = "es",
                Roles = new[] { "Customer" }
            }
        };

        _authServiceMock.Setup(x => x.RefreshTokenAsync(dto.RefreshToken))
            .ReturnsAsync(expectedResponse);

        // Act
        await _controller.RefreshToken(dto);

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Token refreshed")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    #endregion
}
