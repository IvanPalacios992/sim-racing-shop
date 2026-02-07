using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Core.Entities
{
    public class Product
    {
        public Guid Id { get; set; }
        public string Sku { get; set; } = null!;
        public decimal BasePrice { get; set; }
        public decimal VatRate { get; set; } = 21.00m;
        public string? Model3dUrl { get; set; }
        public int? Model3dSizeKb { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsCustomizable { get; set; } = true;
        public int BaseProductionDays { get; set; } = 7;
        public int? WeightGrams { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public ICollection<ProductTranslation> Translations { get; set; } = new List<ProductTranslation>();
        public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
        public ICollection<ProductSpecification> Specifications { get; set; } = new List<ProductSpecification>();
        public ICollection<ProductComponentOption> ComponentOptions { get; set; } = new List<ProductComponentOption>();
    }
}
