using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using YpsStoreFinder.Domain.Features.Store.DTOs;
using YpsStoreFinder.Shared;

namespace YpsStoreFinder.Domain.Features.Store
{
    public interface IStoreService
    {
        Task<Result<List<StoreDto>>> GetStoresAsync(string? category = null, CancellationToken cancellationToken = default);
        Task<PagedResult<StoreDto>> SearchStoresAsync(StoreSearchRequest request, CancellationToken cancellationToken = default);
        Task<Result<List<CategorySummaryDto>>> GetCategoriesSummaryAsync(CancellationToken cancellationToken = default);
        Task<PagedResult<StoreDto>> GetNearbyStoresAsync(NearbyStoreRequest request, CancellationToken cancellationToken = default);
        Task<Result<StoreDto>> GetStoreByIdAsync(int id, CancellationToken cancellationToken = default);
    }
}
