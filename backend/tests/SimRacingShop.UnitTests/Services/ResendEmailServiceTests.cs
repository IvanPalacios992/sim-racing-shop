using FluentAssertions;
using Microsoft.Extensions.Options;
using Moq;
using Resend;
using SimRacingShop.Core.Settings;
using SimRacingShop.Infrastructure.Services;

namespace SimRacingShop.UnitTests.Services;

public class ResendEmailServiceTests
{
    private readonly Mock<IResend> _resendMock;

    public ResendEmailServiceTests()
    {
        _resendMock = new Mock<IResend>();
    }

    private ResendEmailService CreateService(string frontendBaseUrl = "https://test.com")
    {
        var settings = Options.Create(new ResendSettings
        {
            ApiKey = "test-key",
            FromEmail = "noreply@test.com",
            FromName = "Test Shop",
            FrontendBaseUrl = frontendBaseUrl
        });

        SetupResendCapture();

        return new ResendEmailService(_resendMock.Object, settings);
    }

    private EmailMessage? _capturedMessage;

    private void SetupResendCapture()
    {
        _capturedMessage = null;
        _resendMock
            .Setup(x => x.EmailSendAsync(It.IsAny<EmailMessage>(), It.IsAny<CancellationToken>()))
            .Callback<EmailMessage, CancellationToken>((msg, _) => _capturedMessage = msg)
            .Returns(Task.FromResult<ResendResponse<Guid>>(null!));
    }

    // ---------------------------------------------------------------------------
    // Constructor — guarda de protocolo
    // ---------------------------------------------------------------------------

    #region Constructor Tests

    [Fact]
    public async Task Constructor_WithUrlWithoutProtocol_AddsHttpsPrefix()
    {
        // Arrange
        var service = CreateService("simracingshop.com");

        // Act
        await service.SendWelcomeEmailAsync("u@test.com", "User");

        // Assert
        _capturedMessage!.HtmlBody.Should().Contain("https://simracingshop.com");
        _capturedMessage.HtmlBody.Should().NotContain("\"simracingshop.com\"");
    }

    [Fact]
    public async Task Constructor_WithHttpsUrl_KeepsUrlUnchanged()
    {
        // Arrange
        var service = CreateService("https://simracingshop.com");

        // Act
        await service.SendWelcomeEmailAsync("u@test.com", "User");

        // Assert
        _capturedMessage!.HtmlBody.Should().Contain("https://simracingshop.com");
        _capturedMessage.HtmlBody.Should().NotContain("https://https://");
    }

    [Fact]
    public async Task Constructor_WithHttpUrl_KeepsHttpUnchanged()
    {
        // Arrange
        var service = CreateService("http://localhost:3000");

        // Act
        await service.SendWelcomeEmailAsync("u@test.com", "User");

        // Assert
        _capturedMessage!.HtmlBody.Should().Contain("http://localhost:3000");
        _capturedMessage.HtmlBody.Should().NotContain("https://http://");
    }

    #endregion

    // ---------------------------------------------------------------------------
    // SendPasswordResetEmailAsync
    // ---------------------------------------------------------------------------

    #region SendPasswordResetEmailAsync Tests

    [Fact]
    public async Task SendPasswordResetEmail_InSpanish_UsesSpanishSubjectAndContent()
    {
        // Arrange
        var service = CreateService();

        // Act
        await service.SendPasswordResetEmailAsync("u@test.com", "token123", "User", "es");

        // Assert
        _capturedMessage!.Subject.Should().Be("Restablecer contraseña - SimRacing Shop");
        _capturedMessage.HtmlBody.Should().Contain("Restablecer contraseña");
        _capturedMessage.HtmlBody.Should().Contain("Este enlace expirará en 24 horas");
        _capturedMessage.HtmlBody.Should().Contain("Si no solicitaste");
    }

    [Fact]
    public async Task SendPasswordResetEmail_InEnglish_UsesEnglishSubjectAndContent()
    {
        // Arrange
        var service = CreateService();

        // Act
        await service.SendPasswordResetEmailAsync("u@test.com", "token123", "User", "en");

        // Assert
        _capturedMessage!.Subject.Should().Be("Reset Password - SimRacing Shop");
        _capturedMessage.HtmlBody.Should().Contain("Reset Password");
        _capturedMessage.HtmlBody.Should().Contain("This link will expire in 24 hours");
        _capturedMessage.HtmlBody.Should().Contain("If you did not request");
    }

