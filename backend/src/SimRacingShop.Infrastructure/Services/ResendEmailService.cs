using Microsoft.Extensions.Options;
using Resend;
using SimRacingShop.Core.Services;
using SimRacingShop.Core.Settings;
using System.Web;

namespace SimRacingShop.Infrastructure.Services
{
    public class ResendEmailService : IEmailService
    {
        private readonly IResend _resend;
        private readonly ResendSettings _settings;

        public ResendEmailService(IResend resend, IOptions<ResendSettings> settings)
        {
            _resend = resend;
            _settings = settings.Value;

            // Ensure FrontendBaseUrl is an absolute URL
            if (!string.IsNullOrEmpty(_settings.FrontendBaseUrl) &&
                !_settings.FrontendBaseUrl.StartsWith("http://") &&
                !_settings.FrontendBaseUrl.StartsWith("https://"))
            {
                _settings.FrontendBaseUrl = "https://" + _settings.FrontendBaseUrl;
            }
        }

        // ---------------------------------------------------------------------------
        // Translation records
        // ---------------------------------------------------------------------------

        private record PasswordResetTranslations(
            string Subject, string Title, string RequestText,
            string ButtonText, string ExpiryText, string IgnoreText, string Footer);

        private record WelcomeTranslations(
            string Subject, string Title, string BodyText, string ButtonText, string Footer);

        private record OrderConfirmationTranslations(
            string SubjectTemplate, string Title, string BodyText,
            string OrderNumberLabel, string TotalLabel, string TrackingText,
            string ButtonText, string Footer);

        private static PasswordResetTranslations GetPasswordResetTranslations(string language) => language switch
        {
            "en" => new(
                Subject: "Reset Password - SimRacing Shop",
                Title: "Reset Password",
                RequestText: "We have received a request to reset the password for your SimRacing Shop account.<br>Click the button below to create a new password:",
                ButtonText: "Reset Password",
                ExpiryText: "This link will expire in 24 hours.",
                IgnoreText: "If you did not request a password reset, you can ignore this email.",
                Footer: "This is an automated email, please do not reply to this message."
            ),
            _ => new(
                Subject: "Restablecer contraseña - SimRacing Shop",
                Title: "Restablecer contraseña",
                RequestText: "Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en SimRacing Shop.<br>Haz clic en el siguiente botón para crear una nueva contraseña:",
                ButtonText: "Restablecer contraseña",
                ExpiryText: "Este enlace expirará en 24 horas.",
                IgnoreText: "Si no solicitaste restablecer tu contraseña, puedes ignorar este correo.",
                Footer: "Este es un correo automático, por favor no respondas a este mensaje."
            )
        };

        private static WelcomeTranslations GetWelcomeTranslations(string language) => language switch
        {
            "en" => new(
                Subject: "Welcome to SimRacing Shop",
                Title: "Welcome to SimRacing Shop!",
                BodyText: "Your account has been created successfully. You can now explore our product catalog and place your first order.",
                ButtonText: "Visit the store",
                Footer: "This is an automated email, please do not reply to this message."
            ),
            _ => new(
                Subject: "Bienvenido a SimRacing Shop",
                Title: "¡Bienvenido a SimRacing Shop!",
                BodyText: "Tu cuenta ha sido creada correctamente. Ya puedes explorar nuestro catálogo de productos y realizar tu primer pedido.",
                ButtonText: "Ir a la tienda",
                Footer: "Este es un correo automático, por favor no respondas a este mensaje."
            )
        };

        private static OrderConfirmationTranslations GetOrderConfirmationTranslations(string language) => language switch
        {
            "en" => new(
                SubjectTemplate: "Order Confirmation {0} - SimRacing Shop",
                Title: "Order Confirmed!",
                BodyText: "We have received your order and are already processing it.",
                OrderNumberLabel: "Order Number",
                TotalLabel: "Total",
                TrackingText: "You can view your order details and track its status at the following link:",
                ButtonText: "View my order",
                Footer: "This is an automated email, please do not reply to this message."
            ),
            _ => new(
                SubjectTemplate: "Confirmación de pedido {0} - SimRacing Shop",
                Title: "¡Pedido confirmado!",
                BodyText: "Hemos recibido tu pedido correctamente y ya estamos procesándolo.",
                OrderNumberLabel: "Número de pedido",
                TotalLabel: "Total",
                TrackingText: "Puedes ver el detalle de tu pedido y seguir su estado en el siguiente enlace:",
                ButtonText: "Ver mi pedido",
                Footer: "Este es un correo automático, por favor no respondas a este mensaje."
            )
        };

        // ---------------------------------------------------------------------------
        // Public methods
        // ---------------------------------------------------------------------------

