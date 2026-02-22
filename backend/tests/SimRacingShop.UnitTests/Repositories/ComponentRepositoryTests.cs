using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Entities;
using SimRacingShop.Infrastructure.Data;
using SimRacingShop.Infrastructure.Repositories;

namespace SimRacingShop.UnitTests.Repositories;

public class ComponentRepositoryTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly ComponentRepository _repository;

    public ComponentRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);
        _repository = new ComponentRepository(_context);
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    #region Helper Methods

    private async Task<Component> SeedComponent(
        string sku = "COMP-001",
        string componentType = "grip",
        int stockQuantity = 10,
        string locale = "es",
        string name = "Grip Estándar",
        string? description = "Grip de cuero sintético")
    {
        var component = new Component
        {
            Id = Guid.NewGuid(),
            Sku = sku,
            ComponentType = componentType,
            StockQuantity = stockQuantity,
            MinStockThreshold = 5,
            LeadTimeDays = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var translation = new ComponentTranslation
        {
            Id = Guid.NewGuid(),
            ComponentId = component.Id,
            Locale = locale,
            Name = name,
            Description = description
        };

        _context.Components.Add(component);
        _context.ComponentTranslations.Add(translation);
        await _context.SaveChangesAsync();

        return component;
    }

    private async Task<Product> SeedProduct(
        string sku = "SKU-001",
        string locale = "es",
        string name = "Volante F1",
        string slug = "volante-f1")
    {
        var product = new Product
        {
            Id = Guid.NewGuid(),
            Sku = sku,
            BasePrice = 299.99m,
            VatRate = 21.00m,
            IsActive = true,
            IsCustomizable = true,
            BaseProductionDays = 7,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var translation = new ProductTranslation
        {
            Id = Guid.NewGuid(),
            ProductId = product.Id,
            Locale = locale,
            Name = name,
            Slug = slug
        };

        _context.Products.Add(product);
        _context.ProductTranslations.Add(translation);
        await _context.SaveChangesAsync();

        return product;
    }

    private async Task<ProductComponentOption> SeedProductComponentOption(
        Guid productId,
        Guid componentId,
        string optionGroup = "grip_color",
        decimal priceModifier = 0.00m,
        bool isDefault = false,
        int displayOrder = 0)
    {
        var option = new ProductComponentOption
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            ComponentId = componentId,
            OptionGroup = optionGroup,
            PriceModifier = priceModifier,
            IsDefault = isDefault,
            DisplayOrder = displayOrder
        };

        _context.ProductComponentOptions.Add(option);
        await _context.SaveChangesAsync();

        return option;
    }

    #endregion

    #region GetComponentsAsync Tests

    [Fact]
    public async Task GetComponents_ReturnsAllComponents()
    {
        // Arrange
        await SeedComponent(sku: "COMP-001", name: "Grip Rojo", componentType: "grip");
        await SeedComponent(sku: "COMP-002", name: "Botonera 12", componentType: "button_plate");

        var filter = new ComponentFilterDto { Locale = "es" };

        // Act
        var result = await _repository.GetComponentsAsync(filter);

        // Assert
        result.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(2);
    }

    [Fact]
    public async Task GetComponents_Pagination_ReturnsCorrectPage()
    {
        // Arrange
        for (int i = 0; i < 5; i++)
        {
            await SeedComponent(sku: $"COMP-{i:000}", name: $"Component {i}");
        }

        var filter = new ComponentFilterDto { Locale = "es", Page = 2, PageSize = 2 };

        // Act
        var result = await _repository.GetComponentsAsync(filter);

        // Assert
        result.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(5);
        result.Page.Should().Be(2);
        result.PageSize.Should().Be(2);
        result.TotalPages.Should().Be(3);
    }

    [Fact]
    public async Task GetComponents_FilterByComponentType_ReturnsOnlyMatchingType()
    {
        // Arrange
        await SeedComponent(sku: "COMP-001", name: "Grip Rojo", componentType: "grip");
        await SeedComponent(sku: "COMP-002", name: "Botonera 12", componentType: "button_plate");

        var filter = new ComponentFilterDto { Locale = "es", ComponentType = "grip" };

        // Act
        var result = await _repository.GetComponentsAsync(filter);

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items[0].ComponentType.Should().Be("grip");
    }

    [Fact]
    public async Task GetComponents_FilterByInStock_ReturnsOnlyInStockComponents()
    {
        // Arrange
        await SeedComponent(sku: "COMP-001", name: "In Stock", stockQuantity: 10);
        await SeedComponent(sku: "COMP-002", name: "Out of Stock", stockQuantity: 0);

        var filter = new ComponentFilterDto { Locale = "es", InStock = true };

        // Act
        var result = await _repository.GetComponentsAsync(filter);

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items[0].Name.Should().Be("In Stock");
        result.Items[0].InStock.Should().BeTrue();
    }

    [Fact]
    public async Task GetComponents_FilterByOutOfStock_ReturnsOnlyOutOfStockComponents()
    {
        // Arrange
        await SeedComponent(sku: "COMP-001", name: "In Stock", stockQuantity: 10);
        await SeedComponent(sku: "COMP-002", name: "Out of Stock", stockQuantity: 0);

        var filter = new ComponentFilterDto { Locale = "es", InStock = false };

        // Act
        var result = await _repository.GetComponentsAsync(filter);

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items[0].Name.Should().Be("Out of Stock");
        result.Items[0].InStock.Should().BeFalse();
    }

    [Fact]
    public async Task GetComponents_FilterByLocale_ReturnsOnlyMatchingLocale()
    {
        // Arrange
        var component = await SeedComponent(sku: "COMP-001", name: "Grip Rojo", locale: "es");

        // Add English translation
        _context.ComponentTranslations.Add(new ComponentTranslation
        {
            Id = Guid.NewGuid(),
            ComponentId = component.Id,
            Locale = "en",
            Name = "Red Grip"
        });
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var filterEs = new ComponentFilterDto { Locale = "es" };
        var filterEn = new ComponentFilterDto { Locale = "en" };

        // Act
        var resultEs = await _repository.GetComponentsAsync(filterEs);
        var resultEn = await _repository.GetComponentsAsync(filterEn);

        // Assert
        resultEs.Items.Should().HaveCount(1);
        resultEs.Items[0].Name.Should().Be("Grip Rojo");

        resultEn.Items.Should().HaveCount(1);
        resultEn.Items[0].Name.Should().Be("Red Grip");
    }

    [Fact]
    public async Task GetComponents_ExcludesComponentsWithoutTranslation()
    {
        // Arrange
        await SeedComponent(sku: "COMP-001", name: "Solo Español", locale: "es");

        var filter = new ComponentFilterDto { Locale = "en" };

        // Act
        var result = await _repository.GetComponentsAsync(filter);

        // Assert
        result.Items.Should().BeEmpty();
    }

    [Fact]
    public async Task GetComponents_ClampsPageSizeTo50()
    {
        // Arrange
        await SeedComponent(sku: "COMP-001", name: "Component");

        var filter = new ComponentFilterDto { Locale = "es", PageSize = 100 };

        // Act
        var result = await _repository.GetComponentsAsync(filter);

        // Assert
        result.PageSize.Should().Be(50);
    }

    [Fact]
    public async Task GetComponents_ClampsPageToMinimum1()
    {
        // Arrange
        await SeedComponent(sku: "COMP-001", name: "Component");

        var filter = new ComponentFilterDto { Locale = "es", Page = 0 };

        // Act
        var result = await _repository.GetComponentsAsync(filter);

        // Assert
        result.Page.Should().Be(1);
    }

    [Fact]
    public async Task GetComponents_InStockComputedCorrectly()
    {
        // Arrange
        await SeedComponent(sku: "COMP-001", name: "Has Stock", stockQuantity: 5);
        await SeedComponent(sku: "COMP-002", name: "No Stock", stockQuantity: 0);

        var filter = new ComponentFilterDto { Locale = "es" };

        // Act
        var result = await _repository.GetComponentsAsync(filter);

        // Assert
        var hasStock = result.Items.First(x => x.Name == "Has Stock");
        var noStock = result.Items.First(x => x.Name == "No Stock");

        hasStock.InStock.Should().BeTrue();
        hasStock.StockQuantity.Should().Be(5);

        noStock.InStock.Should().BeFalse();
        noStock.StockQuantity.Should().Be(0);
    }

    #endregion

    #region GetComponentsByProductIdAsync Tests

    [Fact]
    public async Task GetComponentsByProductId_ReturnsComponentOptions()
    {
        // Arrange
        var product = await SeedProduct();
        var grip = await SeedComponent(sku: "COMP-001", name: "Grip Rojo", componentType: "grip");
        await SeedProductComponentOption(product.Id, grip.Id, "grip_color", 0m, true, 0);

        // Act
        var result = await _repository.GetComponentsByProductIdAsync(product.Id, "es");

        // Assert
        result.Should().HaveCount(1);
        result[0].ComponentId.Should().Be(grip.Id);
        result[0].Name.Should().Be("Grip Rojo");
        result[0].OptionGroup.Should().Be("grip_color");
        result[0].IsDefault.Should().BeTrue();
    }

    [Fact]
    public async Task GetComponentsByProductId_ReturnsEmptyForUnknownProduct()
    {
        // Act
        var result = await _repository.GetComponentsByProductIdAsync(Guid.NewGuid(), "es");

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetComponentsByProductId_FiltersByLocale()
    {
        // Arrange
        var product = await SeedProduct();
        var component = await SeedComponent(sku: "COMP-001", name: "Grip Rojo", locale: "es");
        await SeedProductComponentOption(product.Id, component.Id, "grip_color");

        // Act
        var resultEs = await _repository.GetComponentsByProductIdAsync(product.Id, "es");
        var resultEn = await _repository.GetComponentsByProductIdAsync(product.Id, "en");

        // Assert
        resultEs.Should().HaveCount(1);
        resultEn.Should().BeEmpty();
    }

    [Fact]
    public async Task GetComponentsByProductId_OrderedByOptionGroupThenDisplayOrder()
    {
        // Arrange
        var product = await SeedProduct();
        var comp1 = await SeedComponent(sku: "COMP-001", name: "Botonera 24", componentType: "button_plate");
        var comp2 = await SeedComponent(sku: "COMP-002", name: "Grip Rojo", componentType: "grip");
        var comp3 = await SeedComponent(sku: "COMP-003", name: "Grip Azul", componentType: "grip");

        await SeedProductComponentOption(product.Id, comp1.Id, "button_layout", 30m, false, 0);
        await SeedProductComponentOption(product.Id, comp2.Id, "grip_color", 0m, true, 0);
        await SeedProductComponentOption(product.Id, comp3.Id, "grip_color", 5m, false, 1);

        // Act
        var result = await _repository.GetComponentsByProductIdAsync(product.Id, "es");

        // Assert
        result.Should().HaveCount(3);
        result[0].OptionGroup.Should().Be("button_layout");
        result[1].OptionGroup.Should().Be("grip_color");
        result[1].DisplayOrder.Should().Be(0);
        result[2].OptionGroup.Should().Be("grip_color");
        result[2].DisplayOrder.Should().Be(1);
    }

    [Fact]
    public async Task GetComponentsByProductId_MapeaSkuComponentTypeYDescription()
    {
        // Arrange
        var product = await SeedProduct();
        var component = await SeedComponent(
            sku: "COMP-GRIP-001",
            componentType: "grip",
            name: "Grip Alcantara",
            description: "Grip de material alcantara premium");
        await SeedProductComponentOption(product.Id, component.Id, "grip_material");

        // Act
        var result = await _repository.GetComponentsByProductIdAsync(product.Id, "es");

        // Assert
        result.Should().HaveCount(1);
        result[0].Sku.Should().Be("COMP-GRIP-001");
        result[0].ComponentType.Should().Be("grip");
        result[0].Description.Should().Be("Grip de material alcantara premium");
    }

    [Fact]
    public async Task GetComponentsByProductId_IncludesPriceModifierAndStockInfo()
    {
        // Arrange
        var product = await SeedProduct();
        var component = await SeedComponent(sku: "COMP-001", name: "Grip Alcantara", stockQuantity: 3);
        await SeedProductComponentOption(product.Id, component.Id, "grip_material", 15.00m, false, 0);

        // Act
        var result = await _repository.GetComponentsByProductIdAsync(product.Id, "es");

        // Assert
        result.Should().HaveCount(1);
        result[0].PriceModifier.Should().Be(15.00m);
        result[0].StockQuantity.Should().Be(3);
        result[0].InStock.Should().BeTrue();
    }

    #endregion
}
