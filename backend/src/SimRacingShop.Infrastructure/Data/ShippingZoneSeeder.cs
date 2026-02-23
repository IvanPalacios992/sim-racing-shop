using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SimRacingShop.Core.Entities;

namespace SimRacingShop.Infrastructure.Data
{
    public static class ShippingZoneSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context, ILogger logger)
        {
            try
            {
                // Verificar si ya existen zonas de envío
                if (await context.ShippingZones.AnyAsync())
                {
                    logger.LogInformation("Shipping zones already exist, skipping seed");
                    return;
                }

                logger.LogInformation("Seeding shipping zones...");

                var zones = new List<ShippingZone>
                {
                    // Península - CP 01-52 (excluyendo 07, 35, 38)
                    new ShippingZone
                    {
                        Id = Guid.NewGuid(),
                        Name = "Península",
                        PostalCodePrefixes = "01,02,03,04,05,06,08,09,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,36,37,39,40,41,42,43,44,45,46,47,48,49,50,51,52",
                        BaseCost = 5.00m,
                        CostPerKg = 0.50m,
                        FreeShippingThreshold = 100.00m,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    // Baleares - CP 07
                    new ShippingZone
                    {
                        Id = Guid.NewGuid(),
                        Name = "Baleares",
                        PostalCodePrefixes = "07",
                        BaseCost = 10.00m,
                        CostPerKg = 1.00m,
                        FreeShippingThreshold = 150.00m,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    // Canarias - CP 35, 38
                    new ShippingZone
                    {
                        Id = Guid.NewGuid(),
                        Name = "Canarias",
                        PostalCodePrefixes = "35,38",
                        BaseCost = 15.00m,
                        CostPerKg = 1.50m,
                        FreeShippingThreshold = 200.00m,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    }
                };

                context.ShippingZones.AddRange(zones);
                await context.SaveChangesAsync();

                logger.LogInformation("Shipping zones seeded successfully: {Count} zones created", zones.Count);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error seeding shipping zones");
                throw;
            }
        }
    }
}
