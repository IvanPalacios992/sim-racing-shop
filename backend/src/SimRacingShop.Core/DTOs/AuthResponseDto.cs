using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Core.DTOs
{
    public record AuthResponseDto
    {
        public string Token { get; init; } = null!;
        public string RefreshToken { get; init; } = null!;
        public DateTime ExpiresAt { get; init; }
        public UserDto User { get; init; } = null!;
    }
}
