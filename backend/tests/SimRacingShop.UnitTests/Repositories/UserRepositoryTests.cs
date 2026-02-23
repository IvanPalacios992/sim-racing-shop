using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Moq;
using SimRacingShop.Core.Entities;
using SimRacingShop.Infrastructure.Repositories;

namespace SimRacingShop.UnitTests.Repositories;

public class UserRepositoryTests
{
    private readonly Mock<UserManager<User>> _userManagerMock;
    private readonly UserRepository _repository;

    public UserRepositoryTests()
    {
        _userManagerMock = CreateUserManagerMock();
        _repository = new UserRepository(_userManagerMock.Object);
    }

    private static Mock<UserManager<User>> CreateUserManagerMock()
    {
        var store = new Mock<IUserStore<User>>();
        return new Mock<UserManager<User>>(
            store.Object,
            null!, null!, null!, null!, null!, null!, null!, null!);
    }

    #region GetUserByIdAsync Tests

    [Fact]
    public async Task GetUserByIdAsync_WithExistingUser_ReturnsUser()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var expectedUser = new User
        {
            Id = userId,
            Email = "test@example.com",
            FirstName = "Test",
            LastName = "User",
            Language = "es"
        };

        _userManagerMock.Setup(x => x.FindByIdAsync(userId.ToString()))
            .ReturnsAsync(expectedUser);

        // Act
        var result = await _repository.GetUserByIdAsync(userId);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(userId.ToString());
        result.Email.Should().Be("test@example.com");
        result.FirstName.Should().Be("Test");
        result.LastName.Should().Be("User");
    }

    [Fact]
    public async Task GetUserByIdAsync_WithNonExistentUser_ReturnsNull()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _userManagerMock.Setup(x => x.FindByIdAsync(userId.ToString()))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _repository.GetUserByIdAsync(userId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetUserByIdAsync_CallsUserManagerWithCorrectId()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _userManagerMock.Setup(x => x.FindByIdAsync(userId.ToString()))
            .ReturnsAsync((User?)null);

        // Act
        await _repository.GetUserByIdAsync(userId);

        // Assert
        _userManagerMock.Verify(x => x.FindByIdAsync(userId.ToString()), Times.Once);
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_WithValidUser_UpdatesSuccessfully()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "new@example.com",
            FirstName = "Updated",
            LastName = "User",
            Language = "en"
        };

        _userManagerMock.Setup(x => x.FindByEmailAsync(user.Email))
            .ReturnsAsync((User?)null);

        _userManagerMock.Setup(x => x.UpdateAsync(user))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        await _repository.UpdateAsync(user);

        // Assert
        _userManagerMock.Verify(x => x.UpdateAsync(user), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_WithDuplicateEmail_ThrowsException()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "existing@example.com",
            FirstName = "Test",
            LastName = "User",
            Language = "es"
        };

        var existingUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "existing@example.com",
            FirstName = "Existing",
            LastName = "User",
            Language = "es"
        };

        _userManagerMock.Setup(x => x.FindByEmailAsync(user.Email))
            .ReturnsAsync(existingUser);

        // Act & Assert
        var act = async () => await _repository.UpdateAsync(user);
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("El email ya está registrado");

        _userManagerMock.Verify(x => x.UpdateAsync(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task UpdateAsync_WithFailedUpdate_ThrowsException()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            FirstName = "Test",
            LastName = "User",
            Language = "es"
        };

        var errors = new[]
        {
            new IdentityError { Description = "Error 1" },
            new IdentityError { Description = "Error 2" }
        };

        _userManagerMock.Setup(x => x.FindByEmailAsync(user.Email))
            .ReturnsAsync((User?)null);

        _userManagerMock.Setup(x => x.UpdateAsync(user))
            .ReturnsAsync(IdentityResult.Failed(errors));

        // Act & Assert
        var act = async () => await _repository.UpdateAsync(user);
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Error al crear usuario: Error 1, Error 2");
    }

    #endregion

    #region DeleteAsync Tests

    [Fact]
    public async Task DeleteAsync_WithValidUser_DeletesSuccessfully()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            FirstName = "Test",
            LastName = "User",
            Language = "es"
        };

        _userManagerMock.Setup(x => x.DeleteAsync(user))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        await _repository.DeleteAsync(user);

        // Assert
        _userManagerMock.Verify(x => x.DeleteAsync(user), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_WithFailedDelete_ThrowsException()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            FirstName = "Test",
            LastName = "User",
            Language = "es"
        };

        var errors = new[]
        {
            new IdentityError { Description = "Cannot delete user" }
        };

        _userManagerMock.Setup(x => x.DeleteAsync(user))
            .ReturnsAsync(IdentityResult.Failed(errors));

        // Act & Assert
        var act = async () => await _repository.DeleteAsync(user);
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Error al crear usuario: Cannot delete user");
    }

    #endregion
}
