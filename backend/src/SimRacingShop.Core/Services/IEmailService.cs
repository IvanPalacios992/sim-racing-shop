namespace SimRacingShop.Core.Services
{
    public interface IEmailService
    {
        Task SendPasswordResetEmailAsync(string toEmail, string resetToken, string userName);
    }
}
