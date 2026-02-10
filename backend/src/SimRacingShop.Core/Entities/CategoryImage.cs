using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Core.Entities
{
    public class CategoryImage
    {
        public Guid Id { get; set; }
        public Guid CategoryId { get; set; }
        public string ImageUrl { get; set; } = null!;
        public string? AltText { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation property
        public Category Category { get; set; } = null!;
    }
}
