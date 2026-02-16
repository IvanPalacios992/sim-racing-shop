using SimRacingShop.Core.Entities;

namespace SimRacingShop.Core.Repositories
{
    public interface IShippingZoneRepository
    {
        Task<ShippingZone?> GetByPostalCodeAsync(string postalCode);
        Task<IEnumerable<ShippingZone>> GetAllActiveAsync();
        Task<ShippingZone?> GetByIdAsync(Guid id);
        Task<ShippingZone> CreateAsync(ShippingZone shippingZone);
        Task UpdateAsync(ShippingZone shippingZone);
    }
}
