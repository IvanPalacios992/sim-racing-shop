using Microsoft.EntityFrameworkCore;
using SimRacingShop.Core.Entities;
using SimRacingShop.Core.Repositories;
using SimRacingShop.Infrastructure.Data;

namespace SimRacingShop.Infrastructure.Repositories
{
    public class ShippingZoneRepository : IShippingZoneRepository
    {
        private readonly ApplicationDbContext _context;

        public ShippingZoneRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ShippingZone?> GetByPostalCodeAsync(string postalCode)
        {
            if (string.IsNullOrWhiteSpace(postalCode) || postalCode.Length < 2)
            {
                return null;
            }

            // Extraer los primeros 2 dígitos del código postal
            var prefix = postalCode.Substring(0, 2);

            // Buscar zona que contenga este prefijo
            var zones = await _context.ShippingZones
                .Where(z => z.IsActive)
                .ToListAsync();

            foreach (var zone in zones)
            {
                var prefixes = zone.PostalCodePrefixes
                    .Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(p => p.Trim());

                if (prefixes.Contains(prefix))
                {
                    return zone;
                }
            }

            return null;
        }

        public async Task<IEnumerable<ShippingZone>> GetAllActiveAsync()
        {
            return await _context.ShippingZones
                .Where(z => z.IsActive)
                .OrderBy(z => z.Name)
                .ToListAsync();
        }

        public async Task<ShippingZone?> GetByIdAsync(Guid id)
        {
            return await _context.ShippingZones
                .FirstOrDefaultAsync(z => z.Id == id);
        }

        public async Task<ShippingZone> CreateAsync(ShippingZone shippingZone)
        {
            shippingZone.CreatedAt = DateTime.UtcNow;
            shippingZone.UpdatedAt = DateTime.UtcNow;

            _context.ShippingZones.Add(shippingZone);
            await _context.SaveChangesAsync();
            return shippingZone;
        }

        public async Task UpdateAsync(ShippingZone shippingZone)
        {
            shippingZone.UpdatedAt = DateTime.UtcNow;
            _context.ShippingZones.Update(shippingZone);
            await _context.SaveChangesAsync();
        }
    }
}
