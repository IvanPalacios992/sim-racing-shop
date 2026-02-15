using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Identity;

namespace SimRacingShop.Core.Entities
{
    // <summary>
    /// Usuario del sistema con Identity
    /// </summary>
    public class User : IdentityUser<Guid>
    {
        // Propiedades adicionales (Identity ya tiene Email, PasswordHash, etc.)
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Phone { get; set; }
        public string Language { get; set; } = "es";

        // 2FA ya viene con Identity (TwoFactorEnabled)
        // Email verification ya viene con Identity (EmailConfirmed)

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public ICollection<Order> Orders { get; set; } = new List<Order>();
        public ICollection<UserAddress> Addresses { get; set; } = new List<UserAddress>();
        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
        public UserCommunicationPreferences? CommunicationPreferences { get; set; }
    }
}
