using System.Collections.Generic;
using System.Threading.Tasks;
using YpsStoreFinder.Domain.Features.Bus.DTOs;
using YpsStoreFinder.Shared;

namespace YpsStoreFinder.Domain.Features.Bus
{
    public interface IBusService
    {
        Task<PagedResult<BusLineDto>> GetBusLinesAsync(BusLineRequest request);
        Task<PagedResult<BusLineDto>> GetYpsBusLinesAsync(BusLineRequest request);
        Task<Result<BusRouteDetailDto>> GetBusRouteByNumberAsync(string busNumber);
        Task<Result<StoreNearbyBusStopsDto>> GetNearbyBusStopsForStoreAsync(int storeId);
    }
}
