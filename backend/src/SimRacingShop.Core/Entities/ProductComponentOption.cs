using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Core.Entities
{
    public class ProductComponentOption
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public Guid ComponentId { get; set; }
        public string OptionGroup { get; set; } = null!;
        public bool IsGroupRequired { get; set; } = false;
        public string? GlbObjectName { get; set; }
        public string? ThumbnailUrl { get; set; }
        public decimal PriceModifier { get; set; }
        public bool IsDefault { get; set; }
        public int DisplayOrder { get; set; }

        // Navigation properties
        public Product Product { get; set; } = null!;
        public Component Component { get; set; } = null!;
    }
}
