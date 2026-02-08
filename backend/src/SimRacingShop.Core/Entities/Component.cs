using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Core.Entities
{
    public class Component
    {
        public Guid Id { get; set; }
        public string Sku { get; set; } = null!;
        public string ComponentType { get; set; } = null!;
        public int StockQuantity { get; set; }
        public int MinStockThreshold { get; set; } = 5;
        public int LeadTimeDays { get; set; }
        public int? WeightGrams { get; set; }
        public decimal? CostPrice { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public ICollection<ComponentTranslation> Translations { get; set; } = new List<ComponentTranslation>();
        public ICollection<ProductComponentOption> ProductComponentOptions { get; set; } = new List<ProductComponentOption>();
    }
}
