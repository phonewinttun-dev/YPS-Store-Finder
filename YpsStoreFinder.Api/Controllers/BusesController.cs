using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using YpsStoreFinder.Domain.Features.Bus;
using YpsStoreFinder.Domain.Features.Bus.DTOs;

namespace YpsStoreFinder.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("ip-fixed-window")]
    public class BusesController : ControllerBase
    {
        private readonly IBusService _busService;

        public BusesController(IBusService busService)
        {
            _busService = busService;
        }

        // Returns paginated list of ALL YBS bus lines
        [HttpGet]
        public async Task<IActionResult> GetBusLines([FromQuery] BusLineRequest request, CancellationToken cancellationToken = default)
        {
            var result = await _busService.GetBusLinesAsync(request, cancellationToken);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        // Returns paginated list of YPS-supported bus lines only
        [HttpGet("yps-supported")]
        public async Task<IActionResult> GetYpsBusLines([FromQuery] BusLineRequest request, CancellationToken cancellationToken = default)
        {
            var result = await _busService.GetYpsBusLinesAsync(request, cancellationToken);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        // Returns route details & stop list for a specific bus number
        [HttpGet("{busNumber}")]
        public async Task<IActionResult> GetBusRouteByNumber(string busNumber, CancellationToken cancellationToken = default)
        {
            var result = await _busService.GetBusRouteByNumberAsync(busNumber, cancellationToken);
            if (!result.IsSuccess)
            {
                return NotFound(result);
            }
            return Ok(result);
        }

        // Returns bus stops and bus lines near a specific store
        [HttpGet("nearby-store/{storeId:int}")]
        public async Task<IActionResult> GetNearbyBusStopsForStore(int storeId, CancellationToken cancellationToken = default)
        {
            var result = await _busService.GetNearbyBusStopsForStoreAsync(storeId, cancellationToken);
            if (!result.IsSuccess)
            {
                return NotFound(result);
            }
            return Ok(result);
        }
    }
}
