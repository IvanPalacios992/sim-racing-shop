using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Core.Entities
{
    public class ProductTranslation
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public string Locale { get; set; } = null!; // es, en
        public string Name { get; set; } = null!;
        public string? ShortDescription { get; set; }
        public string? LongDescription { get; set; }
        public string? MetaTitle { get; set; }
        public string? MetaDescription { get; set; }
        public string Slug { get; set; } = null!;

        // Navigation property
        public Product Product { get; set; } = null!;
    }
}