    [Fact]
    public async Task SendPasswordResetEmail_UnknownLanguage_FallsBackToSpanish()
    {
        // Arrange
        var service = CreateService();

        // Act
        await service.SendPasswordResetEmailAsync("u@test.com", "token123", "User", "fr");

        // Assert
        _capturedMessage!.Subject.Should().Be("Restablecer contraseña - SimRacing Shop");
    }

    [Fact]
    public async Task SendPasswordResetEmail_DefaultLanguage_IsSpanish()
    {
        // Arrange
        var service = CreateService();

        // Act
        await service.SendPasswordResetEmailAsync("u@test.com", "token123", "User");

        // Assert
        _capturedMessage!.Subject.Should().Be("Restablecer contraseña - SimRacing Shop");
    }

    [Fact]
    public async Task SendPasswordResetEmail_TokenIsUrlEncodedInLink()
    {
        // Arrange
        var service = CreateService();
        var rawToken = "CfDJ8G481hw+/special=chars";

        // Act
        await service.SendPasswordResetEmailAsync("u@test.com", rawToken, "User");

        // Assert — el token debe estar URL-encoded en el href
        _capturedMessage!.HtmlBody.Should().Contain("CfDJ8G481hw%2b%2fspecial%3dchars");
        _capturedMessage.HtmlBody.Should().NotContain("CfDJ8G481hw+/special=chars");
    }

    [Fact]
    public async Task SendPasswordResetEmail_EmailIsUrlEncodedInLink()
    {
        // Arrange
        var service = CreateService();
        var email = "user+tag@test.com";

        // Act
        await service.SendPasswordResetEmailAsync(email, "token", "User");

        // Assert
        _capturedMessage!.HtmlBody.Should().Contain("user%2btag%40test.com");
    }

    [Fact]
    public async Task SendPasswordResetEmail_LinkContainsFrontendBaseUrl()
    {
        // Arrange
        var service = CreateService("https://simracingshop.net");

        // Act
        await service.SendPasswordResetEmailAsync("u@test.com", "token123", "User");

        // Assert
        _capturedMessage!.HtmlBody.Should().Contain("https://simracingshop.net/reset-password?token=");
    }

    [Fact]
    public async Task SendPasswordResetEmail_SentToCorrectRecipient()
    {
        // Arrange
        var service = CreateService();

        // Act
        await service.SendPasswordResetEmailAsync("recipient@test.com", "token", "User");

        // Assert
        _capturedMessage!.To.Should().Contain("recipient@test.com");
    }

    #endregion

    // ---------------------------------------------------------------------------
    // SendWelcomeEmailAsync
    // ---------------------------------------------------------------------------

    #region SendWelcomeEmailAsync Tests

    [Fact]
    public async Task SendWelcomeEmail_InSpanish_UsesSpanishSubjectAndContent()
    {
        // Arrange
        var service = CreateService();

        // Act
        await service.SendWelcomeEmailAsync("u@test.com", "Carlos", "es");

        // Assert
        _capturedMessage!.Subject.Should().Be("Bienvenido a SimRacing Shop");
        _capturedMessage.HtmlBody.Should().Contain("¡Bienvenido a SimRacing Shop!");
        _capturedMessage.HtmlBody.Should().Contain("Ir a la tienda");
    }

    [Fact]
    public async Task SendWelcomeEmail_InEnglish_UsesEnglishSubjectAndContent()
    {
        // Arrange
        var service = CreateService();

        // Act
        await service.SendWelcomeEmailAsync("u@test.com", "Carlos", "en");

        // Assert
        _capturedMessage!.Subject.Should().Be("Welcome to SimRacing Shop");
        _capturedMessage.HtmlBody.Should().Contain("Welcome to SimRacing Shop!");
        _capturedMessage.HtmlBody.Should().Contain("Visit the store");
    }

    [Fact]
    public async Task SendWelcomeEmail_UnknownLanguage_FallsBackToSpanish()
    {
        // Arrange
        var service = CreateService();

        // Act
        await service.SendWelcomeEmailAsync("u@test.com", "User", "fr");

        // Assert
        _capturedMessage!.Subject.Should().Be("Bienvenido a SimRacing Shop");
    }

    [Fact]
    public async Task SendWelcomeEmail_DefaultLanguage_IsSpanish()
    {
        // Arrange
        var service = CreateService();

        // Act
        await service.SendWelcomeEmailAsync("u@test.com", "User");

        // Assert
        _capturedMessage!.Subject.Should().Be("Bienvenido a SimRacing Shop");
    }

