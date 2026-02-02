using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Core.Entities
{
    public class ProductImage
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public string ImageUrl { get; set; } = null!;
        public string? AltText { get; set; }
        public int DisplayOrder { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation property
        public Product Product { get; set; } = null!;
    }
}
