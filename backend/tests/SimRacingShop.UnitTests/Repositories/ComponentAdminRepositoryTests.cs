using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using SimRacingShop.Core.Entities;
using SimRacingShop.Infrastructure.Data;
using SimRacingShop.Infrastructure.Repositories;

namespace SimRacingShop.UnitTests.Repositories;

public class ComponentAdminRepositoryTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly ComponentAdminRepository _repository;

    public ComponentAdminRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);
        _repository = new ComponentAdminRepository(_context);
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    #region Helper Methods

    private Component BuildComponent(
        string sku = "COMP-001",
        string componentType = "grip",
        int stockQuantity = 10,
        int minStockThreshold = 5,
        string locale = "es",
        string name = "Grip Estándar")
    {
        return new Component
        {
            Id = Guid.NewGuid(),
            Sku = sku,
            ComponentType = componentType,
            StockQuantity = stockQuantity,
            MinStockThreshold = minStockThreshold,
            LeadTimeDays = 3,
            CostPrice = 15.00m,
            Translations = new List<ComponentTranslation>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    Locale = locale,
                    Name = name,
                    Description = "Descripción del componente"
                }
            }
        };
    }

    #endregion

    #region CreateAsync Tests

    [Fact]
    public async Task CreateAsync_SavesComponentToDatabase()
    {
        // Arrange
        var component = BuildComponent();

        // Act
        var result = await _repository.CreateAsync(component);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(component.Id);

        var saved = await _context.Components.FindAsync(
            new object[] { component.Id }, TestContext.Current.CancellationToken);
        saved.Should().NotBeNull();
        saved!.Sku.Should().Be("COMP-001");
    }

    [Fact]
    public async Task CreateAsync_SavesTranslationsWithComponent()
    {
        // Arrange
        var component = BuildComponent();

        // Act
        await _repository.CreateAsync(component);

        // Assert
        var translations = await _context.ComponentTranslations
            .Where(t => t.ComponentId == component.Id)
            .ToListAsync(TestContext.Current.CancellationToken);

        translations.Should().HaveCount(1);
        translations[0].Name.Should().Be("Grip Estándar");
        translations[0].Locale.Should().Be("es");
    }

    #endregion

    #region GetByIdAsync Tests

    [Fact]
    public async Task GetByIdAsync_WithExistingComponent_ReturnsWithTranslations()
    {
        // Arrange
        var component = BuildComponent();
        _context.Components.Add(component);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _repository.GetByIdAsync(component.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Sku.Should().Be("COMP-001");
        result.Translations.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistentId_ReturnsNull()
    {
        // Act
        var result = await _repository.GetByIdAsync(Guid.NewGuid());

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_UpdatesComponentFields()
    {
        // Arrange
        var component = BuildComponent();
        _context.Components.Add(component);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        component.StockQuantity = 50;
        component.CostPrice = 25.00m;
        await _repository.UpdateAsync(component);

        // Assert
        var updated = await _context.Components.FindAsync(
            new object[] { component.Id }, TestContext.Current.CancellationToken);
        updated!.StockQuantity.Should().Be(50);
        updated.CostPrice.Should().Be(25.00m);
    }

    #endregion

    #region DeleteAsync Tests

    [Fact]
    public async Task DeleteAsync_RemovesComponentFromDatabase()
    {
        // Arrange
        var component = BuildComponent();
        _context.Components.Add(component);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        await _repository.DeleteAsync(component);

        // Assert
        var deleted = await _context.Components.FindAsync(
            new object[] { component.Id }, TestContext.Current.CancellationToken);
        deleted.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_CascadeDeletesTranslations()
    {
        // Arrange
        var component = BuildComponent();
        _context.Components.Add(component);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        await _repository.DeleteAsync(component);

        // Assert
        var translations = await _context.ComponentTranslations
            .Where(t => t.ComponentId == component.Id)
            .ToListAsync(TestContext.Current.CancellationToken);

        translations.Should().BeEmpty();
    }

    #endregion

    #region ReplaceTranslationsAsync Tests

    [Fact]
    public async Task ReplaceTranslationsAsync_ReplacesExistingTranslations()
    {
        // Arrange
        var component = BuildComponent(locale: "es", name: "Original");
        _context.Components.Add(component);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var newTranslations = new List<ComponentTranslation>
        {
            new() { Id = Guid.NewGuid(), Locale = "es", Name = "Nuevo Nombre" },
            new() { Id = Guid.NewGuid(), Locale = "en", Name = "New Name" }
        };

        // Act
        await _repository.ReplaceTranslationsAsync(component.Id, newTranslations);

        // Assert
        var translations = await _context.ComponentTranslations
            .Where(t => t.ComponentId == component.Id)
            .ToListAsync(TestContext.Current.CancellationToken);

        translations.Should().HaveCount(2);
        translations.Should().Contain(t => t.Name == "Nuevo Nombre" && t.Locale == "es");
        translations.Should().Contain(t => t.Name == "New Name" && t.Locale == "en");
    }

    [Fact]
    public async Task ReplaceTranslationsAsync_RemovesOldTranslations()
    {
        // Arrange
        var component = BuildComponent(locale: "es", name: "Original");
        _context.Components.Add(component);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var originalTranslationId = component.Translations.First().Id;

        var newTranslations = new List<ComponentTranslation>
        {
            new() { Id = Guid.NewGuid(), Locale = "en", Name = "English Only" }
        };

        // Act
        await _repository.ReplaceTranslationsAsync(component.Id, newTranslations);

        // Assert
        var oldTranslation = await _context.ComponentTranslations.FindAsync(
            new object[] { originalTranslationId }, TestContext.Current.CancellationToken);
        oldTranslation.Should().BeNull();
    }

    #endregion

    #region SkuExistsAsync Tests

    [Fact]
    public async Task SkuExistsAsync_WithExistingSku_ReturnsTrue()
    {
        // Arrange
        var component = BuildComponent(sku: "COMP-EXISTS");
        _context.Components.Add(component);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _repository.SkuExistsAsync("COMP-EXISTS");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task SkuExistsAsync_WithNonExistentSku_ReturnsFalse()
    {
        // Act
        var result = await _repository.SkuExistsAsync("COMP-NONEXISTENT");

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region GetLowStockAsync Tests

    [Fact]
    public async Task GetLowStockAsync_ReturnsComponentsBelowThreshold()
    {
        // Arrange
        var lowStock = BuildComponent(sku: "COMP-001", name: "Bajo Stock", stockQuantity: 2, minStockThreshold: 5);
        var atThreshold = BuildComponent(sku: "COMP-002", name: "En Umbral", stockQuantity: 5, minStockThreshold: 5);
        var aboveThreshold = BuildComponent(sku: "COMP-003", name: "Bien Stock", stockQuantity: 20, minStockThreshold: 5);

        _context.Components.AddRange(lowStock, atThreshold, aboveThreshold);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _repository.GetLowStockAsync();

        // Assert
        result.Should().HaveCount(2); // stockQuantity <= minStockThreshold
        result.Should().Contain(c => c.Sku == "COMP-001");
        result.Should().Contain(c => c.Sku == "COMP-002");
        result.Should().NotContain(c => c.Sku == "COMP-003");
    }

    [Fact]
    public async Task GetLowStockAsync_OrdersByStockQuantityAscending()
    {
        // Arrange
        var stock3 = BuildComponent(sku: "COMP-001", name: "Stock 3", stockQuantity: 3, minStockThreshold: 10);
        var stock0 = BuildComponent(sku: "COMP-002", name: "Stock 0", stockQuantity: 0, minStockThreshold: 10);
        var stock7 = BuildComponent(sku: "COMP-003", name: "Stock 7", stockQuantity: 7, minStockThreshold: 10);

        _context.Components.AddRange(stock3, stock0, stock7);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _repository.GetLowStockAsync();

        // Assert
        result.Should().HaveCount(3);
        result[0].StockQuantity.Should().Be(0);
        result[1].StockQuantity.Should().Be(3);
        result[2].StockQuantity.Should().Be(7);
    }

    [Fact]
    public async Task GetLowStockAsync_IncludesTranslations()
    {
        // Arrange
        var component = BuildComponent(stockQuantity: 1, minStockThreshold: 10);
        _context.Components.Add(component);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _repository.GetLowStockAsync();

        // Assert
        result.Should().HaveCount(1);
        result[0].Translations.Should().HaveCount(1);
        result[0].Translations.First().Name.Should().Be("Grip Estándar");
    }

    [Fact]
    public async Task GetLowStockAsync_WithNoLowStock_ReturnsEmptyList()
    {
        // Arrange
        var component = BuildComponent(stockQuantity: 100, minStockThreshold: 5);
        _context.Components.Add(component);
        await _context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Act
        var result = await _repository.GetLowStockAsync();

        // Assert
        result.Should().BeEmpty();
    }

    #endregion
}
