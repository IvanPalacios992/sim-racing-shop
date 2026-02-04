using System.ComponentModel.DataAnnotations;

namespace SimRacingShop.Core.DTOs
{
    public record ForgotPasswordRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; init; } = null!;
    }
}
