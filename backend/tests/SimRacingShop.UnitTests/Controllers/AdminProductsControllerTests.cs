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

public class AdminProductsControllerTests
{
    private readonly Mock<IProductAdminRepository> _adminRepoMock;
    private readonly Mock<IFileStorageService> _fileStorageMock;
    private readonly Mock<IDistributedCache> _cacheMock;
    private readonly Mock<ILogger<AdminProductsController>> _loggerMock;
    private readonly AdminProductsController _controller;

    public AdminProductsControllerTests()
    {
        _adminRepoMock = new Mock<IProductAdminRepository>();
        _fileStorageMock = new Mock<IFileStorageService>();
        _cacheMock = new Mock<IDistributedCache>();
        _loggerMock = new Mock<ILogger<AdminProductsController>>();

        _controller = new AdminProductsController(
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

    private static CreateProductDto BuildCreateDto(
        string sku = "SKU-001",
        decimal basePrice = 299.99m,
        string locale = "es",
        string name = "Volante F1",
        string slug = "volante-f1")
    {
        return new CreateProductDto
        {
            Sku = sku,
            BasePrice = basePrice,
            VatRate = 21.00m,
            IsActive = true,
            IsCustomizable = true,
            BaseProductionDays = 7,
            Translations = new List<ProductTranslationInputDto>
            {
                new()
                {
                    Locale = locale,
                    Name = name,
                    Slug = slug,
                    ShortDescription = "Volante de competición"
                }
            }
        };
    }

    private static Product BuildProduct(
        string sku = "SKU-001",
        string locale = "es",
        string name = "Volante F1",
        string slug = "volante-f1")
    {
        var productId = Guid.NewGuid();
        return new Product
        {
            Id = productId,
            Sku = sku,
            BasePrice = 299.99m,
            VatRate = 21.00m,
            IsActive = true,
            IsCustomizable = true,
            BaseProductionDays = 7,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Translations = new List<ProductTranslation>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    ProductId = productId,
                    Locale = locale,
                    Name = name,
                    Slug = slug,
                    ShortDescription = "Volante de competición"
                }
            },
            Images = new List<ProductImage>(),
            Specifications = new List<ProductSpecification>()
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

    #region CreateProduct Tests

    [Fact]
    public async Task CreateProduct_WithValidData_Returns201Created()
    {
        // Arrange
        var dto = BuildCreateDto();

        _adminRepoMock.Setup(r => r.CreateAsync(It.IsAny<Product>()))
            .ReturnsAsync((Product p) => p);

        _cacheMock.Setup(c => c.RemoveAsync(It.IsAny<string>(), default))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.CreateProduct(dto);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.StatusCode.Should().Be(201);

        var product = createdResult.Value.Should().BeOfType<ProductDetailDto>().Subject;
        product.Sku.Should().Be("SKU-001");
        product.Name.Should().Be("Volante F1");
    }

    [Fact]
    public async Task CreateProduct_CallsRepositoryCreate()
    {
        // Arrange
        var dto = BuildCreateDto();

        _adminRepoMock.Setup(r => r.CreateAsync(It.IsAny<Product>()))
            .ReturnsAsync((Product p) => p);

        _cacheMock.Setup(c => c.RemoveAsync(It.IsAny<string>(), default))
            .Returns(Task.CompletedTask);

        // Act
        await _controller.CreateProduct(dto);

        // Assert
        _adminRepoMock.Verify(r => r.CreateAsync(It.Is<Product>(p =>
            p.Sku == "SKU-001" &&
            p.BasePrice == 299.99m &&
            p.Translations.Count == 1)), Times.Once);
    }

    [Fact]
    public async Task CreateProduct_InvalidatesCacheAfterCreate()
    {
        // Arrange
        var dto = BuildCreateDto();

        _adminRepoMock.Setup(r => r.CreateAsync(It.IsAny<Product>()))
            .ReturnsAsync((Product p) => p);

        _cacheMock.Setup(c => c.RemoveAsync(It.IsAny<string>(), default))
            .Returns(Task.CompletedTask);

        // Act
        await _controller.CreateProduct(dto);

        // Assert - Should invalidate detail cache for the product
        _cacheMock.Verify(c => c.RemoveAsync(
            It.Is<string>(k => k.Contains("products:detail:")),
            default), Times.AtLeastOnce);
    }

    #endregion

    #region UpdateProduct Tests

    [Fact]
    public async Task UpdateProduct_WithExistingProduct_Returns200()
    {
        // Arrange
        var product = BuildProduct();
        var dto = new UpdateProductDto
        {
            BasePrice = 399.99m,
            VatRate = 21.00m,
            IsActive = true,
            IsCustomizable = true,
            BaseProductionDays = 10
        };

        _adminRepoMock.Setup(r => r.GetByIdAsync(product.Id))
            .ReturnsAsync(product);

        _adminRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Product>()))
            .Returns(Task.CompletedTask);

        _cacheMock.Setup(c => c.RemoveAsync(It.IsAny<string>(), default))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.UpdateProduct(product.Id, dto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var detail = okResult.Value.Should().BeOfType<ProductDetailDto>().Subject;
        detail.BasePrice.Should().Be(399.99m);
        detail.BaseProductionDays.Should().Be(10);
    }

    [Fact]
    public async Task UpdateProduct_WithNonExistentProduct_Returns404()
    {
        // Arrange
        var dto = new UpdateProductDto { BasePrice = 399.99m };

        _adminRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync((Product?)null);

        // Act
        var result = await _controller.UpdateProduct(Guid.NewGuid(), dto);

        // Assert
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task UpdateProduct_UpdatesProductFields()
    {
        // Arrange
        var product = BuildProduct();
        var dto = new UpdateProductDto
        {
            BasePrice = 499.99m,
            VatRate = 10.00m,
            Model3dUrl = "model.glb",
            Model3dSizeKb = 5000,
            IsActive = false,
            IsCustomizable = false,
            BaseProductionDays = 14,
            WeightGrams = 350
        };

        _adminRepoMock.Setup(r => r.GetByIdAsync(product.Id))
            .ReturnsAsync(product);

        _adminRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Product>()))
            .Returns(Task.CompletedTask);

        _cacheMock.Setup(c => c.RemoveAsync(It.IsAny<string>(), default))
            .Returns(Task.CompletedTask);

        // Act
        await _controller.UpdateProduct(product.Id, dto);

        // Assert
        _adminRepoMock.Verify(r => r.UpdateAsync(It.Is<Product>(p =>
            p.BasePrice == 499.99m &&
            p.VatRate == 10.00m &&
            p.Model3dUrl == "model.glb" &&
            p.IsActive == false &&
            p.WeightGrams == 350)), Times.Once);
    }

