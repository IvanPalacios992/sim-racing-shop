using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Core.DTOs
{
    public class CreateDeliveryAddressDto
    {
        public Guid UserId { get; set; }
        public string Name { get; set; } = null!;
        public string Street { get; set; } = null!;
        public string City { get; set; } = null!;
        public string? State { get; set; }
        public string PostalCode { get; set; } = null!;
        public string Country { get; set; } = "ES";
        public bool IsDefault { get; set; }
    }

    public class UpdateDeliveryAddressDto
    {
        public string Name { get; set; } = null!;
        public string Street { get; set; } = null!;
        public string City { get; set; } = null!;
        public string? State { get; set; }
        public string PostalCode { get; set; } = null!;
        public string Country { get; set; } = "ES";
        public bool IsDefault { get; set; }
    }


    public class DeliveryAddressDetailDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string Street { get; set; } = null!;
        public string City { get; set; } = null!;
        public string? State { get; set; }
        public string PostalCode { get; set; } = null!;
        public string Country { get; set; } = "ES";
        public bool IsDefault { get; set; }
    }
}
