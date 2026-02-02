using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Core.Entities
{
    public class UserAddress
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string AddressType { get; set; } = null!; // billing, shipping
        public string Street { get; set; } = null!;
        public string City { get; set; } = null!;
        public string? State { get; set; }
        public string PostalCode { get; set; } = null!;
        public string Country { get; set; } = "ES";
        public bool IsDefault { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation property
        public User User { get; set; } = null!;
    }
}