    #endregion

    #region DeleteProduct Tests

    [Fact]
    public async Task DeleteProduct_WithExistingProduct_Returns204()
    {
        // Arrange
        var product = BuildProduct();

        _adminRepoMock.Setup(r => r.GetByIdAsync(product.Id))
            .ReturnsAsync(product);

        _adminRepoMock.Setup(r => r.DeleteAsync(product))
            .Returns(Task.CompletedTask);

        _cacheMock.Setup(c => c.RemoveAsync(It.IsAny<string>(), default))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.DeleteProduct(product.Id);

        // Assert
        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task DeleteProduct_WithNonExistentProduct_Returns404()
    {
        // Arrange
        _adminRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync((Product?)null);

        // Act
        var result = await _controller.DeleteProduct(Guid.NewGuid());

        // Assert
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task DeleteProduct_DeletesAssociatedImageFiles()
    {
        // Arrange
        var product = BuildProduct();
        product.Images = new List<ProductImage>
        {
            new() { Id = Guid.NewGuid(), ImageUrl = "/uploads/products/img1.jpg", DisplayOrder = 1 },
            new() { Id = Guid.NewGuid(), ImageUrl = "/uploads/products/img2.jpg", DisplayOrder = 2 }
        };

        _adminRepoMock.Setup(r => r.GetByIdAsync(product.Id))
            .ReturnsAsync(product);

        _adminRepoMock.Setup(r => r.DeleteAsync(product))
            .Returns(Task.CompletedTask);

        _fileStorageMock.Setup(f => f.DeleteFileAsync(It.IsAny<string>()))
            .Returns(Task.CompletedTask);

        _cacheMock.Setup(c => c.RemoveAsync(It.IsAny<string>(), default))
            .Returns(Task.CompletedTask);

        // Act
        await _controller.DeleteProduct(product.Id);

        // Assert
        _fileStorageMock.Verify(f => f.DeleteFileAsync("/uploads/products/img1.jpg"), Times.Once);
        _fileStorageMock.Verify(f => f.DeleteFileAsync("/uploads/products/img2.jpg"), Times.Once);
    }

    #endregion

    #region UploadImages Tests

    [Fact]
    public async Task UploadImages_WithValidFiles_Returns201()
    {
        // Arrange
        var product = BuildProduct();
        var fileMock = CreateMockFormFile("photo.jpg");

        _adminRepoMock.Setup(r => r.GetByIdAsync(product.Id))
            .ReturnsAsync(product);

        _fileStorageMock.Setup(f => f.SaveFileAsync(It.IsAny<Stream>(), "photo.jpg", "products"))
            .ReturnsAsync("/uploads/products/abc.jpg");

        _adminRepoMock.Setup(r => r.AddImagesAsync(product.Id, It.IsAny<List<ProductImage>>()))
            .ReturnsAsync((Guid _, List<ProductImage> images) => images);

        _cacheMock.Setup(c => c.RemoveAsync(It.IsAny<string>(), default))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.UploadImages(product.Id, new List<IFormFile> { fileMock.Object });

        // Assert
        var createdResult = result.Should().BeOfType<CreatedResult>().Subject;
        createdResult.StatusCode.Should().Be(201);

        var images = createdResult.Value.Should().BeAssignableTo<List<ProductImageUploadResultDto>>().Subject;
        images.Should().HaveCount(1);
        images[0].ImageUrl.Should().Be("/uploads/products/abc.jpg");
    }

    [Fact]
    public async Task UploadImages_WithEmptyFileList_Returns400()
    {
        // Act
        var result = await _controller.UploadImages(Guid.NewGuid(), new List<IFormFile>());

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task UploadImages_WithNonExistentProduct_Returns404()
    {
        // Arrange
        var fileMock = CreateMockFormFile();

        _adminRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync((Product?)null);

        // Act
        var result = await _controller.UploadImages(Guid.NewGuid(), new List<IFormFile> { fileMock.Object });

        // Assert
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task UploadImages_WithInvalidFileType_Returns400()
    {
        // Arrange
        var product = BuildProduct();
        var fileMock = CreateMockFormFile("malware.exe");

        _adminRepoMock.Setup(r => r.GetByIdAsync(product.Id))
            .ReturnsAsync(product);

        _fileStorageMock.Setup(f => f.SaveFileAsync(It.IsAny<Stream>(), "malware.exe", "products"))
            .ThrowsAsync(new ArgumentException("Tipo de archivo no permitido"));

        // Act
        var result = await _controller.UploadImages(product.Id, new List<IFormFile> { fileMock.Object });

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task UploadImages_SetsCorrectDisplayOrder()
    {
        // Arrange
        var product = BuildProduct();
        product.Images = new List<ProductImage>
        {
            new() { Id = Guid.NewGuid(), ImageUrl = "/uploads/products/existing.jpg", DisplayOrder = 2 }
        };

        var fileMock = CreateMockFormFile("new.jpg");

        _adminRepoMock.Setup(r => r.GetByIdAsync(product.Id))
            .ReturnsAsync(product);

        _fileStorageMock.Setup(f => f.SaveFileAsync(It.IsAny<Stream>(), "new.jpg", "products"))
            .ReturnsAsync("/uploads/products/new.jpg");

        _adminRepoMock.Setup(r => r.AddImagesAsync(product.Id, It.IsAny<List<ProductImage>>()))
            .ReturnsAsync((Guid _, List<ProductImage> images) => images);

        _cacheMock.Setup(c => c.RemoveAsync(It.IsAny<string>(), default))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.UploadImages(product.Id, new List<IFormFile> { fileMock.Object });

        // Assert
        var createdResult = result.Should().BeOfType<CreatedResult>().Subject;
        var images = createdResult.Value.Should().BeAssignableTo<List<ProductImageUploadResultDto>>().Subject;
        images[0].DisplayOrder.Should().Be(3); // existing max is 2, new should be 3
    }

    #endregion

    #region UpdateTranslations Tests

    [Fact]
    public async Task UpdateTranslations_WithExistingProduct_Returns200()
    {
        // Arrange
        var product = BuildProduct();
        var dto = new UpdateProductTranslationsDto
        {
            Translations = new List<ProductTranslationInputDto>
            {
                new()
                {
                    Locale = "es",
                    Name = "Volante F1 Actualizado",
                    Slug = "volante-f1-actualizado",
                    ShortDescription = "Descripción actualizada"
                },
                new()
                {
                    Locale = "en",
                    Name = "F1 Wheel Updated",
                    Slug = "f1-wheel-updated"
                }
            }
        };

        _adminRepoMock.Setup(r => r.GetByIdAsync(product.Id))
            .ReturnsAsync(product);

        _adminRepoMock.Setup(r => r.ReplaceTranslationsAsync(product.Id, It.IsAny<List<ProductTranslation>>()))
            .Returns(Task.CompletedTask);

        _cacheMock.Setup(c => c.RemoveAsync(It.IsAny<string>(), default))
            .Returns(Task.CompletedTask);

        // After replace, reload returns product with new translations
        var updatedProduct = BuildProduct();
        updatedProduct.Id = product.Id;
        updatedProduct.Translations = new List<ProductTranslation>
        {
            new()
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                Locale = "es",
                Name = "Volante F1 Actualizado",
                Slug = "volante-f1-actualizado",
                ShortDescription = "Descripción actualizada"
            },
            new()
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                Locale = "en",
                Name = "F1 Wheel Updated",
                Slug = "f1-wheel-updated"
            }
        };

        // Setup for the second GetByIdAsync call (reload after replace)
        _adminRepoMock.SetupSequence(r => r.GetByIdAsync(product.Id))
            .ReturnsAsync(product)
            .ReturnsAsync(updatedProduct);

        // Act
        var result = await _controller.UpdateTranslations(product.Id, dto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var detail = okResult.Value.Should().BeOfType<ProductDetailDto>().Subject;
        detail.Name.Should().Be("Volante F1 Actualizado");
    }

    [Fact]
    public async Task UpdateTranslations_WithNonExistentProduct_Returns404()
    {
        // Arrange
        var dto = new UpdateProductTranslationsDto
        {
            Translations = new List<ProductTranslationInputDto>
            {
                new() { Locale = "es", Name = "Test", Slug = "test" }
            }
        };

        _adminRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync((Product?)null);

        // Act
        var result = await _controller.UpdateTranslations(Guid.NewGuid(), dto);

        // Assert
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task UpdateTranslations_CallsReplaceTranslations()
    {
        // Arrange
        var product = BuildProduct();
        var dto = new UpdateProductTranslationsDto
        {
            Translations = new List<ProductTranslationInputDto>
            {
                new() { Locale = "es", Name = "Nuevo Nombre", Slug = "nuevo-nombre" },
                new() { Locale = "en", Name = "New Name", Slug = "new-name" }
            }
        };

        _adminRepoMock.Setup(r => r.GetByIdAsync(product.Id))
            .ReturnsAsync(product);

        _adminRepoMock.Setup(r => r.ReplaceTranslationsAsync(product.Id, It.IsAny<List<ProductTranslation>>()))
            .Returns(Task.CompletedTask);

        _cacheMock.Setup(c => c.RemoveAsync(It.IsAny<string>(), default))
            .Returns(Task.CompletedTask);

        // Act
        await _controller.UpdateTranslations(product.Id, dto);

        // Assert
        _adminRepoMock.Verify(r => r.ReplaceTranslationsAsync(product.Id,
            It.Is<List<ProductTranslation>>(t => t.Count == 2)), Times.Once);
    }

    #endregion
}
