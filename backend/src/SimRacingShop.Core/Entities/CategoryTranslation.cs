using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Core.Entities
{
    public class CategoryTranslation
    {
        public Guid Id { get; set; }
        public Guid CategoryId { get; set; }
        public string Locale { get; set; } = null!; // es, en
        public string Name { get; set; } = null!;
        public string? ShortDescription { get; set; }
        public string Slug { get; set; } = null!;

        // Navigation property
        public Category Category { get; set; } = null!;
    }
}