    [Fact]
    public async Task SendWelcomeEmail_LinkContainsFrontendBaseUrl()
    {
        // Arrange
        var service = CreateService("https://simracingshop.net");

        // Act
        await service.SendWelcomeEmailAsync("u@test.com", "User");

        // Assert
        _capturedMessage!.HtmlBody.Should().Contain("https://simracingshop.net");
    }

    #endregion

    // ---------------------------------------------------------------------------
    // SendOrderConfirmationEmailAsync
    // ---------------------------------------------------------------------------

    #region SendOrderConfirmationEmailAsync Tests

    [Fact]
    public async Task SendOrderConfirmationEmail_InSpanish_UsesSpanishSubjectAndContent()
    {
        // Arrange
        var service = CreateService();

        // Act
        await service.SendOrderConfirmationEmailAsync("u@test.com", "User", "ORD-001", "https://test.com/es/pedidos/1", 369.23m, "es");

        // Assert
        _capturedMessage!.Subject.Should().Be("Confirmación de pedido ORD-001 - SimRacing Shop");
        _capturedMessage.HtmlBody.Should().Contain("¡Pedido confirmado!");
        _capturedMessage.HtmlBody.Should().Contain("Número de pedido");
        _capturedMessage.HtmlBody.Should().Contain("Ver mi pedido");
    }

    [Fact]
    public async Task SendOrderConfirmationEmail_InEnglish_UsesEnglishSubjectAndContent()
    {
        // Arrange
        var service = CreateService();

        // Act
        await service.SendOrderConfirmationEmailAsync("u@test.com", "User", "ORD-001", "https://test.com/en/orders/1", 369.23m, "en");

        // Assert
        _capturedMessage!.Subject.Should().Be("Order Confirmation ORD-001 - SimRacing Shop");
        _capturedMessage.HtmlBody.Should().Contain("Order Confirmed!");
        _capturedMessage.HtmlBody.Should().Contain("Order Number");
        _capturedMessage.HtmlBody.Should().Contain("View my order");
    }

    [Fact]
    public async Task SendOrderConfirmationEmail_UnknownLanguage_FallsBackToSpanish()
    {
        // Arrange
        var service = CreateService();

        // Act
        await service.SendOrderConfirmationEmailAsync("u@test.com", "User", "ORD-001", "url", 100m, "fr");

        // Assert
        _capturedMessage!.Subject.Should().Be("Confirmación de pedido ORD-001 - SimRacing Shop");
    }

    [Fact]
    public async Task SendOrderConfirmationEmail_DefaultLanguage_IsSpanish()
    {
        // Arrange
        var service = CreateService();

        // Act
        await service.SendOrderConfirmationEmailAsync("u@test.com", "User", "ORD-001", "url", 100m);

        // Assert
        _capturedMessage!.Subject.Should().Be("Confirmación de pedido ORD-001 - SimRacing Shop");
    }

    [Fact]
    public async Task SendOrderConfirmationEmail_SubjectContainsOrderNumber()
    {
        // Arrange
        var service = CreateService();
        var orderNumber = "ORD-20260302-0042";

        // Act
        await service.SendOrderConfirmationEmailAsync("u@test.com", "User", orderNumber, "url", 100m, "es");

        // Assert
        _capturedMessage!.Subject.Should().Contain(orderNumber);
        _capturedMessage.HtmlBody.Should().Contain(orderNumber);
    }

    [Fact]
    public async Task SendOrderConfirmationEmail_TotalAmountFormattedWithTwoDecimals()
    {
        // Arrange
        var service = CreateService();

        // Act
        await service.SendOrderConfirmationEmailAsync("u@test.com", "User", "ORD-001", "url", 369.23m, "es");

        // Assert
        _capturedMessage!.HtmlBody.Should().Contain("369.23");
    }

    [Fact]
    public async Task SendOrderConfirmationEmail_LinkContainsOrderUrl()
    {
        // Arrange
        var service = CreateService();
        var orderUrl = "https://test.com/es/pedidos/abc-123";

        // Act
        await service.SendOrderConfirmationEmailAsync("u@test.com", "User", "ORD-001", orderUrl, 100m);

        // Assert
        _capturedMessage!.HtmlBody.Should().Contain(orderUrl);
    }

    #endregion
}
