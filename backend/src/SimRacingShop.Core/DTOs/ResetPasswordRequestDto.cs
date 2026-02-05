using System.ComponentModel.DataAnnotations;

namespace SimRacingShop.Core.DTOs
{
    public record ResetPasswordRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; init; } = null!;

        [Required]
        public string Token { get; init; } = null!;

        [Required]
        [MinLength(8)]
        public string NewPassword { get; init; } = null!;

        [Required]
        [Compare(nameof(NewPassword), ErrorMessage = "Las contraseñas no coinciden")]
        public string ConfirmPassword { get; init; } = null!;
    }
}
