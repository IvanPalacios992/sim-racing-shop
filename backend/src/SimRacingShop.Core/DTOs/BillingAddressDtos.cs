using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Core.DTOs
{
    public class CreateBillingAddressDto
    {
        public Guid UserId { get; set; }
        public string Street { get; set; } = null!;
        public string City { get; set; } = null!;
        public string? State { get; set; }
        public string PostalCode { get; set; } = null!;
        public string Country { get; set; } = "ES";
    }

    public class UpdateBillingAddressDto
    {
        public Guid Id { get; set; }
        public string Street { get; set; } = null!;
        public string City { get; set; } = null!;
        public string? State { get; set; }
        public string PostalCode { get; set; } = null!;
        public string Country { get; set; } = "ES";
    }

    public class BillingAddressDetailDto
    {
        public Guid Id { get; set; }
        public string Street { get; set; } = null!;
        public string City { get; set; } = null!;
        public string? State { get; set; }
        public string PostalCode { get; set; } = null!;
        public string Country { get; set; } = "ES";
    }
}
