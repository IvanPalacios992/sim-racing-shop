using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Moq;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Settings;
using SimRacingShop.Infrastructure.Data;

namespace SimRacingShop.UnitTests.Data;

public class DbInitializerTests
{
    private readonly Mock<UserManager<User>> _userManagerMock;
    private readonly Mock<RoleManager<IdentityRole<Guid>>> _roleManagerMock;
    private readonly Mock<ILogger> _loggerMock;

    public DbInitializerTests()
    {
        _userManagerMock = CreateUserManagerMock();
        _roleManagerMock = CreateRoleManagerMock();
        _loggerMock = new Mock<ILogger>();
    }

    #region Role Seeding Tests

    [Fact]
    public async Task SeedAsync_CreatesAdminRole_WhenNotExists()
    {
        // Arrange
        _roleManagerMock.Setup(x => x.RoleExistsAsync("Admin"))
            .ReturnsAsync(false);
        _roleManagerMock.Setup(x => x.RoleExistsAsync("User"))
            .ReturnsAsync(true);

        _roleManagerMock.Setup(x => x.CreateAsync(It.Is<IdentityRole<Guid>>(r => r.Name == "Admin")))
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock.Setup(x => x.GetUsersInRoleAsync("Admin"))
            .ReturnsAsync(new List<User> { new User() }); // Admin exists, skip user creation

        var settings = new AdminSeedSettings();

        // Act
        await DbInitializer.SeedAsync(
            _userManagerMock.Object,
            _roleManagerMock.Object,
            settings,
            _loggerMock.Object);

        // Assert
        _roleManagerMock.Verify(
            x => x.CreateAsync(It.Is<IdentityRole<Guid>>(r => r.Name == "Admin")),
            Times.Once);
    }

    [Fact]
    public async Task SeedAsync_CreatesUserRole_WhenNotExists()
    {
        // Arrange
        _roleManagerMock.Setup(x => x.RoleExistsAsync("Admin"))
            .ReturnsAsync(true);
        _roleManagerMock.Setup(x => x.RoleExistsAsync("User"))
            .ReturnsAsync(false);

        _roleManagerMock.Setup(x => x.CreateAsync(It.Is<IdentityRole<Guid>>(r => r.Name == "User")))
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock.Setup(x => x.GetUsersInRoleAsync("Admin"))
            .ReturnsAsync(new List<User> { new User() }); // Admin exists, skip user creation

        var settings = new AdminSeedSettings();

        // Act
        await DbInitializer.SeedAsync(
            _userManagerMock.Object,
            _roleManagerMock.Object,
            settings,
            _loggerMock.Object);

        // Assert
        _roleManagerMock.Verify(
            x => x.CreateAsync(It.Is<IdentityRole<Guid>>(r => r.Name == "User")),
            Times.Once);
    }

    [Fact]
    public async Task SeedAsync_SkipsRoleCreation_WhenExists()
    {
        // Arrange
        _roleManagerMock.Setup(x => x.RoleExistsAsync("Admin"))
            .ReturnsAsync(true);
        _roleManagerMock.Setup(x => x.RoleExistsAsync("User"))
            .ReturnsAsync(true);

        _userManagerMock.Setup(x => x.GetUsersInRoleAsync("Admin"))
            .ReturnsAsync(new List<User> { new User() }); // Admin exists

        var settings = new AdminSeedSettings();

        // Act
        await DbInitializer.SeedAsync(
            _userManagerMock.Object,
            _roleManagerMock.Object,
            settings,
            _loggerMock.Object);

        // Assert
        _roleManagerMock.Verify(
            x => x.CreateAsync(It.IsAny<IdentityRole<Guid>>()),
            Times.Never);
    }

    #endregion

    #region Admin User Seeding Tests

    [Fact]
    public async Task SeedAsync_CreatesAdminUser_WhenNoAdminExists()
    {
        // Arrange
        SetupRolesExist();

        _userManagerMock.Setup(x => x.GetUsersInRoleAsync("Admin"))
            .ReturnsAsync(new List<User>()); // No admins exist

        _userManagerMock.Setup(x => x.CreateAsync(It.IsAny<User>(), It.IsAny<string>()))
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock.Setup(x => x.AddToRoleAsync(It.IsAny<User>(), "Admin"))
            .ReturnsAsync(IdentityResult.Success);

        var settings = new AdminSeedSettings
        {
            Email = "admin@test.com",
            Password = "AdminPass123!",
            FirstName = "Admin",
            LastName = "User"
        };

        // Act
        await DbInitializer.SeedAsync(
            _userManagerMock.Object,
            _roleManagerMock.Object,
            settings,
            _loggerMock.Object);

        // Assert
        _userManagerMock.Verify(
            x => x.CreateAsync(
                It.Is<User>(u => u.Email == settings.Email),
                settings.Password),
            Times.Once);
    }

    [Fact]
    public async Task SeedAsync_SkipsAdminCreation_WhenAdminExists()
    {
        // Arrange
        SetupRolesExist();

        var existingAdmin = new User { Email = "existing@admin.com" };
        _userManagerMock.Setup(x => x.GetUsersInRoleAsync("Admin"))
            .ReturnsAsync(new List<User> { existingAdmin });

        var settings = new AdminSeedSettings
        {
            Email = "admin@test.com",
            Password = "AdminPass123!"
        };

        // Act
        await DbInitializer.SeedAsync(
            _userManagerMock.Object,
            _roleManagerMock.Object,
            settings,
            _loggerMock.Object);

        // Assert
        _userManagerMock.Verify(
            x => x.CreateAsync(It.IsAny<User>(), It.IsAny<string>()),
            Times.Never);
    }

