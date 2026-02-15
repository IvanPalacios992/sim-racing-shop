using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Core.DTOs
{
    public record UpdateUserDto
    {
        public string Email { get; init; } = null!;
        public string? FirstName { get; init; }
        public string? LastName { get; init; }
        public string Language { get; init; } = null!;
        public bool EmailVerified { get; init; }
    }
    public record UserDetailDto
    {
        public Guid Id { get; init; }
        public string Email { get; init; } = null!;
        public string? FirstName { get; init; }
        public string? LastName { get; init; }
        public string Language { get; init; } = null!;
        public bool EmailVerified { get; init; }
        public IEnumerable<string> Roles { get; init; } = new List<string>();
    }

    public record UserCommunicationPreferencesDto
    {
        public bool Newsletter { get; init; }
        public bool OrderNotifications { get; init; }
        public bool SmsPromotions { get; init; }
    }
}
