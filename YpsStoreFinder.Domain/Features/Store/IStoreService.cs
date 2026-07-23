using System.Collections.Generic;
using System.Threading.Tasks;
using YpsStoreFinder.Domain.Features.Store.DTOs;
using YpsStoreFinder.Shared;

namespace YpsStoreFinder.Domain.Features.Store
{
    public interface IStoreService
    {
        Task<Result<List<StoreDto>>> GetStoresAsync(string? category = null);
        Task<Result<List<StoreDto>>> SearchStoresAsync(StoreSearchRequest request);
        Task<Result<List<CategorySummaryDto>>> GetCategoriesSummaryAsync();
        Task<Result<List<StoreDto>>> GetNearbyStoresAsync(NearbyStoreRequest request);
        Task<Result<StoreDto>> GetStoreByIdAsync(int id);
    }
}
