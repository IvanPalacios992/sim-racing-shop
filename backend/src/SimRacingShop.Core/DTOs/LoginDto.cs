using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Core.DTOs
{
    public record LoginDto
    {
        public string Email { get; init; } = null!;
        public string Password { get; init; } = null!;
        public bool RememberMe { get; init; }
    }
}
