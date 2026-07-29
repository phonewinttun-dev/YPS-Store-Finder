using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using YpsStoreFinder.Domain.Features.Bus.DTOs;
using YpsStoreFinder.Shared;

namespace YpsStoreFinder.Domain.Features.Bus
{
    public interface IBusService
    {
        Task<PagedResult<BusLineDto>> GetBusLinesAsync(BusLineRequest request, CancellationToken cancellationToken = default);
        Task<PagedResult<BusLineDto>> GetYpsBusLinesAsync(BusLineRequest request, CancellationToken cancellationToken = default);
        Task<Result<BusRouteDetailDto>> GetBusRouteByNumberAsync(string busNumber, CancellationToken cancellationToken = default);
        Task<Result<StoreNearbyBusStopsDto>> GetNearbyBusStopsForStoreAsync(int storeId, CancellationToken cancellationToken = default);
    }
}
