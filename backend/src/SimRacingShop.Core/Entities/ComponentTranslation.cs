using System;
using System.Collections.Generic;
using System.Text;

namespace SimRacingShop.Core.Entities
{
    public class ComponentTranslation
    {
        public Guid Id { get; set; }
        public Guid ComponentId { get; set; }
        public string Locale { get; set; } = null!; // es, en
        public string Name { get; set; } = null!;
        public string? Description { get; set; }

        // Navigation property
        public Component Component { get; set; } = null!;
    }
}
