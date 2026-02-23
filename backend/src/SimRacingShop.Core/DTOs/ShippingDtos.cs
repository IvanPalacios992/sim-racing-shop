namespace SimRacingShop.Core.DTOs
{
    /// <summary>
    /// Información detallada del cálculo de envío
    /// </summary>
    public class ShippingCalculationDto
    {
        public string ZoneName { get; set; } = null!;
        public decimal BaseCost { get; set; }
        public decimal WeightCost { get; set; }
        public decimal TotalCost { get; set; }
        public decimal WeightKg { get; set; }
        public bool IsFreeShipping { get; set; }
        public decimal FreeShippingThreshold { get; set; }
        public decimal SubtotalNeededForFreeShipping { get; set; }
    }

    /// <summary>
    /// Request para calcular coste de envío
    /// </summary>
    public class CalculateShippingRequestDto
    {
        public string PostalCode { get; set; } = null!;
        public decimal Subtotal { get; set; }
        public decimal WeightKg { get; set; }
    }

    /// <summary>
    /// Información de una zona de envío (para respuestas públicas)
    /// </summary>
    public class ShippingZoneDto
    {
        public string Name { get; set; } = null!;
        public decimal BaseCost { get; set; }
        public decimal CostPerKg { get; set; }
        public decimal FreeShippingThreshold { get; set; }
    }
}
