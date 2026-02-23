namespace SimRacingShop.Core.DTOs
{
    public record RefreshTokenRequestDto
    {
        public string RefreshToken { get; init; } = null!;
    }
}
