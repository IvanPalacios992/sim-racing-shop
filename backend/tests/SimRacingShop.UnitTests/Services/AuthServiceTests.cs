using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Moq;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Settings;
using SimRacingShop.Infrastructure.Data;
using SimRacingShop.Infrastructure.Services;
using System.IdentityModel.Tokens.Jwt;

namespace SimRacingShop.UnitTests.Services;

public class AuthServiceTests : IDisposable
{
    private readonly Mock<UserManager<User>> _userManagerMock;
    private readonly Mock<SignInManager<User>> _signInManagerMock;
    private readonly ApplicationDbContext _context;
    private readonly IOptions<JwtSettings> _jwtSettings;
    private readonly Mock<IEmailService> _emailServiceMock;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _userManagerMock = CreateUserManagerMock();
        _signInManagerMock = CreateSignInManagerMock(_userManagerMock.Object);
        _emailServiceMock = new Mock<IEmailService>();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);

        _jwtSettings = Options.Create(new JwtSettings
        {
            Secret = "super-secret-key-for-testing-purposes-min-32-chars",
            Issuer = "TestIssuer",
            Audience = "TestAudience",
            ExpiryMinutes = 60,
            RefreshTokenExpiryDays = 7
        });

        _authService = new AuthService(
            _userManagerMock.Object,
            _signInManagerMock.Object,
            _context,
            _jwtSettings,
            _emailServiceMock.Object);
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    #region RegisterAsync Tests

    [Fact]
    public async Task Register_WithValidData_ReturnsTokenAndUser()
    {
        // Arrange
        var dto = new RegisterDto
        {
            Email = "test@example.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!",
            FirstName = "Test",
            LastName = "User",
            Language = "es"
        };

        _userManagerMock.Setup(x => x.FindByEmailAsync(dto.Email))
            .ReturnsAsync((User?)null);

        _userManagerMock.Setup(x => x.CreateAsync(It.IsAny<User>(), dto.Password))
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock.Setup(x => x.AddToRoleAsync(It.IsAny<User>(), "Customer"))
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock.Setup(x => x.GetRolesAsync(It.IsAny<User>()))
            .ReturnsAsync(new List<string> { "Customer" });

        // Act
        var result = await _authService.RegisterAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().NotBeNullOrEmpty();
        result.RefreshToken.Should().NotBeNullOrEmpty();
        result.User.Should().NotBeNull();
        result.User.Email.Should().Be(dto.Email);
        result.ExpiresAt.Should().BeAfter(DateTime.UtcNow);
    }

    [Fact]
    public async Task Register_WithExistingEmail_ThrowsInvalidOperationException()
    {
        // Arrange
        var dto = new RegisterDto
        {
            Email = "existing@example.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!"
        };

        var existingUser = new User { Email = dto.Email };
        _userManagerMock.Setup(x => x.FindByEmailAsync(dto.Email))
            .ReturnsAsync(existingUser);

        // Act
        var act = () => _authService.RegisterAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*ya está registrado*");
    }

    [Fact]
    public async Task Register_WithWeakPassword_ThrowsInvalidOperationException()
    {
        // Arrange
        var dto = new RegisterDto
        {
            Email = "test@example.com",
            Password = "weak",
            ConfirmPassword = "weak"
        };

        _userManagerMock.Setup(x => x.FindByEmailAsync(dto.Email))
            .ReturnsAsync((User?)null);

        _userManagerMock.Setup(x => x.CreateAsync(It.IsAny<User>(), dto.Password))
            .ReturnsAsync(IdentityResult.Failed(new IdentityError
            {
                Code = "PasswordTooWeak",
                Description = "Password does not meet requirements"
            }));

        // Act
        var act = () => _authService.RegisterAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Error al crear usuario*");
    }

    [Fact]
    public async Task Register_AssignsCustomerRole_ByDefault()
    {
        // Arrange
        var dto = new RegisterDto
        {
            Email = "test@example.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!"
        };

        _userManagerMock.Setup(x => x.FindByEmailAsync(dto.Email))
            .ReturnsAsync((User?)null);

        _userManagerMock.Setup(x => x.CreateAsync(It.IsAny<User>(), dto.Password))
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock.Setup(x => x.AddToRoleAsync(It.IsAny<User>(), "Customer"))
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock.Setup(x => x.GetRolesAsync(It.IsAny<User>()))
            .ReturnsAsync(new List<string> { "Customer" });

        // Act
        await _authService.RegisterAsync(dto);

        // Assert
        _userManagerMock.Verify(x => x.AddToRoleAsync(It.IsAny<User>(), "Customer"), Times.Once);
    }

    [Fact]
    public async Task Register_SetsCreatedAtAndUpdatedAt()
    {
        // Arrange
        var dto = new RegisterDto
        {
            Email = "test@example.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!"
        };

        User? capturedUser = null;

        _userManagerMock.Setup(x => x.FindByEmailAsync(dto.Email))
            .ReturnsAsync((User?)null);

        _userManagerMock.Setup(x => x.CreateAsync(It.IsAny<User>(), dto.Password))
            .Callback<User, string>((user, _) => capturedUser = user)
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock.Setup(x => x.AddToRoleAsync(It.IsAny<User>(), "Customer"))
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock.Setup(x => x.GetRolesAsync(It.IsAny<User>()))
            .ReturnsAsync(new List<string> { "Customer" });

        // Act
        await _authService.RegisterAsync(dto);

        // Assert
        capturedUser.Should().NotBeNull();
        capturedUser!.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        capturedUser.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task Register_TokenContainsCorrectClaims()
    {
        // Arrange
        var dto = new RegisterDto
        {
            Email = "test@example.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!",
            Language = "en"
        };
        var securityStamp = "test-security-stamp";

        _userManagerMock.Setup(x => x.FindByEmailAsync(dto.Email))
            .ReturnsAsync((User?)null);

        _userManagerMock.Setup(x => x.CreateAsync(It.IsAny<User>(), dto.Password))
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock.Setup(x => x.AddToRoleAsync(It.IsAny<User>(), "Customer"))
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock.Setup(x => x.GetRolesAsync(It.IsAny<User>()))
            .ReturnsAsync(new List<string> { "Customer" });

        _userManagerMock.Setup(x => x.GetSecurityStampAsync(It.IsAny<User>()))
            .ReturnsAsync(securityStamp);

        // Act
        var result = await _authService.RegisterAsync(dto);

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var token = handler.ReadJwtToken(result.Token);

        token.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Sub);
        token.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Email && c.Value == dto.Email);
        token.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Jti);
        token.Claims.Should().Contain(c => c.Type == "language" && c.Value == "en");
        token.Claims.Should().Contain(c => c.Type == "security_stamp" && c.Value == securityStamp);
    }

    [Fact]
    public async Task Register_TokenExpiresAtCorrectTime()
    {
        // Arrange
        var dto = new RegisterDto
        {
            Email = "test@example.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!"
        };

        _userManagerMock.Setup(x => x.FindByEmailAsync(dto.Email))
            .ReturnsAsync((User?)null);

        _userManagerMock.Setup(x => x.CreateAsync(It.IsAny<User>(), dto.Password))
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock.Setup(x => x.AddToRoleAsync(It.IsAny<User>(), "Customer"))
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock.Setup(x => x.GetRolesAsync(It.IsAny<User>()))
            .ReturnsAsync(new List<string> { "Customer" });

        // Act
        var result = await _authService.RegisterAsync(dto);

        // Assert
        var expectedExpiry = DateTime.UtcNow.AddMinutes(_jwtSettings.Value.ExpiryMinutes);
        result.ExpiresAt.Should().BeCloseTo(expectedExpiry, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task Register_CreatesRefreshTokenInDatabase()
    {
        // Arrange
        var dto = new RegisterDto
        {
            Email = "test@example.com",
            Password = "Password123!",
            ConfirmPassword = "Password123!"
        };

        _userManagerMock.Setup(x => x.FindByEmailAsync(dto.Email))
            .ReturnsAsync((User?)null);

        _userManagerMock.Setup(x => x.CreateAsync(It.IsAny<User>(), dto.Password))
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock.Setup(x => x.AddToRoleAsync(It.IsAny<User>(), "Customer"))
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock.Setup(x => x.GetRolesAsync(It.IsAny<User>()))
            .ReturnsAsync(new List<string> { "Customer" });

        // Act
        var result = await _authService.RegisterAsync(dto);

        // Assert
        var refreshToken = await _context.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == result.RefreshToken, TestContext.Current.CancellationToken);
        refreshToken.Should().NotBeNull();
        refreshToken!.IsActive.Should().BeTrue();
    }

    #endregion

    #region LoginAsync Tests

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsTokenAndUser()
    {
        // Arrange
        var dto = new LoginDto
        {
            Email = "test@example.com",
            Password = "Password123!"
        };

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = dto.Email,
            UserName = dto.Email,
            FirstName = "Test",
            LastName = "User",
            Language = "es",
            EmailConfirmed = true
        };

        _userManagerMock.Setup(x => x.FindByEmailAsync(dto.Email))
            .ReturnsAsync(user);

        _signInManagerMock.Setup(x => x.CheckPasswordSignInAsync(user, dto.Password, true))
            .ReturnsAsync(SignInResult.Success);

        _userManagerMock.Setup(x => x.GetRolesAsync(user))
            .ReturnsAsync(new List<string> { "Customer" });

        // Act
        var result = await _authService.LoginAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().NotBeNullOrEmpty();
        result.RefreshToken.Should().NotBeNullOrEmpty();
        result.User.Should().NotBeNull();
        result.User.Email.Should().Be(dto.Email);
    }

    [Fact]
    public async Task Login_WithInvalidEmail_ThrowsInvalidOperationException()
    {
        // Arrange
        var dto = new LoginDto
        {
            Email = "nonexistent@example.com",
            Password = "Password123!"
        };

        _userManagerMock.Setup(x => x.FindByEmailAsync(dto.Email))
            .ReturnsAsync((User?)null);

        // Act
        var act = () => _authService.LoginAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Email o contraseña incorrectos*");
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ThrowsInvalidOperationException()
    {
        // Arrange
        var dto = new LoginDto
        {
            Email = "test@example.com",
            Password = "WrongPassword"
        };

        var user = new User { Email = dto.Email };

        _userManagerMock.Setup(x => x.FindByEmailAsync(dto.Email))
            .ReturnsAsync(user);

        _signInManagerMock.Setup(x => x.CheckPasswordSignInAsync(user, dto.Password, true))
            .ReturnsAsync(SignInResult.Failed);

        // Act
        var act = () => _authService.LoginAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Email o contraseña incorrectos*");
    }

    [Fact]
    public async Task Login_WithLockedAccount_ThrowsInvalidOperationException()
    {
        // Arrange
        var dto = new LoginDto
        {
            Email = "locked@example.com",
            Password = "Password123!"
        };

        var user = new User { Email = dto.Email };

        _userManagerMock.Setup(x => x.FindByEmailAsync(dto.Email))
            .ReturnsAsync(user);

        _signInManagerMock.Setup(x => x.CheckPasswordSignInAsync(user, dto.Password, true))
            .ReturnsAsync(SignInResult.LockedOut);

        // Act
        var act = () => _authService.LoginAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*bloqueada*");
    }

    [Fact]
    public async Task Login_IncludesUserRolesInToken()
    {
        // Arrange
        var dto = new LoginDto
        {
            Email = "admin@example.com",
            Password = "Password123!"
        };

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = dto.Email,
            UserName = dto.Email,
            Language = "es"
        };

        _userManagerMock.Setup(x => x.FindByEmailAsync(dto.Email))
            .ReturnsAsync(user);

        _signInManagerMock.Setup(x => x.CheckPasswordSignInAsync(user, dto.Password, true))
            .ReturnsAsync(SignInResult.Success);

        _userManagerMock.Setup(x => x.GetRolesAsync(user))
            .ReturnsAsync(new List<string> { "Admin", "Customer" });

        // Act
        var result = await _authService.LoginAsync(dto);

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var token = handler.ReadJwtToken(result.Token);

        token.Claims.Where(c => c.Type == System.Security.Claims.ClaimTypes.Role)
            .Select(c => c.Value)
            .Should().Contain(new[] { "Admin", "Customer" });
    }

    #endregion

    #region RefreshTokenAsync Tests

    [Fact]
    public async Task RefreshToken_WithValidToken_ReturnsNewTokens()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "test@example.com",
            UserName = "test@example.com",
            Language = "es"
        };

        var existingRefreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            Token = "valid-refresh-token",
            UserId = userId,
            User = user,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow
        };

        _context.RefreshTokens.Add(existingRefreshToken);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        _userManagerMock.Setup(x => x.GetRolesAsync(user))
            .ReturnsAsync(new List<string> { "Customer" });

        _userManagerMock.Setup(x => x.GetSecurityStampAsync(user))
            .ReturnsAsync("security-stamp");

        // Act
        var result = await _authService.RefreshTokenAsync("valid-refresh-token");

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().NotBeNullOrEmpty();
        result.RefreshToken.Should().NotBeNullOrEmpty();
        result.RefreshToken.Should().NotBe("valid-refresh-token");
    }

    [Fact]
    public async Task RefreshToken_WithInvalidToken_ThrowsException()
    {
        // Act
        var act = () => _authService.RefreshTokenAsync("invalid-token");

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Refresh token inválido*");
    }

    [Fact]
    public async Task RefreshToken_WithExpiredToken_ThrowsException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "test@example.com",
            Language = "es"
        };

        var expiredRefreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            Token = "expired-refresh-token",
            UserId = userId,
            User = user,
            ExpiresAt = DateTime.UtcNow.AddDays(-1),
            CreatedAt = DateTime.UtcNow.AddDays(-8)
        };

        _context.RefreshTokens.Add(expiredRefreshToken);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var act = () => _authService.RefreshTokenAsync("expired-refresh-token");

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*expirado o revocado*");
    }

    [Fact]
    public async Task RefreshToken_WithRevokedToken_ThrowsException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "test@example.com",
            Language = "es"
        };

        var revokedRefreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            Token = "revoked-refresh-token",
            UserId = userId,
            User = user,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow,
            RevokedAt = DateTime.UtcNow
        };

        _context.RefreshTokens.Add(revokedRefreshToken);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var act = () => _authService.RefreshTokenAsync("revoked-refresh-token");

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*expirado o revocado*");
    }

    [Fact]
    public async Task RefreshToken_RevokesOldToken()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "test@example.com",
            UserName = "test@example.com",
            Language = "es"
        };

        var existingRefreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            Token = "old-refresh-token",
            UserId = userId,
            User = user,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow
        };

        _context.RefreshTokens.Add(existingRefreshToken);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        _userManagerMock.Setup(x => x.GetRolesAsync(user))
            .ReturnsAsync(new List<string> { "Customer" });

        // Act
        await _authService.RefreshTokenAsync("old-refresh-token");

        // Assert
        var oldToken = await _context.RefreshTokens.FirstAsync(rt => rt.Token == "old-refresh-token", TestContext.Current.CancellationToken);
        oldToken.RevokedAt.Should().NotBeNull();
        oldToken.ReplacedByToken.Should().NotBeNull();
    }

    #endregion

    #region GetUserByIdAsync Tests

    [Fact]
    public async Task GetUserById_WithValidId_ReturnsUserDto()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "test@example.com",
            FirstName = "Test",
            LastName = "User",
            Language = "es",
            EmailConfirmed = true
        };

        _userManagerMock.Setup(x => x.FindByIdAsync(userId.ToString()))
            .ReturnsAsync(user);

        _userManagerMock.Setup(x => x.GetRolesAsync(user))
            .ReturnsAsync(new List<string> { "Customer" });

        // Act
        var result = await _authService.GetUserByIdAsync(userId);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(userId);
        result.Email.Should().Be(user.Email);
        result.FirstName.Should().Be(user.FirstName);
        result.LastName.Should().Be(user.LastName);
    }

    [Fact]
    public async Task GetUserById_WithInvalidId_ReturnsNull()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _userManagerMock.Setup(x => x.FindByIdAsync(userId.ToString()))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _authService.GetUserByIdAsync(userId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetUserById_IncludesRoles()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "test@example.com",
            Language = "es"
        };

        _userManagerMock.Setup(x => x.FindByIdAsync(userId.ToString()))
            .ReturnsAsync(user);

        _userManagerMock.Setup(x => x.GetRolesAsync(user))
            .ReturnsAsync(new List<string> { "Admin", "Customer" });

        // Act
        var result = await _authService.GetUserByIdAsync(userId);

        // Assert
        result.Should().NotBeNull();
        result!.Roles.Should().Contain(new[] { "Admin", "Customer" });
    }

    #endregion

    #region LogoutAsync Tests

    [Fact]
    public async Task Logout_WithValidUserId_UpdatesSecurityStamp()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "test@example.com"
        };

        _userManagerMock.Setup(x => x.FindByIdAsync(userId.ToString()))
            .ReturnsAsync(user);

        _userManagerMock.Setup(x => x.UpdateSecurityStampAsync(user))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        await _authService.LogoutAsync(userId);

        // Assert
        _userManagerMock.Verify(x => x.UpdateSecurityStampAsync(user), Times.Once);
    }

    [Fact]
    public async Task Logout_WithInvalidUserId_ThrowsInvalidOperationException()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _userManagerMock.Setup(x => x.FindByIdAsync(userId.ToString()))
            .ReturnsAsync((User?)null);

        // Act
        var act = () => _authService.LogoutAsync(userId);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Usuario no encontrado*");
    }

    [Fact]
    public async Task Logout_RevokesAllActiveRefreshTokens()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "test@example.com"
        };

        var activeToken1 = new RefreshToken
        {
            Id = Guid.NewGuid(),
            Token = "active-token-1",
            UserId = userId,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow
        };

        var activeToken2 = new RefreshToken
        {
            Id = Guid.NewGuid(),
            Token = "active-token-2",
            UserId = userId,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow
        };

        _context.RefreshTokens.AddRange(activeToken1, activeToken2);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        _userManagerMock.Setup(x => x.FindByIdAsync(userId.ToString()))
            .ReturnsAsync(user);

        _userManagerMock.Setup(x => x.UpdateSecurityStampAsync(user))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        await _authService.LogoutAsync(userId);

        // Assert
        var tokens = await _context.RefreshTokens.Where(rt => rt.UserId == userId).ToListAsync(TestContext.Current.CancellationToken);
        tokens.Should().AllSatisfy(t => t.RevokedAt.Should().NotBeNull());
    }

    #endregion

    #region ValidateSecurityStampAsync Tests

    [Fact]
    public async Task ValidateSecurityStamp_WithMatchingStamp_ReturnsTrue()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var securityStamp = "valid-security-stamp";
        var user = new User
        {
            Id = userId,
            Email = "test@example.com"
        };

        _userManagerMock.Setup(x => x.FindByIdAsync(userId.ToString()))
            .ReturnsAsync(user);

        _userManagerMock.Setup(x => x.GetSecurityStampAsync(user))
            .ReturnsAsync(securityStamp);

        // Act
        var result = await _authService.ValidateSecurityStampAsync(userId, securityStamp);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task ValidateSecurityStamp_WithDifferentStamp_ReturnsFalse()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "test@example.com"
        };

        _userManagerMock.Setup(x => x.FindByIdAsync(userId.ToString()))
            .ReturnsAsync(user);

        _userManagerMock.Setup(x => x.GetSecurityStampAsync(user))
            .ReturnsAsync("current-stamp");

        // Act
        var result = await _authService.ValidateSecurityStampAsync(userId, "old-stamp");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task ValidateSecurityStamp_WithNonExistentUser_ReturnsFalse()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _userManagerMock.Setup(x => x.FindByIdAsync(userId.ToString()))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _authService.ValidateSecurityStampAsync(userId, "any-stamp");

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region ForgotPasswordAsync Tests

    [Fact]
    public async Task ForgotPassword_WithExistingUser_SendsEmail()
    {
        // Arrange
        var email = "test@example.com";
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            FirstName = "Test"
        };
        var resetToken = "reset-token-123";

        _userManagerMock.Setup(x => x.FindByEmailAsync(email))
            .ReturnsAsync(user);

        _userManagerMock.Setup(x => x.GeneratePasswordResetTokenAsync(user))
            .ReturnsAsync(resetToken);

        _emailServiceMock.Setup(x => x.SendPasswordResetEmailAsync(email, resetToken, user.FirstName))
            .Returns(Task.CompletedTask);

        // Act
        await _authService.ForgotPasswordAsync(email);

        // Assert
        _emailServiceMock.Verify(
            x => x.SendPasswordResetEmailAsync(email, resetToken, user.FirstName),
            Times.Once);
    }

    [Fact]
    public async Task ForgotPassword_WithNonExistentUser_DoesNotSendEmail()
    {
        // Arrange
        var email = "nonexistent@example.com";

        _userManagerMock.Setup(x => x.FindByEmailAsync(email))
            .ReturnsAsync((User?)null);

        // Act
        await _authService.ForgotPasswordAsync(email);

        // Assert
        _emailServiceMock.Verify(
            x => x.SendPasswordResetEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()),
            Times.Never);
    }

    [Fact]
    public async Task ForgotPassword_WithUserWithoutFirstName_UsesEmail()
    {
        // Arrange
        var email = "test@example.com";
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            FirstName = null
        };
        var resetToken = "reset-token-123";

        _userManagerMock.Setup(x => x.FindByEmailAsync(email))
            .ReturnsAsync(user);

        _userManagerMock.Setup(x => x.GeneratePasswordResetTokenAsync(user))
            .ReturnsAsync(resetToken);

        _emailServiceMock.Setup(x => x.SendPasswordResetEmailAsync(email, resetToken, email))
            .Returns(Task.CompletedTask);

        // Act
        await _authService.ForgotPasswordAsync(email);

        // Assert
        _emailServiceMock.Verify(
            x => x.SendPasswordResetEmailAsync(email, resetToken, email),
            Times.Once);
    }

    #endregion

    #region ResetPasswordAsync Tests

    [Fact]
    public async Task ResetPassword_WithValidToken_ResetsPassword()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var email = "test@example.com";
        var user = new User
        {
            Id = userId,
            Email = email
        };
        var dto = new ResetPasswordRequestDto
        {
            Email = email,
            Token = "valid-token",
            NewPassword = "NewPassword123!",
            ConfirmPassword = "NewPassword123!"
        };

        _userManagerMock.Setup(x => x.FindByEmailAsync(email))
            .ReturnsAsync(user);

        _userManagerMock.Setup(x => x.ResetPasswordAsync(user, dto.Token, dto.NewPassword))
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock.Setup(x => x.UpdateSecurityStampAsync(user))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        await _authService.ResetPasswordAsync(dto);

        // Assert
        _userManagerMock.Verify(x => x.ResetPasswordAsync(user, dto.Token, dto.NewPassword), Times.Once);
        _userManagerMock.Verify(x => x.UpdateSecurityStampAsync(user), Times.Once);
    }

    [Fact]
    public async Task ResetPassword_WithNonExistentUser_ThrowsException()
    {
        // Arrange
        var dto = new ResetPasswordRequestDto
        {
            Email = "nonexistent@example.com",
            Token = "any-token",
            NewPassword = "NewPassword123!",
            ConfirmPassword = "NewPassword123!"
        };

        _userManagerMock.Setup(x => x.FindByEmailAsync(dto.Email))
            .ReturnsAsync((User?)null);

        // Act
        var act = () => _authService.ResetPasswordAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Token inválido o expirado*");
    }

    [Fact]
    public async Task ResetPassword_WithInvalidToken_ThrowsException()
    {
        // Arrange
        var email = "test@example.com";
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email
        };
        var dto = new ResetPasswordRequestDto
        {
            Email = email,
            Token = "invalid-token",
            NewPassword = "NewPassword123!",
            ConfirmPassword = "NewPassword123!"
        };

        _userManagerMock.Setup(x => x.FindByEmailAsync(email))
            .ReturnsAsync(user);

        _userManagerMock.Setup(x => x.ResetPasswordAsync(user, dto.Token, dto.NewPassword))
            .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Invalid token" }));

        // Act
        var act = () => _authService.ResetPasswordAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Token inválido o expirado*");
    }

    [Fact]
    public async Task ResetPassword_WithWeakPassword_ThrowsException()
    {
        // Arrange
        var email = "test@example.com";
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email
        };
        var dto = new ResetPasswordRequestDto
        {
            Email = email,
            Token = "valid-token",
            NewPassword = "weak",
            ConfirmPassword = "weak"
        };

        _userManagerMock.Setup(x => x.FindByEmailAsync(email))
            .ReturnsAsync(user);

        _userManagerMock.Setup(x => x.ResetPasswordAsync(user, dto.Token, dto.NewPassword))
            .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Password too weak" }));

        // Act
        var act = () => _authService.ResetPasswordAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Error al restablecer contraseña*");
    }

    [Fact]
    public async Task ResetPassword_RevokesAllActiveRefreshTokens()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var email = "test@example.com";
        var user = new User
        {
            Id = userId,
            Email = email
        };

        var activeToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            Token = "active-token",
            UserId = userId,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow
        };

        _context.RefreshTokens.Add(activeToken);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var dto = new ResetPasswordRequestDto
        {
            Email = email,
            Token = "valid-token",
            NewPassword = "NewPassword123!",
            ConfirmPassword = "NewPassword123!"
        };

        _userManagerMock.Setup(x => x.FindByEmailAsync(email))
            .ReturnsAsync(user);

        _userManagerMock.Setup(x => x.ResetPasswordAsync(user, dto.Token, dto.NewPassword))
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock.Setup(x => x.UpdateSecurityStampAsync(user))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        await _authService.ResetPasswordAsync(dto);

        // Assert
        var tokens = await _context.RefreshTokens.Where(rt => rt.UserId == userId).ToListAsync(TestContext.Current.CancellationToken);
        tokens.Should().AllSatisfy(t => t.RevokedAt.Should().NotBeNull());
    }

    #endregion

    #region Helper Methods

    private static Mock<UserManager<User>> CreateUserManagerMock()
    {
        var store = new Mock<IUserStore<User>>();
        return new Mock<UserManager<User>>(
            store.Object,
            null!, null!, null!, null!, null!, null!, null!, null!);
    }

    private static Mock<SignInManager<User>> CreateSignInManagerMock(UserManager<User> userManager)
    {
        var contextAccessor = new Mock<Microsoft.AspNetCore.Http.IHttpContextAccessor>();
        var claimsFactory = new Mock<IUserClaimsPrincipalFactory<User>>();

        return new Mock<SignInManager<User>>(
            userManager,
            contextAccessor.Object,
            claimsFactory.Object,
            null!, null!, null!, null!);
    }

    #endregion
}