        public async Task SendPasswordResetEmailAsync(string toEmail, string resetToken, string userName, string language = "es")
        {
            var encodedToken = HttpUtility.UrlEncode(resetToken);
            var encodedEmail = HttpUtility.UrlEncode(toEmail);
            var resetUrl = $"{_settings.FrontendBaseUrl}/reset-password?token={encodedToken}&email={encodedEmail}";

            var t = GetPasswordResetTranslations(language);

            var htmlContent = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <title>{t.Title}</title>
</head>
<body style=""font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;"">
    <div style=""background-color: #f8f9fa; padding: 30px; border-radius: 10px;"">
        <h1 style=""color: #dc3545; margin-bottom: 20px;"">{t.Title}</h1>
        <p>Hola {userName},</p>
        <p>{t.RequestText}</p>
        <div style=""text-align: center; margin: 30px 0;"">
            <a href=""{resetUrl}""
               style=""background-color: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;"">
                {t.ButtonText}
            </a>
        </div>
        <p style=""font-size: 14px; color: #666;"">{t.ExpiryText}</p>
        <p style=""font-size: 14px; color: #666;"">{t.IgnoreText}</p>
        <hr style=""border: none; border-top: 1px solid #ddd; margin: 20px 0;"">
        <p style=""font-size: 12px; color: #999;"">{t.Footer}</p>
    </div>
</body>
</html>";

            var message = new EmailMessage
            {
                From = $"{_settings.FromName} <{_settings.FromEmail}>",
                To = toEmail,
                Subject = t.Subject,
                HtmlBody = htmlContent
            };

            await _resend.EmailSendAsync(message);
        }

        public async Task SendWelcomeEmailAsync(string toEmail, string userName, string language = "es")
        {
            var t = GetWelcomeTranslations(language);

            var htmlContent = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <title>{t.Title}</title>
</head>
<body style=""font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;"">
    <div style=""background-color: #f8f9fa; padding: 30px; border-radius: 10px;"">
        <h1 style=""color: #dc3545; margin-bottom: 20px;"">{t.Title}</h1>
        <p>Hola {userName},</p>
        <p>{t.BodyText}</p>
        <div style=""text-align: center; margin: 30px 0;"">
            <a href=""{_settings.FrontendBaseUrl}""
               style=""background-color: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;"">
                {t.ButtonText}
            </a>
        </div>
        <hr style=""border: none; border-top: 1px solid #ddd; margin: 20px 0;"">
        <p style=""font-size: 12px; color: #999;"">{t.Footer}</p>
    </div>
</body>
</html>";

            var message = new EmailMessage
            {
                From = $"{_settings.FromName} <{_settings.FromEmail}>",
                To = toEmail,
                Subject = t.Subject,
                HtmlBody = htmlContent
            };

            await _resend.EmailSendAsync(message);
        }

        public async Task SendOrderConfirmationEmailAsync(string toEmail, string userName, string orderNumber, string orderUrl, decimal totalAmount, string language = "es")
        {
            var t = GetOrderConfirmationTranslations(language);

            var htmlContent = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <title>{t.Title}</title>
</head>
<body style=""font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;"">
    <div style=""background-color: #f8f9fa; padding: 30px; border-radius: 10px;"">
        <h1 style=""color: #dc3545; margin-bottom: 20px;"">{t.Title}</h1>
        <p>Hola {userName},</p>
        <p>{t.BodyText}</p>
        <div style=""background-color: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0;"">
            <p style=""margin: 0; font-size: 14px; color: #666;"">{t.OrderNumberLabel}</p>
            <p style=""margin: 5px 0 0; font-size: 20px; font-weight: bold; color: #333;"">{orderNumber}</p>
            <p style=""margin: 15px 0 0; font-size: 14px; color: #666;"">{t.TotalLabel}</p>
            <p style=""margin: 5px 0 0; font-size: 20px; font-weight: bold; color: #dc3545;"">{totalAmount:F2} €</p>
        </div>
        <p>{t.TrackingText}</p>
        <div style=""text-align: center; margin: 30px 0;"">
            <a href=""{orderUrl}""
               style=""background-color: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;"">
                {t.ButtonText}
            </a>
        </div>
        <hr style=""border: none; border-top: 1px solid #ddd; margin: 20px 0;"">
        <p style=""font-size: 12px; color: #999;"">{t.Footer}</p>
    </div>
</body>
</html>";

            var message = new EmailMessage
            {
                From = $"{_settings.FromName} <{_settings.FromEmail}>",
                To = toEmail,
                Subject = string.Format(t.SubjectTemplate, orderNumber),
                HtmlBody = htmlContent
            };

            await _resend.EmailSendAsync(message);
        }
    }
}
