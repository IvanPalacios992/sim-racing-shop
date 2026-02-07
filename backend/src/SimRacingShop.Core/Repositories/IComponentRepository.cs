using SimRacingShop.Core.DTOs;

namespace SimRacingShop.Core.Repositories
{
    public interface IComponentRepository
    {
        Task<PaginatedResultDto<ComponentListItemDto>> GetComponentsAsync(ComponentFilterDto filter);
        Task<List<ProductComponentOptionDto>> GetComponentsByProductIdAsync(Guid productId, string locale);
    }
}
