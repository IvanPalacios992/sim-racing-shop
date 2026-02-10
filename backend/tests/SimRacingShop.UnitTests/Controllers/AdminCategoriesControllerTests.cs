using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using Moq;
using SimRacingShop.API.Controllers;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Repositories;
using SimRacingShop.Core.Services;
using System.Security.Claims;

namespace SimRacingShop.UnitTests.Controllers;

public class AdminCategoriesControllerTests
{
    private readonly Mock<ICategoryAdminRepository> _adminRepoMock;
    private readonly Mock<IFileStorageService> _fileStorageMock;
    private readonly Mock<IDistributedCache> _cacheMock;
    private readonly Mock<ILogger<AdminCategoriesController>> _loggerMock;
    private readonly AdminCategoriesController _controller;

    public AdminCategoriesControllerTests()
    {
        _adminRepoMock = new Mock<ICategoryAdminRepository>();
        _fileStorageMock = new Mock<IFileStorageService>();
        _cacheMock = new Mock<IDistributedCache>();
        _loggerMock = new Mock<ILogger<AdminCategoriesController>>();

        _controller = new AdminCategoriesController(
            _adminRepoMock.Object,
            _fileStorageMock.Object,
            _cacheMock.Object,
            _loggerMock.Object);

        // Setup admin user context
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
            new(ClaimTypes.Role, "Admin")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };
    }

    #region Helper Methods

    private static CreateCategoryDto BuildCreateDto(
        string locale = "es",
        string name = "Volantes",
        string slug = "volantes")
    {
        return new CreateCategoryDto
        {
            IsActive = true,
            Translations = new List<CategoryTranslationInputDto>
            {
                new()
                {
                    Locale = locale,
                    Name = name,
                    Slug = slug,
                    ShortDescription = "Categoría de volantes"
                }
            }
        };
    }

    private static Category BuildCategory(
        string locale = "es",
        string name = "Volantes",
        string slug = "volantes")
    {
        var categoryId = Guid.NewGuid();
        return new Category
        {
            Id = categoryId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Translations = new List<CategoryTranslation>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    CategoryId = categoryId,
                    Locale = locale,
                    Name = name,
                    Slug = slug,
                    ShortDescription = "Categoría de volantes"
                }
            },
            Image = null
        };
    }

    private static Mock<IFormFile> CreateMockFormFile(string fileName = "test.jpg", long size = 1024)
    {
        var fileMock = new Mock<IFormFile>();
        var stream = new MemoryStream(new byte[size]);
        fileMock.Setup(f => f.FileName).Returns(fileName);
        fileMock.Setup(f => f.Length).Returns(size);
        fileMock.Setup(f => f.OpenReadStream()).Returns(stream);
        return fileMock;
    }

    #endregion

    #region CreateCategory Tests

    [Fact]
    public async Task CreateCategory_WithValidData_Returns201Created()
    {
        // Arrange
        var dto = BuildCreateDto();

        _adminRepoMock.Setup(r => r.CreateAsync(It.IsAny<Category>()))
            .ReturnsAsync((Category c) => c);

        _cacheMock.Setup(c => c.RemoveAsync(It.IsAny<string>(), default))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.CreateCategory(dto);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.StatusCode.Should().Be(201);

        var category = createdResult.Value.Should().BeOfType<CategoryDetailDto>().Subject;
        category.Name.Should().Be("Volantes");
    }

    [Fact]
    public async Task CreateCategory_CallsRepositoryCreate()
    {
        // Arrange
        var dto = BuildCreateDto();

        _adminRepoMock.Setup(r => r.CreateAsync(It.IsAny<Category>()))
            .ReturnsAsync((Category c) => c);

        _cacheMock.Setup(c => c.RemoveAsync(It.IsAny<string>(), default))
            .Returns(Task.CompletedTask);

        // Act
        await _controller.CreateCategory(dto);

        // Assert
        _adminRepoMock.Verify(r => r.CreateAsync(It.Is<Category>(c =>
            c.Translations.Count == 1)), Times.Once);
    }

    [Fact]
    public async Task CreateCategory_InvalidatesCacheAfterCreate()
    {
        // Arrange
        var dto = BuildCreateDto();

        _adminRepoMock.Setup(r => r.CreateAsync(It.IsAny<Category>()))
            .ReturnsAsync((Category c) => c);

        _cacheMock.Setup(c => c.RemoveAsync(It.IsAny<string>(), default))
            .Returns(Task.CompletedTask);

        // Act
        await _controller.CreateCategory(dto);

        // Assert
        _cacheMock.Verify(c => c.RemoveAsync(
            It.Is<string>(k => k.Contains("categories:detail:")),
            default), Times.AtLeastOnce);
    }

    [Fact]
    public async Task CreateCategory_SetsParentCategory()
    {
        // Arrange
        var parentId = Guid.NewGuid();
        var dto = BuildCreateDto();
        dto.ParentCategory = parentId;

        _adminRepoMock.Setup(r => r.CreateAsync(It.IsAny<Category>()))
            .ReturnsAsync((Category c) => c);

        _cacheMock.Setup(c => c.RemoveAsync(It.IsAny<string>(), default))
            .Returns(Task.CompletedTask);

        // Act
        await _controller.CreateCategory(dto);

        // Assert
        _adminRepoMock.Verify(r => r.CreateAsync(It.Is<Category>(c =>
            c.ParentCategory == parentId)), Times.Once);
    }

    #endregion

    #region UpdateCategory Tests

    [Fact]
    public async Task UpdateCategory_WithExistingCategory_Returns200()
    {
        // Arrange
        var category = BuildCategory();
        var dto = new UpdateCategoryDto
        {
            IsActive = false
        };

        _adminRepoMock.Setup(r => r.GetByIdAsync(category.Id))
            .ReturnsAsync(category);

        _adminRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Category>()))
            .Returns(Task.CompletedTask);

        _cacheMock.Setup(c => c.RemoveAsync(It.IsAny<string>(), default))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.UpdateCategory(category.Id, dto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var detail = okResult.Value.Should().BeOfType<CategoryDetailDto>().Subject;
        detail.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task UpdateCategory_WithNonExistentCategory_Returns404()
    {
        // Arrange
        var dto = new UpdateCategoryDto { IsActive = true };

        _adminRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync((Category?)null);

        // Act
        var result = await _controller.UpdateCategory(Guid.NewGuid(), dto);

        // Assert
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task UpdateCategory_UpdatesCategoryFields()
    {
        // Arrange
        var category = BuildCategory();
        var parentId = Guid.NewGuid();
        var dto = new UpdateCategoryDto
        {
            ParentCategory = parentId,
            IsActive = false
        };

        _adminRepoMock.Setup(r => r.GetByIdAsync(category.Id))
            .ReturnsAsync(category);

        _adminRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Category>()))
            .Returns(Task.CompletedTask);

        _cacheMock.Setup(c => c.RemoveAsync(It.IsAny<string>(), default))
            .Returns(Task.CompletedTask);

        // Act
        await _controller.UpdateCategory(category.Id, dto);

        // Assert
        _adminRepoMock.Verify(r => r.UpdateAsync(It.Is<Category>(c =>
            c.ParentCategory == parentId &&
            c.IsActive == false)), Times.Once);
    }

    #endregion

    #region DeleteCategory Tests

    [Fact]
    public async Task DeleteCategory_WithExistingCategory_Returns204()
    {
        // Arrange
        var category = BuildCategory();
        category.Image = new CategoryImage
        {
            Id = Guid.NewGuid(),
            CategoryId = category.Id,
            ImageUrl = "/uploads/categories/img1.jpg"
        };

        _adminRepoMock.Setup(r => r.GetByIdAsync(category.Id))
            .ReturnsAsync(category);

        _adminRepoMock.Setup(r => r.DeleteAsync(category))
            .Returns(Task.CompletedTask);

        _fileStorageMock.Setup(f => f.DeleteFileAsync(It.IsAny<string>()))
            .Returns(Task.CompletedTask);

        _cacheMock.Setup(c => c.RemoveAsync(It.IsAny<string>(), default))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.DeleteCategory(category.Id);

        // Assert
        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task DeleteCategory_WithNonExistentCategory_Returns404()
    {
        // Arrange
        _adminRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync((Category?)null);

        // Act
        var result = await _controller.DeleteCategory(Guid.NewGuid());

        // Assert
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task DeleteCategory_DeletesAssociatedImageFile()
    {
        // Arrange
        var category = BuildCategory();
        category.Image = new CategoryImage
        {
            Id = Guid.NewGuid(),
            CategoryId = category.Id,
            ImageUrl = "/uploads/categories/img1.jpg"
        };

        _adminRepoMock.Setup(r => r.GetByIdAsync(category.Id))
            .ReturnsAsync(category);

        _adminRepoMock.Setup(r => r.DeleteAsync(category))
            .Returns(Task.CompletedTask);

        _fileStorageMock.Setup(f => f.DeleteFileAsync(It.IsAny<string>()))
            .Returns(Task.CompletedTask);

        _cacheMock.Setup(c => c.RemoveAsync(It.IsAny<string>(), default))
            .Returns(Task.CompletedTask);

        // Act
        await _controller.DeleteCategory(category.Id);

        // Assert
        _fileStorageMock.Verify(f => f.DeleteFileAsync("/uploads/categories/img1.jpg"), Times.Once);
    }

    #endregion

    #region UploadImages Tests

    [Fact]
    public async Task UploadImages_WithValidFile_Returns201()
    {
        // Arrange
        var category = BuildCategory();
        var fileMock = CreateMockFormFile("photo.jpg");

        _adminRepoMock.Setup(r => r.GetByIdAsync(category.Id))
            .ReturnsAsync(category);

        _fileStorageMock.Setup(f => f.SaveFileAsync(It.IsAny<Stream>(), "photo.jpg", "categories"))
            .ReturnsAsync("/uploads/categories/abc.jpg");

        _adminRepoMock.Setup(r => r.AddImageAsync(category.Id, It.IsAny<CategoryImage>()))
            .ReturnsAsync((Guid _, CategoryImage img) => img);

        _cacheMock.Setup(c => c.RemoveAsync(It.IsAny<string>(), default))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.UploadImages(category.Id, fileMock.Object);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedResult>().Subject;
        createdResult.StatusCode.Should().Be(201);

        var image = createdResult.Value.Should().BeOfType<CategoryImageUploadResultDto>().Subject;
        image.ImageUrl.Should().Be("/uploads/categories/abc.jpg");
    }

    [Fact]
    public async Task UploadImages_WithNullFile_Returns400()
    {
        // Act
        var result = await _controller.UploadImages(Guid.NewGuid(), null!);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task UploadImages_WithNonExistentCategory_Returns404()
    {
        // Arrange
        var fileMock = CreateMockFormFile();

        _adminRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync((Category?)null);

        // Act
        var result = await _controller.UploadImages(Guid.NewGuid(), fileMock.Object);

        // Assert
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task UploadImages_WithInvalidFileType_Returns400()
    {
        // Arrange
        var category = BuildCategory();
        var fileMock = CreateMockFormFile("malware.exe");

        _adminRepoMock.Setup(r => r.GetByIdAsync(category.Id))
            .ReturnsAsync(category);

        _fileStorageMock.Setup(f => f.SaveFileAsync(It.IsAny<Stream>(), "malware.exe", "categories"))
            .ThrowsAsync(new ArgumentException("Tipo de archivo no permitido"));

        // Act
        var result = await _controller.UploadImages(category.Id, fileMock.Object);

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task UploadImages_SetsAltTextFromFileName()
    {
        // Arrange
        var category = BuildCategory();
        var fileMock = CreateMockFormFile("my-category-image.jpg");

        _adminRepoMock.Setup(r => r.GetByIdAsync(category.Id))
            .ReturnsAsync(category);

        _fileStorageMock.Setup(f => f.SaveFileAsync(It.IsAny<Stream>(), "my-category-image.jpg", "categories"))
            .ReturnsAsync("/uploads/categories/abc.jpg");

        _adminRepoMock.Setup(r => r.AddImageAsync(category.Id, It.IsAny<CategoryImage>()))
            .ReturnsAsync((Guid _, CategoryImage img) => img);

        _cacheMock.Setup(c => c.RemoveAsync(It.IsAny<string>(), default))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.UploadImages(category.Id, fileMock.Object);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedResult>().Subject;
        var image = createdResult.Value.Should().BeOfType<CategoryImageUploadResultDto>().Subject;
        image.AltText.Should().Be("my-category-image");
    }

    #endregion

    #region UpdateTranslations Tests

    [Fact]
    public async Task UpdateTranslations_WithExistingCategory_Returns200()
    {
        // Arrange
        var category = BuildCategory();
        var dto = new UpdateCategoryTranslationsDto
        {
            Translations = new List<CategoryTranslationInputDto>
            {
                new()
                {
                    Locale = "es",
                    Name = "Volantes Actualizado",
                    Slug = "volantes-actualizado",
                    ShortDescription = "Descripción actualizada"
                },
                new()
                {
                    Locale = "en",
                    Name = "Wheels Updated",
                    Slug = "wheels-updated"
                }
            }
        };

        _adminRepoMock.Setup(r => r.ReplaceTranslationsAsync(category.Id, It.IsAny<List<CategoryTranslation>>()))
            .Returns(Task.CompletedTask);

        _cacheMock.Setup(c => c.RemoveAsync(It.IsAny<string>(), default))
            .Returns(Task.CompletedTask);

        // After replace, reload returns category with new translations
        var updatedCategory = BuildCategory();
        updatedCategory.Id = category.Id;
        updatedCategory.Translations = new List<CategoryTranslation>
        {
            new()
            {
                Id = Guid.NewGuid(),
                CategoryId = category.Id,
                Locale = "es",
                Name = "Volantes Actualizado",
                Slug = "volantes-actualizado",
                ShortDescription = "Descripción actualizada"
            },
            new()
            {
                Id = Guid.NewGuid(),
                CategoryId = category.Id,
                Locale = "en",
                Name = "Wheels Updated",
                Slug = "wheels-updated"
            }
        };

        // Setup for the two GetByIdAsync calls (first check + reload after replace)
        _adminRepoMock.SetupSequence(r => r.GetByIdAsync(category.Id))
            .ReturnsAsync(category)
            .ReturnsAsync(updatedCategory);

        // Act
        var result = await _controller.UpdateTranslations(category.Id, dto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var detail = okResult.Value.Should().BeOfType<CategoryDetailDto>().Subject;
        detail.Name.Should().Be("Volantes Actualizado");
    }

    [Fact]
    public async Task UpdateTranslations_WithNonExistentCategory_Returns404()
    {
        // Arrange
        var dto = new UpdateCategoryTranslationsDto
        {
            Translations = new List<CategoryTranslationInputDto>
            {
                new() { Locale = "es", Name = "Test", Slug = "test" }
            }
        };

        _adminRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync((Category?)null);

        // Act
        var result = await _controller.UpdateTranslations(Guid.NewGuid(), dto);

        // Assert
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task UpdateTranslations_CallsReplaceTranslations()
    {
        // Arrange
        var category = BuildCategory();
        var dto = new UpdateCategoryTranslationsDto
        {
            Translations = new List<CategoryTranslationInputDto>
            {
                new() { Locale = "es", Name = "Nuevo Nombre", Slug = "nuevo-nombre" },
                new() { Locale = "en", Name = "New Name", Slug = "new-name" }
            }
        };

        _adminRepoMock.Setup(r => r.GetByIdAsync(category.Id))
            .ReturnsAsync(category);

        _adminRepoMock.Setup(r => r.ReplaceTranslationsAsync(category.Id, It.IsAny<List<CategoryTranslation>>()))
            .Returns(Task.CompletedTask);

        _cacheMock.Setup(c => c.RemoveAsync(It.IsAny<string>(), default))
            .Returns(Task.CompletedTask);

        // Act
        await _controller.UpdateTranslations(category.Id, dto);

        // Assert
        _adminRepoMock.Verify(r => r.ReplaceTranslationsAsync(category.Id,
            It.Is<List<CategoryTranslation>>(t => t.Count == 2)), Times.Once);
    }

    #endregion
}
