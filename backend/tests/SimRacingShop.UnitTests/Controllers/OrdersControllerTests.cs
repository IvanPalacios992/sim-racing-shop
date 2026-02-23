using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using SimRacingShop.API.Controllers;
using SimRacingShop.Core.DTOs;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Repositories;
using SimRacingShop.Core.Services;
using System.Security.Claims;

namespace SimRacingShop.UnitTests.Controllers;

public class OrdersControllerTests
{
    private readonly Mock<IOrderRepository> _orderRepositoryMock;
    private readonly Mock<IOrderService> _orderServiceMock;
    private readonly Mock<ILogger<OrdersController>> _loggerMock;
    private readonly OrdersController _controller;
    private readonly Guid _testUserId;

    public OrdersControllerTests()
    {
        _orderRepositoryMock = new Mock<IOrderRepository>();
        _orderServiceMock = new Mock<IOrderService>();
        _loggerMock = new Mock<ILogger<OrdersController>>();
        _controller = new OrdersController(
            _orderRepositoryMock.Object,
            _orderServiceMock.Object,
            _loggerMock.Object
        );

        _testUserId = Guid.NewGuid();
        SetupControllerUser(_testUserId);
    }

    #region CreateOrder Tests

    [Fact]
    public async Task CreateOrder_WithValidData_ReturnsCreated()
    {
        // Arrange
        var productId = Guid.NewGuid();
        var dto = CreateValidOrderDto(productId);

        var createdOrder = new Order
        {
            Id = Guid.NewGuid(),
            OrderNumber = "ORD-20260216-0001",
            UserId = _testUserId,
            Subtotal = dto.Subtotal,
            VatAmount = dto.VatAmount,
            ShippingCost = dto.ShippingCost,
            TotalAmount = dto.TotalAmount,
            OrderStatus = "pending",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            OrderItems = new List<OrderItem>
            {
                new OrderItem
                {
                    Id = Guid.NewGuid(),
                    ProductId = productId,
                    ProductName = "Test Product",
                    ProductSku = "VOL-001",
                    Quantity = 1,
                    UnitPrice = 299.99m,
                    LineTotal = 299.99m,
                    CreatedAt = DateTime.UtcNow
                }
            }
        };

        _orderServiceMock
            .Setup(x => x.CreateOrderAsync(dto, _testUserId))
            .ReturnsAsync(createdOrder);

        // Act
        var result = await _controller.CreateOrder(dto);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.StatusCode.Should().Be(201);
        createdResult.ActionName.Should().Be(nameof(_controller.GetOrderById));

        var orderDto = createdResult.Value.Should().BeOfType<OrderDetailDto>().Subject;
        orderDto.OrderNumber.Should().Be("ORD-20260216-0001");
        orderDto.OrderStatus.Should().Be("pending");
        orderDto.OrderItems.Should().HaveCount(1);
    }

    [Fact]
    public async Task CreateOrder_WithoutAuthentication_ReturnsUnauthorized()
    {
        // Arrange
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };

        var dto = CreateValidOrderDto(Guid.NewGuid());

        // Act
        var result = await _controller.CreateOrder(dto);

