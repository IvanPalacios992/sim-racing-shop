using SimRacingShop.Core.DTOs;

namespace SimRacingShop.Core.Repositories
{
    public interface IComponentRepository
    {
        Task<PaginatedResultDto<ComponentListItemDto>> GetComponentsAsync(ComponentFilterDto filter);
        Task<List<ProductComponentOptionDto>> GetComponentsByProductIdAsync(Guid productId, string locale);

        /// <summary>
        /// Suma los PriceModifier de los componentes indicados para un producto concreto.
        /// Ignora IDs que no pertenezcan al producto o que no existan.
        /// </summary>
        Task<decimal> GetPriceModifiersSumAsync(Guid productId, IEnumerable<Guid> componentIds);
    }
}
