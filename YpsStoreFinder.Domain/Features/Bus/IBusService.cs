using YpsStoreFinder.Domain.Features.Bus.DTOs;
using YpsStoreFinder.Shared;

namespace YpsStoreFinder.Domain.Features.Bus
{
    public interface IBusService
    {
        Task<Result<List<BusLineDto>>> GetBusLinesAsync(CancellationToken cancellationToken = default);
        Task<PagedResult<BusLineDto>> GetYpsBusLinesAsync(PaginationRequest request, CancellationToken cancellationToken = default);
        Task<PagedResult<BusLineDto>> SearchBusLinesAsync(BusLineRequest request, CancellationToken cancellationToken = default);
        Task<Result<BusRouteDetailDto>> GetBusRouteByNumberAsync(string busNumber, CancellationToken cancellationToken = default);
        Task<Result<StoreNearbyBusStopsDto>> GetNearbyBusStopsForStoreAsync(int storeId, CancellationToken cancellationToken = default);
    }
}