        // Assert
        result.Should().BeOfType<UnauthorizedResult>();
    }

    [Fact]
    public async Task CreateOrder_WithValidationError_ReturnsBadRequest()
    {
        // Arrange
        var dto = CreateValidOrderDto(Guid.NewGuid());

        _orderServiceMock
            .Setup(x => x.CreateOrderAsync(dto, _testUserId))
            .ThrowsAsync(new InvalidOperationException("Precio incorrecto para 'VOL-001'"));

        // Act
        var result = await _controller.CreateOrder(dto);

        // Assert
        var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
    }

    #endregion

    #region GetUserOrders Tests

    [Fact]
    public async Task GetUserOrders_ReturnsUserOrders()
    {
        // Arrange
        var orders = new List<Order>
        {
            new Order
            {
                Id = Guid.NewGuid(),
                OrderNumber = "ORD-20260216-0001",
                UserId = _testUserId,
                TotalAmount = 369.23m,
                OrderStatus = "pending",
                CreatedAt = DateTime.UtcNow,
                OrderItems = new List<OrderItem>
                {
                    new OrderItem
                    {
                        Id = Guid.NewGuid(),
                        ProductName = "Product 1",
                        ProductSku = "VOL-001",
                        Quantity = 1,
                        LineTotal = 299.99m
                    }
                }
            },
            new Order
            {
                Id = Guid.NewGuid(),
                OrderNumber = "ORD-20260215-0001",
                UserId = _testUserId,
                TotalAmount = 150m,
                OrderStatus = "completed",
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                OrderItems = new List<OrderItem>
                {
                    new OrderItem
                    {
                        Id = Guid.NewGuid(),
                        ProductName = "Product 2",
                        ProductSku = "VOL-002",
                        Quantity = 2,
                        LineTotal = 120m
                    }
                }
            }
        };

        _orderRepositoryMock
            .Setup(x => x.GetByUserIdWithItemsAsync(_testUserId))
            .ReturnsAsync(orders);

        // Act
        var result = await _controller.GetUserOrders();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var orderDtos = okResult.Value.Should().BeAssignableTo<IEnumerable<OrderSummaryDto>>().Subject.ToList();
        orderDtos.Should().HaveCount(2);
        orderDtos[0].OrderNumber.Should().Be("ORD-20260216-0001");
        orderDtos[1].OrderNumber.Should().Be("ORD-20260215-0001");
    }

    [Fact]
    public async Task GetUserOrders_WithoutAuthentication_ReturnsUnauthorized()
    {
        // Arrange
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };

        // Act
        var result = await _controller.GetUserOrders();

        // Assert
        result.Should().BeOfType<UnauthorizedResult>();
    }

    #endregion

    #region GetOrderById Tests

    [Fact]
    public async Task GetOrderById_WithValidId_ReturnsOrder()
    {
        // Arrange
        var orderId = Guid.NewGuid();
        var order = new Order
        {
            Id = orderId,
            OrderNumber = "ORD-20260216-0001",
            UserId = _testUserId,
            TotalAmount = 369.23m,
            OrderStatus = "pending",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            OrderItems = new List<OrderItem>
            {
                new OrderItem
                {
                    Id = Guid.NewGuid(),
                    ProductName = "Test Product",
                    ProductSku = "VOL-001",
                    Quantity = 1,
                    UnitPrice = 299.99m,
                    LineTotal = 299.99m,
                    CreatedAt = DateTime.UtcNow
                }
            }
        };

        _orderRepositoryMock
            .Setup(x => x.GetByIdWithItemsAsync(orderId))
            .ReturnsAsync(order);

        // Act
        var result = await _controller.GetOrderById(orderId);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var orderDto = okResult.Value.Should().BeOfType<OrderDetailDto>().Subject;
        orderDto.Id.Should().Be(orderId);
        orderDto.OrderNumber.Should().Be("ORD-20260216-0001");
        orderDto.OrderItems.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetOrderById_WithNonExistentId_ReturnsNotFound()
    {
        // Arrange
        var orderId = Guid.NewGuid();

        _orderRepositoryMock
            .Setup(x => x.GetByIdWithItemsAsync(orderId))
            .ReturnsAsync((Order?)null);

        // Act
        var result = await _controller.GetOrderById(orderId);

        // Assert
        var notFoundResult = result.Should().BeOfType<NotFoundObjectResult>().Subject;
        notFoundResult.StatusCode.Should().Be(404);
    }

    [Fact]
    public async Task GetOrderById_WithOtherUserOrder_ReturnsUnauthorized()
    {
        // Arrange
        var orderId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();

        var order = new Order
        {
            Id = orderId,
            OrderNumber = "ORD-20260216-0001",
            UserId = otherUserId, // Pedido de otro usuario
            TotalAmount = 369.23m,
            OrderStatus = "pending",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            OrderItems = new List<OrderItem>()
        };

        _orderRepositoryMock
            .Setup(x => x.GetByIdWithItemsAsync(orderId))
            .ReturnsAsync(order);

        // Act
        var result = await _controller.GetOrderById(orderId);

        // Assert
        var unauthorizedResult = result.Should().BeOfType<UnauthorizedObjectResult>().Subject;
        unauthorizedResult.StatusCode.Should().Be(401);
    }

    #endregion

    #region Helper Methods

    private void SetupControllerUser(Guid userId)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString())
        };

        var identity = new ClaimsIdentity(claims, "TestAuth");
        var claimsPrincipal = new ClaimsPrincipal(identity);

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = claimsPrincipal
            }
        };
    }

    private CreateOrderDto CreateValidOrderDto(Guid productId)
    {
        return new CreateOrderDto
        {
            ShippingStreet = "Calle Mayor 123",
            ShippingCity = "Madrid",
            ShippingPostalCode = "28001",
            ShippingCountry = "ES",
            Subtotal = 299.99m,
            VatAmount = 62.99m,
            ShippingCost = 6.25m,
            TotalAmount = 369.23m,
            OrderItems = new List<CreateOrderItemDto>
            {
                new CreateOrderItemDto
                {
                    ProductId = productId,
                    ProductName = "Test Product",
                    ProductSku = "VOL-001",
                    Quantity = 1,
                    UnitPrice = 299.99m,
                    LineTotal = 299.99m
                }
            }
        };
    }

    #endregion
}
