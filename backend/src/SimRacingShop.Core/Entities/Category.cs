using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Core.Entities
{
    public class Category
    {
        public Guid Id { get; set; }
        public Guid? ParentCategory {  get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public ICollection<CategoryTranslation> Translations { get; set; } = new List<CategoryTranslation>();
        public CategoryImage Image { get; set; } = new ();
        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
