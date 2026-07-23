using System.Collections.Generic;
using System.Threading.Tasks;
using YpsStoreFinder.Domain.Features.Store.DTOs;
using YpsStoreFinder.Shared;

namespace YpsStoreFinder.Domain.Features.Store
{
    public interface IStoreService
    {
        Task<PagedResult<StoreDto>> GetStoresAsync(string? category = null, int pageNumber = 1, int pageSize = 10);
        Task<PagedResult<StoreDto>> SearchStoresAsync(StoreSearchRequest request);
        Task<Result<List<CategorySummaryDto>>> GetCategoriesSummaryAsync();
        Task<PagedResult<StoreDto>> GetNearbyStoresAsync(NearbyStoreRequest request);
        Task<Result<StoreDto>> GetStoreByIdAsync(int id);
    }
}
