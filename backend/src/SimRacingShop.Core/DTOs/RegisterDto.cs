using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Core.DTOs
{
    public record RegisterDto
    {
        public string Email { get; init; } = null!;
        public string Password { get; init; } = null!;
        public string ConfirmPassword { get; init; } = null!;
        public string? FirstName { get; init; }
        public string? LastName { get; init; }
        public string Language { get; init; } = "es";
    }
}
