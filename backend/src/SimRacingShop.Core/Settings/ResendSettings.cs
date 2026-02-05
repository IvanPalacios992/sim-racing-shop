namespace SimRacingShop.Core.Settings
{
    public class ResendSettings
    {
        public string ApiKey { get; set; } = null!;
        public string FromEmail { get; set; } = null!;
        public string FromName { get; set; } = "SimRacing Shop";
        public string FrontendBaseUrl { get; set; } = null!;
    }
}