    [Fact]
    public async Task SeedAsync_ThrowsException_WhenNoAdminAndNoSettings()
    {
        // Arrange
        SetupRolesExist();

        _userManagerMock.Setup(x => x.GetUsersInRoleAsync("Admin"))
            .ReturnsAsync(new List<User>()); // No admins

        var settings = new AdminSeedSettings
        {
            Email = "", // Empty settings
            Password = ""
        };

        // Act
        var act = () => DbInitializer.SeedAsync(
            _userManagerMock.Object,
            _roleManagerMock.Object,
            settings,
            _loggerMock.Object);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*AdminSeed*not configured*");
    }

    [Fact]
    public async Task SeedAsync_AssignsAdminRole_ToCreatedUser()
    {
        // Arrange
        SetupRolesExist();

        _userManagerMock.Setup(x => x.GetUsersInRoleAsync("Admin"))
            .ReturnsAsync(new List<User>());

        User? createdUser = null;
        _userManagerMock.Setup(x => x.CreateAsync(It.IsAny<User>(), It.IsAny<string>()))
            .Callback<User, string>((user, _) => createdUser = user)
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock.Setup(x => x.AddToRoleAsync(It.IsAny<User>(), "Admin"))
            .ReturnsAsync(IdentityResult.Success);

        var settings = new AdminSeedSettings
        {
            Email = "admin@test.com",
            Password = "AdminPass123!"
        };

        // Act
        await DbInitializer.SeedAsync(
            _userManagerMock.Object,
            _roleManagerMock.Object,
            settings,
            _loggerMock.Object);

        // Assert
        _userManagerMock.Verify(
            x => x.AddToRoleAsync(It.IsAny<User>(), "Admin"),
            Times.Once);
    }

    #endregion

    #region Error Handling Tests

    [Fact]
    public async Task SeedAsync_ThrowsException_WhenUserCreationFails()
    {
        // Arrange
        SetupRolesExist();

        _userManagerMock.Setup(x => x.GetUsersInRoleAsync("Admin"))
            .ReturnsAsync(new List<User>());

        _userManagerMock.Setup(x => x.CreateAsync(It.IsAny<User>(), It.IsAny<string>()))
            .ReturnsAsync(IdentityResult.Failed(new IdentityError
            {
                Code = "PasswordTooWeak",
                Description = "Password does not meet requirements"
            }));

        var settings = new AdminSeedSettings
        {
            Email = "admin@test.com",
            Password = "weak"
        };

        // Act
        var act = () => DbInitializer.SeedAsync(
            _userManagerMock.Object,
            _roleManagerMock.Object,
            settings,
            _loggerMock.Object);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Failed to create admin user*");
    }

    [Fact]
    public async Task SeedAsync_LogsRoleCreation()
    {
        // Arrange
        _roleManagerMock.Setup(x => x.RoleExistsAsync("Admin"))
            .ReturnsAsync(false);
        _roleManagerMock.Setup(x => x.RoleExistsAsync("User"))
            .ReturnsAsync(true);

        _roleManagerMock.Setup(x => x.CreateAsync(It.IsAny<IdentityRole<Guid>>()))
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock.Setup(x => x.GetUsersInRoleAsync("Admin"))
            .ReturnsAsync(new List<User> { new User() });

        var settings = new AdminSeedSettings();

        // Act
        await DbInitializer.SeedAsync(
            _userManagerMock.Object,
            _roleManagerMock.Object,
            settings,
            _loggerMock.Object);

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("created successfully")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task SeedAsync_SetsEmailConfirmed_ToTrue()
    {
        // Arrange
        SetupRolesExist();

        _userManagerMock.Setup(x => x.GetUsersInRoleAsync("Admin"))
            .ReturnsAsync(new List<User>());

        User? createdUser = null;
        _userManagerMock.Setup(x => x.CreateAsync(It.IsAny<User>(), It.IsAny<string>()))
            .Callback<User, string>((user, _) => createdUser = user)
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock.Setup(x => x.AddToRoleAsync(It.IsAny<User>(), "Admin"))
            .ReturnsAsync(IdentityResult.Success);

        var settings = new AdminSeedSettings
        {
            Email = "admin@test.com",
            Password = "AdminPass123!"
        };

        // Act
        await DbInitializer.SeedAsync(
            _userManagerMock.Object,
            _roleManagerMock.Object,
            settings,
            _loggerMock.Object);

        // Assert
        createdUser.Should().NotBeNull();
        createdUser!.EmailConfirmed.Should().BeTrue();
    }

    #endregion

    #region Helper Methods

    private void SetupRolesExist()
    {
        _roleManagerMock.Setup(x => x.RoleExistsAsync("Admin"))
            .ReturnsAsync(true);
        _roleManagerMock.Setup(x => x.RoleExistsAsync("User"))
            .ReturnsAsync(true);
    }

    private static Mock<UserManager<User>> CreateUserManagerMock()
    {
        var store = new Mock<IUserStore<User>>();
        return new Mock<UserManager<User>>(
            store.Object,
            null!, null!, null!, null!, null!, null!, null!, null!);
    }

    private static Mock<RoleManager<IdentityRole<Guid>>> CreateRoleManagerMock()
    {
        var store = new Mock<IRoleStore<IdentityRole<Guid>>>();
        return new Mock<RoleManager<IdentityRole<Guid>>>(
            store.Object,
            null!, null!, null!, null!);
    }

    #endregion
}
