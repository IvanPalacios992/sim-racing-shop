namespace SimRacingShop.Core.Services
{
    public interface IEmailService
    {
        Task SendPasswordResetEmailAsync(string toEmail, string resetToken, string userName, string language = "es");
        Task SendWelcomeEmailAsync(string toEmail, string userName, string language = "es");
        Task SendOrderConfirmationEmailAsync(string toEmail, string userName, string orderNumber, string orderUrl, decimal totalAmount, string language = "es");
    }
}
