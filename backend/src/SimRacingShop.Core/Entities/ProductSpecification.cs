using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Core.Entities
{
    public class ProductSpecification
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public string Locale { get; set; } = null!;
        public string SpecKey { get; set; } = null!;
        public string SpecValue { get; set; } = null!;
        public int DisplayOrder { get; set; }

        // Navigation property
        public Product Product { get; set; } = null!;
    }
}
