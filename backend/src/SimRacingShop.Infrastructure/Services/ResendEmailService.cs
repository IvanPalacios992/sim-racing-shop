using Microsoft.Extensions.Options;
using Resend;
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
        }

        public async Task SendPasswordResetEmailAsync(string toEmail, string resetToken, string userName)
        {
            var encodedToken = HttpUtility.UrlEncode(resetToken);
            var encodedEmail = HttpUtility.UrlEncode(toEmail);
            var resetUrl = $"{_settings.FrontendBaseUrl}/reset-password?token={encodedToken}&email={encodedEmail}";

            var htmlContent = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <title>Restablecer contraseña</title>
</head>
<body style=""font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;"">
    <div style=""background-color: #f8f9fa; padding: 30px; border-radius: 10px;"">
        <h1 style=""color: #dc3545; margin-bottom: 20px;"">Restablecer contraseña</h1>
        <p>Hola {userName},</p>
        <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en SimRacing Shop.</p>
        <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
        <div style=""text-align: center; margin: 30px 0;"">
            <a href=""{resetUrl}""
               style=""background-color: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;"">
                Restablecer contraseña
            </a>
        </div>
        <p style=""font-size: 14px; color: #666;"">Este enlace expirará en 24 horas.</p>
        <p style=""font-size: 14px; color: #666;"">Si no solicitaste restablecer tu contraseña, puedes ignorar este correo.</p>
        <hr style=""border: none; border-top: 1px solid #ddd; margin: 20px 0;"">
        <p style=""font-size: 12px; color: #999;"">Este es un correo automático, por favor no respondas a este mensaje.</p>
    </div>
</body>
</html>";

            var message = new EmailMessage
            {
                From = $"{_settings.FromName} <{_settings.FromEmail}>",
                To = toEmail,
                Subject = "Restablecer contraseña - SimRacing Shop",
                HtmlBody = htmlContent
            };

            await _resend.EmailSendAsync(message);
        }
    }
}
