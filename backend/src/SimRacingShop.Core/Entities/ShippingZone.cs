using System;

namespace SimRacingShop.Core.Entities
{
    /// <summary>
    /// Configuración de zonas de envío y sus tarifas
    /// </summary>
    public class ShippingZone
    {
        public Guid Id { get; set; }

        /// <summary>
        /// Nombre de la zona (ej: "Península", "Baleares", "Canarias")
        /// </summary>
        public string Name { get; set; } = null!;

        /// <summary>
        /// Prefijos de códigos postales separados por coma (ej: "01,02,03" o "07" o "35,38")
        /// </summary>
        public string PostalCodePrefixes { get; set; } = null!;

        /// <summary>
        /// Coste base de envío en euros
        /// </summary>
        public decimal BaseCost { get; set; }

        /// <summary>
        /// Coste por kilogramo en euros
        /// </summary>
        public decimal CostPerKg { get; set; }

        /// <summary>
        /// Umbral para envío gratis (en euros)
        /// </summary>
        public decimal FreeShippingThreshold { get; set; }

        /// <summary>
        /// Indica si esta zona está activa
        /// </summary>
        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
