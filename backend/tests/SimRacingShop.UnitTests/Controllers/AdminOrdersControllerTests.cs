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

public class AdminOrdersControllerTests
{
    private readonly Mock<IOrderRepository> _orderRepositoryMock;
    private readonly Mock<ILogger<AdminOrdersController>> _loggerMock;
    private readonly AdminOrdersController _controller;

    public AdminOrdersControllerTests()
    {
        _orderRepositoryMock = new Mock<IOrderRepository>();
        _loggerMock = new Mock<ILogger<AdminOrdersController>>();

        _controller = new AdminOrdersController(
            _orderRepositoryMock.Object,
            _loggerMock.Object);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
            new(ClaimTypes.Role, "Admin"),
        };
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth")) }
        };
    }

    #region Helper Methods

    private static Order BuildOrder(
        string status = "pending",
        string? userEmail = "user@example.com",
        int itemCount = 1)
    {
        var order = new Order
        {
            Id = Guid.NewGuid(),
            OrderNumber = $"ORD-2026-{Guid.NewGuid():N}",
            UserId = Guid.NewGuid(),
            ShippingStreet = "Calle Mayor 1",
            ShippingCity = "Madrid",
            ShippingPostalCode = "28001",
            ShippingCountry = "ES",
            Subtotal = 299.99m,
            VatAmount = 62.99m,
            ShippingCost = 6.25m,
            TotalAmount = 369.23m,
            OrderStatus = status,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        if (userEmail != null)
        {
            order.User = new User { Email = userEmail };
        }

        for (int i = 0; i < itemCount; i++)
        {
            order.OrderItems.Add(new OrderItem
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                ProductName = $"Producto {i + 1}",
                ProductSku = $"SKU-{i + 1:000}",
                Quantity = 1,
                UnitPrice = 299.99m,
                LineTotal = 299.99m,
                CreatedAt = DateTime.UtcNow,
            });
        }

        return order;
    }

    #endregion

    #region GetOrders Tests

    [Fact]
    public async Task GetOrders_Returns200WithPaginatedResult()
    {
        // Arrange
        var orders = new List<Order> { BuildOrder(), BuildOrder("processing") };
        _orderRepositoryMock
            .Setup(r => r.GetAllWithUsersAsync(1, 20, null))
            .ReturnsAsync((orders, 2));

        // Act
        var result = await _controller.GetOrders();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var paginated = okResult.Value.Should().BeOfType<PaginatedResultDto<AdminOrderSummaryDto>>().Subject;
        paginated.Items.Should().HaveCount(2);
        paginated.TotalCount.Should().Be(2);
        paginated.Page.Should().Be(1);
        paginated.PageSize.Should().Be(20);
    }

    [Fact]
    public async Task GetOrders_MapsUserEmailFromNavigationProperty()
    {
        // Arrange
        var order = BuildOrder(userEmail: "cliente@tienda.com");
        _orderRepositoryMock
            .Setup(r => r.GetAllWithUsersAsync(1, 20, null))
            .ReturnsAsync((new List<Order> { order }, 1));

        // Act
        var result = await _controller.GetOrders();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var paginated = okResult.Value.Should().BeOfType<PaginatedResultDto<AdminOrderSummaryDto>>().Subject;
        paginated.Items[0].UserEmail.Should().Be("cliente@tienda.com");
    }

    [Fact]
    public async Task GetOrders_ReturnsNullEmailWhenUserIsNull()
    {
        // Arrange
        var order = BuildOrder(userEmail: null);
        _orderRepositoryMock
            .Setup(r => r.GetAllWithUsersAsync(1, 20, null))
            .ReturnsAsync((new List<Order> { order }, 1));

        // Act
        var result = await _controller.GetOrders();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var paginated = okResult.Value.Should().BeOfType<PaginatedResultDto<AdminOrderSummaryDto>>().Subject;
        paginated.Items[0].UserEmail.Should().BeNull();
    }

    [Fact]
    public async Task GetOrders_MapsItemCountFromOrderItems()
    {
        // Arrange
        var order = BuildOrder(itemCount: 3);
        _orderRepositoryMock
            .Setup(r => r.GetAllWithUsersAsync(1, 20, null))
            .ReturnsAsync((new List<Order> { order }, 1));

        // Act
        var result = await _controller.GetOrders();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var paginated = okResult.Value.Should().BeOfType<PaginatedResultDto<AdminOrderSummaryDto>>().Subject;
        paginated.Items[0].ItemCount.Should().Be(3);
    }

    [Fact]
    public async Task GetOrders_CalculatesTotalPagesCorrectly()
    {
        // Arrange
        _orderRepositoryMock
            .Setup(r => r.GetAllWithUsersAsync(1, 20, null))
            .ReturnsAsync((new List<Order>(), 45));

        // Act
        var result = await _controller.GetOrders();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var paginated = okResult.Value.Should().BeOfType<PaginatedResultDto<AdminOrderSummaryDto>>().Subject;
        paginated.TotalPages.Should().Be(3); // ceil(45/20) = 3
    }

    [Fact]
    public async Task GetOrders_PassesStatusFilterToRepository()
    {
        // Arrange
        var order = BuildOrder("pending");
        _orderRepositoryMock
            .Setup(r => r.GetAllWithUsersAsync(1, 20, "pending"))
            .ReturnsAsync((new List<Order> { order }, 1));

        // Act
        var result = await _controller.GetOrders(Status: "pending");

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        _orderRepositoryMock.Verify(r => r.GetAllWithUsersAsync(1, 20, "pending"), Times.Once);
    }

    [Fact]
    public async Task GetOrders_PassesNullStatusWhenNotFiltering()
    {
        // Arrange
        _orderRepositoryMock
            .Setup(r => r.GetAllWithUsersAsync(It.IsAny<int>(), It.IsAny<int>(), null))
            .ReturnsAsync((new List<Order>(), 0));

        // Act
        await _controller.GetOrders();

        // Assert
        _orderRepositoryMock.Verify(r => r.GetAllWithUsersAsync(1, 20, null), Times.Once);
    }

    [Fact]
    public async Task GetOrders_RespectsPageAndPageSizeParameters()
    {
        // Arrange
        _orderRepositoryMock
            .Setup(r => r.GetAllWithUsersAsync(3, 10, null))
            .ReturnsAsync((new List<Order>(), 0));

        // Act
        await _controller.GetOrders(Page: 3, PageSize: 10);

        // Assert
        _orderRepositoryMock.Verify(r => r.GetAllWithUsersAsync(3, 10, null), Times.Once);
    }

    #endregion

    #region GetOrderById Tests

    [Fact]
    public async Task GetOrderById_WithExistingOrder_Returns200WithDetail()
    {
        // Arrange
        var order = BuildOrder();
        _orderRepositoryMock
            .Setup(r => r.GetByIdWithItemsAndUserAsync(order.Id))
            .ReturnsAsync(order);

        // Act
        var result = await _controller.GetOrderById(order.Id);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var detail = okResult.Value.Should().BeOfType<AdminOrderDetailDto>().Subject;
        detail.Id.Should().Be(order.Id);
        detail.OrderNumber.Should().Be(order.OrderNumber);
    }

    [Fact]
    public async Task GetOrderById_MapsUserEmailToDetail()
    {
        // Arrange
        var order = BuildOrder(userEmail: "admin@test.com");
        _orderRepositoryMock
            .Setup(r => r.GetByIdWithItemsAndUserAsync(order.Id))
            .ReturnsAsync(order);

        // Act
        var result = await _controller.GetOrderById(order.Id);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var detail = okResult.Value.Should().BeOfType<AdminOrderDetailDto>().Subject;
        detail.UserEmail.Should().Be("admin@test.com");
    }

    [Fact]
    public async Task GetOrderById_MapsOrderItemsToDetail()
    {
        // Arrange
        var order = BuildOrder(itemCount: 2);
        _orderRepositoryMock
            .Setup(r => r.GetByIdWithItemsAndUserAsync(order.Id))
            .ReturnsAsync(order);

        // Act
        var result = await _controller.GetOrderById(order.Id);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var detail = okResult.Value.Should().BeOfType<AdminOrderDetailDto>().Subject;
        detail.OrderItems.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetOrderById_WithNonExistentId_Returns404()
    {
        // Arrange
        _orderRepositoryMock
            .Setup(r => r.GetByIdWithItemsAndUserAsync(It.IsAny<Guid>()))
            .ReturnsAsync((Order?)null);

        // Act
        var result = await _controller.GetOrderById(Guid.NewGuid());

        // Assert
        var notFound = result.Should().BeOfType<NotFoundObjectResult>().Subject;
        notFound.StatusCode.Should().Be(404);
    }

    #endregion

    #region UpdateOrderStatus Tests

    [Fact]
    public async Task UpdateOrderStatus_PendingToProcessing_Returns200()
    {
        // Arrange
        var order = BuildOrder("pending");
        _orderRepositoryMock
            .Setup(r => r.GetByIdWithItemsAndUserAsync(order.Id))
            .ReturnsAsync(order);
        _orderRepositoryMock
            .Setup(r => r.UpdateAsync(It.IsAny<Order>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.UpdateOrderStatus(order.Id, new UpdateOrderStatusDto { Status = "processing" });

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var detail = okResult.Value.Should().BeOfType<AdminOrderDetailDto>().Subject;
        detail.OrderStatus.Should().Be("processing");
    }

    [Fact]
    public async Task UpdateOrderStatus_ProcessingToShipped_Returns200()
    {
        // Arrange
        var order = BuildOrder("processing");
        _orderRepositoryMock
            .Setup(r => r.GetByIdWithItemsAndUserAsync(order.Id))
            .ReturnsAsync(order);
        _orderRepositoryMock
            .Setup(r => r.UpdateAsync(It.IsAny<Order>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.UpdateOrderStatus(order.Id, new UpdateOrderStatusDto { Status = "shipped" });

        // Assert
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task UpdateOrderStatus_ShippedToDelivered_Returns200()
    {
        // Arrange
        var order = BuildOrder("shipped");
        _orderRepositoryMock
            .Setup(r => r.GetByIdWithItemsAndUserAsync(order.Id))
            .ReturnsAsync(order);
        _orderRepositoryMock
            .Setup(r => r.UpdateAsync(It.IsAny<Order>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.UpdateOrderStatus(order.Id, new UpdateOrderStatusDto { Status = "delivered" });

        // Assert
        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task UpdateOrderStatus_InvalidTransition_Returns400()
    {
        // Arrange
        var order = BuildOrder("pending");
        _orderRepositoryMock
            .Setup(r => r.GetByIdWithItemsAndUserAsync(order.Id))
            .ReturnsAsync(order);

        // Act — intentar saltar de pending a shipped (inválido)
        var result = await _controller.UpdateOrderStatus(order.Id, new UpdateOrderStatusDto { Status = "shipped" });

        // Assert
        var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequest.StatusCode.Should().Be(400);
    }

    [Fact]
    public async Task UpdateOrderStatus_FromTerminalDelivered_Returns400()
    {
        // Arrange
        var order = BuildOrder("delivered");
        _orderRepositoryMock
            .Setup(r => r.GetByIdWithItemsAndUserAsync(order.Id))
            .ReturnsAsync(order);

        // Act
        var result = await _controller.UpdateOrderStatus(order.Id, new UpdateOrderStatusDto { Status = "shipped" });

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task UpdateOrderStatus_FromTerminalCancelled_Returns400()
    {
        // Arrange
        var order = BuildOrder("cancelled");
        _orderRepositoryMock
            .Setup(r => r.GetByIdWithItemsAndUserAsync(order.Id))
            .ReturnsAsync(order);

        // Act
        var result = await _controller.UpdateOrderStatus(order.Id, new UpdateOrderStatusDto { Status = "processing" });

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task UpdateOrderStatus_WithNonExistentId_Returns404()
    {
        // Arrange
        _orderRepositoryMock
            .Setup(r => r.GetByIdWithItemsAndUserAsync(It.IsAny<Guid>()))
            .ReturnsAsync((Order?)null);

        // Act
        var result = await _controller.UpdateOrderStatus(Guid.NewGuid(), new UpdateOrderStatusDto { Status = "processing" });

        // Assert
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task UpdateOrderStatus_CallsRepositoryUpdate()
    {
        // Arrange
        var order = BuildOrder("pending");
        _orderRepositoryMock
            .Setup(r => r.GetByIdWithItemsAndUserAsync(order.Id))
            .ReturnsAsync(order);
        _orderRepositoryMock
            .Setup(r => r.UpdateAsync(It.IsAny<Order>()))
            .Returns(Task.CompletedTask);

        // Act
        await _controller.UpdateOrderStatus(order.Id, new UpdateOrderStatusDto { Status = "processing" });

        // Assert
        _orderRepositoryMock.Verify(r => r.UpdateAsync(It.Is<Order>(o =>
            o.Id == order.Id && o.OrderStatus == "processing")), Times.Once);
    }

    #endregion
}
