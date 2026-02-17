using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using SimRacingShop.Core.Entities;
using SimRacingShop.Infrastructure.Data;
using SimRacingShop.Infrastructure.Repositories;

namespace SimRacingShop.UnitTests.Repositories;

public class OrderRepositoryTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly OrderRepository _repository;
    private readonly Guid _userId;

    public OrderRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new ApplicationDbContext(options);
        _repository = new OrderRepository(_context);
        _userId = Guid.NewGuid();
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    #region Helper Methods

    private async Task<Order> SeedOrder(
        Guid? userId = null,
        string? orderNumber = null,
        string status = "pending",
        DateTime? createdAt = null,
        IEnumerable<OrderItem>? items = null)
    {
        var order = new Order
        {
            Id = Guid.NewGuid(),
            UserId = userId ?? _userId,
            OrderNumber = orderNumber ?? $"ORD-{Guid.NewGuid():N}",
            ShippingStreet = "Calle Mayor 1",
            ShippingCity = "Madrid",
            ShippingPostalCode = "28001",
            ShippingCountry = "ES",
            Subtotal = 100m,
            VatAmount = 21m,
            ShippingCost = 5m,
            TotalAmount = 126m,
            OrderStatus = status,
            CreatedAt = createdAt ?? DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        if (items != null)
        {
            foreach (var item in items)
            {
                item.OrderId = order.Id;
                _context.OrderItems.Add(item);
            }
            await _context.SaveChangesAsync();
        }

        return order;
    }

    private static OrderItem BuildItem(string name = "Volante GT Pro", decimal unitPrice = 100m) =>
        new()
        {
            Id = Guid.NewGuid(),
            ProductName = name,
            ProductSku = $"SKU-{Guid.NewGuid():N}",
            Quantity = 1,
            UnitPrice = unitPrice,
            LineTotal = unitPrice,
            CreatedAt = DateTime.UtcNow
        };

    #endregion

    #region CreateAsync Tests

    [Fact]
    public async Task CreateAsync_WithValidOrder_CreatesSuccessfully()
    {
        // Arrange
        var order = new Order
        {
            Id = Guid.NewGuid(),
            UserId = _userId,
            OrderNumber = "ORD-20260217-0001",
            ShippingStreet = "Gran Vía 10",
            ShippingCity = "Madrid",
            ShippingPostalCode = "28013",
            ShippingCountry = "ES",
            Subtotal = 200m,
            VatAmount = 42m,
            ShippingCost = 0m,
            TotalAmount = 242m,
            OrderStatus = "pending",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Act
        var result = await _repository.CreateAsync(order);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(order.Id);
        result.OrderNumber.Should().Be("ORD-20260217-0001");

        var saved = await _context.Orders.FindAsync(new object[] { order.Id }, TestContext.Current.CancellationToken);
        saved.Should().NotBeNull();
        saved!.UserId.Should().Be(_userId);
        saved.OrderStatus.Should().Be("pending");
    }

    [Fact]
    public async Task CreateAsync_WithGuestOrder_CreatesWithNullUserId()
    {
        // Arrange
        var order = new Order
        {
            Id = Guid.NewGuid(),
            UserId = null,
            OrderNumber = "ORD-GUEST-0001",
            ShippingStreet = "Calle Serrano 5",
            ShippingCity = "Madrid",
            ShippingPostalCode = "28001",
            ShippingCountry = "ES",
            Subtotal = 50m,
            VatAmount = 10.5m,
            ShippingCost = 5m,
            TotalAmount = 65.5m,
            OrderStatus = "pending",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Act
        var result = await _repository.CreateAsync(order);

        // Assert
        result.Should().NotBeNull();
        result.UserId.Should().BeNull();

        var saved = await _context.Orders.FindAsync(new object[] { order.Id }, TestContext.Current.CancellationToken);
        saved.Should().NotBeNull();
        saved!.UserId.Should().BeNull();
    }

    #endregion

    #region GetByIdAsync Tests

    [Fact]
    public async Task GetByIdAsync_WithExistingOrder_ReturnsOrder()
    {
        // Arrange
        var order = await SeedOrder();

        // Act
        var result = await _repository.GetByIdAsync(order.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(order.Id);
        result.UserId.Should().Be(_userId);
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

    #region GetByIdWithItemsAsync Tests

    [Fact]
    public async Task GetByIdWithItemsAsync_WithExistingOrderAndItems_ReturnsOrderWithItems()
    {
        // Arrange
        var order = await SeedOrder(items: [BuildItem("Volante GT Pro"), BuildItem("Pedales Pro")]);

        // Act
        var result = await _repository.GetByIdWithItemsAsync(order.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(order.Id);
        result.OrderItems.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetByIdWithItemsAsync_WithOrderWithNoItems_ReturnsEmptyCollection()
    {
        // Arrange
        var order = await SeedOrder();

        // Act
        var result = await _repository.GetByIdWithItemsAsync(order.Id);

        // Assert
        result.Should().NotBeNull();
        result!.OrderItems.Should().BeEmpty();
    }

    [Fact]
    public async Task GetByIdWithItemsAsync_WithNonExistentId_ReturnsNull()
    {
        // Act
        var result = await _repository.GetByIdWithItemsAsync(Guid.NewGuid());

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region GetByOrderNumberAsync Tests

    [Fact]
    public async Task GetByOrderNumberAsync_WithExistingOrderNumber_ReturnsOrder()
    {
        // Arrange
        var order = await SeedOrder(orderNumber: "ORD-20260217-0042", items: [BuildItem()]);

        // Act
        var result = await _repository.GetByOrderNumberAsync("ORD-20260217-0042");

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(order.Id);
        result.OrderNumber.Should().Be("ORD-20260217-0042");
        result.OrderItems.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetByOrderNumberAsync_WithNonExistentOrderNumber_ReturnsNull()
    {
        // Act
        var result = await _repository.GetByOrderNumberAsync("ORD-INEXISTENTE");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByOrderNumberAsync_ReturnsCorrectOrderAmongMultiple()
    {
        // Arrange
        await SeedOrder(orderNumber: "ORD-2026-001");
        var targetOrder = await SeedOrder(orderNumber: "ORD-2026-002");

        // Act
        var result = await _repository.GetByOrderNumberAsync("ORD-2026-002");

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(targetOrder.Id);
    }

    #endregion

    #region GetByUserIdAsync Tests

    [Fact]
    public async Task GetByUserIdAsync_WithMultipleOrders_ReturnsAllOrdersForUser()
    {
        // Arrange
        await SeedOrder();
        await SeedOrder();
        await SeedOrder(userId: Guid.NewGuid()); // otro usuario

        // Act
        var result = await _repository.GetByUserIdAsync(_userId);

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(o => o.UserId == _userId);
    }

    [Fact]
    public async Task GetByUserIdAsync_WithNoOrders_ReturnsEmpty()
    {
        // Act
        var result = await _repository.GetByUserIdAsync(_userId);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetByUserIdAsync_ReturnsOrdersDescendingByCreatedAt()
    {
        // Arrange
        var oldest = await SeedOrder(createdAt: DateTime.UtcNow.AddDays(-2));
        var middle = await SeedOrder(createdAt: DateTime.UtcNow.AddDays(-1));
        var newest = await SeedOrder(createdAt: DateTime.UtcNow);

        // Act
        var result = (await _repository.GetByUserIdAsync(_userId)).ToList();

        // Assert
        result.Should().HaveCount(3);
        result[0].Id.Should().Be(newest.Id);
        result[1].Id.Should().Be(middle.Id);
        result[2].Id.Should().Be(oldest.Id);
    }

    #endregion

    #region GetByUserIdWithItemsAsync Tests

    [Fact]
    public async Task GetByUserIdWithItemsAsync_WithOrders_ReturnsOrdersWithItems()
    {
        // Arrange
        await SeedOrder(items: [BuildItem("Item A"), BuildItem("Item B")]);
        await SeedOrder(items: [BuildItem("Item C")]);

        // Act
        var result = (await _repository.GetByUserIdWithItemsAsync(_userId)).ToList();

        // Assert
        result.Should().HaveCount(2);
        result.Sum(o => o.OrderItems.Count).Should().Be(3);
    }

    [Fact]
    public async Task GetByUserIdWithItemsAsync_ExcludesOtherUsersOrders()
    {
        // Arrange
        await SeedOrder(userId: _userId);
        await SeedOrder(userId: Guid.NewGuid());

        // Act
        var result = await _repository.GetByUserIdWithItemsAsync(_userId);

        // Assert
        result.Should().HaveCount(1);
        result.Should().OnlyContain(o => o.UserId == _userId);
    }

    [Fact]
    public async Task GetByUserIdWithItemsAsync_ReturnsOrdersDescendingByCreatedAt()
    {
        // Arrange
        var oldest = await SeedOrder(createdAt: DateTime.UtcNow.AddDays(-3));
        var newest = await SeedOrder(createdAt: DateTime.UtcNow);

        // Act
        var result = (await _repository.GetByUserIdWithItemsAsync(_userId)).ToList();

        // Assert
        result[0].Id.Should().Be(newest.Id);
        result[1].Id.Should().Be(oldest.Id);
    }

    #endregion

    #region CountByOrderNumberPrefixAsync Tests

    [Fact]
    public async Task CountByOrderNumberPrefixAsync_WithMatchingOrders_ReturnsCorrectCount()
    {
        // Arrange
        await SeedOrder(orderNumber: "ORD-20260217-0001");
        await SeedOrder(orderNumber: "ORD-20260217-0002");
        await SeedOrder(orderNumber: "ORD-20260218-0001"); // día diferente

        // Act
        var result = await _repository.CountByOrderNumberPrefixAsync("ORD-20260217");

        // Assert
        result.Should().Be(2);
    }

    [Fact]
    public async Task CountByOrderNumberPrefixAsync_WithNoMatchingOrders_ReturnsZero()
    {
        // Arrange
        await SeedOrder(orderNumber: "ORD-20260217-0001");

        // Act
        var result = await _repository.CountByOrderNumberPrefixAsync("ORD-20260218");

        // Assert
        result.Should().Be(0);
    }

    [Fact]
    public async Task CountByOrderNumberPrefixAsync_WithEmptyDatabase_ReturnsZero()
    {
        // Act
        var result = await _repository.CountByOrderNumberPrefixAsync("ORD-20260217");

        // Assert
        result.Should().Be(0);
    }

    [Fact]
    public async Task CountByOrderNumberPrefixAsync_CountsAllMatchingRegardlessOfUser()
    {
        // Arrange
        await SeedOrder(userId: _userId, orderNumber: "ORD-20260217-0001");
        await SeedOrder(userId: Guid.NewGuid(), orderNumber: "ORD-20260217-0002");

        // Act
        var result = await _repository.CountByOrderNumberPrefixAsync("ORD-20260217");

        // Assert
        result.Should().Be(2);
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_WithValidChanges_UpdatesSuccessfully()
    {
        // Arrange
        var order = await SeedOrder(status: "pending");
        order.OrderStatus = "processing";
        order.TrackingNumber = "TRACK-12345";

        // Act
        await _repository.UpdateAsync(order);

        // Assert
        var updated = await _context.Orders.FindAsync(new object[] { order.Id }, TestContext.Current.CancellationToken);
        updated.Should().NotBeNull();
        updated!.OrderStatus.Should().Be("processing");
        updated.TrackingNumber.Should().Be("TRACK-12345");
    }

    [Fact]
    public async Task UpdateAsync_SetsUpdatedAtTimestamp()
    {
        // Arrange
        var order = await SeedOrder();
        var originalUpdatedAt = order.UpdatedAt;

        await Task.Delay(100, TestContext.Current.CancellationToken);

        order.OrderStatus = "shipped";

        // Act
        await _repository.UpdateAsync(order);

        // Assert
        var updated = await _context.Orders.FindAsync(new object[] { order.Id }, TestContext.Current.CancellationToken);
        updated.Should().NotBeNull();
        updated!.UpdatedAt.Should().BeAfter(originalUpdatedAt);
    }

    [Fact]
    public async Task UpdateAsync_DoesNotAffectOtherOrders()
    {
        // Arrange
        var order1 = await SeedOrder(status: "pending");
        var order2 = await SeedOrder(status: "pending");

        order1.OrderStatus = "shipped";

        // Act
        await _repository.UpdateAsync(order1);

        // Assert
        var untouched = await _context.Orders.FindAsync(new object[] { order2.Id }, TestContext.Current.CancellationToken);
        untouched.Should().NotBeNull();
        untouched!.OrderStatus.Should().Be("pending");
    }

    [Fact]
    public async Task UpdateAsync_CanSetShippedAtAndTrackingNumber()
    {
        // Arrange
        var order = await SeedOrder(status: "processing");
        var shippedAt = DateTime.UtcNow;
        order.OrderStatus = "shipped";
        order.ShippedAt = shippedAt;
        order.TrackingNumber = "ES123456789ES";

        // Act
        await _repository.UpdateAsync(order);

        // Assert
        var updated = await _context.Orders.FindAsync(new object[] { order.Id }, TestContext.Current.CancellationToken);
        updated.Should().NotBeNull();
        updated!.OrderStatus.Should().Be("shipped");
        updated.ShippedAt.Should().BeCloseTo(shippedAt, TimeSpan.FromSeconds(1));
        updated.TrackingNumber.Should().Be("ES123456789ES");
    }

    #endregion
}
