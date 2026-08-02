using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using YpsStoreFinder.Domain.Features.Store;
using YpsStoreFinder.Domain.Features.Store.DTOs;

namespace YpsStoreFinder.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("ip-fixed-window")]
    public class StoresController : ControllerBase
    {
        private readonly IStoreService _storeService;

        public StoresController(IStoreService storeService)
        {
            _storeService = storeService;
        }

        // Returns ALL stores (cached in memory) for map rendering & initial display
        [HttpGet]
        public async Task<IActionResult> GetStores(CancellationToken cancellationToken = default)
        {
            var result = await _storeService.GetStoresAsync(cancellationToken);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        // Paginated search results
        [HttpGet("search")]
        public async Task<IActionResult> SearchStores([FromQuery] StoreSearchRequest request, CancellationToken cancellationToken = default)
        {
            var result = await _storeService.SearchStoresAsync(request, cancellationToken);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategoriesSummary(CancellationToken cancellationToken = default)
        {
            var result = await _storeService.GetCategoriesSummaryAsync(cancellationToken);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        // Paginated geo-spatial nearby results
        [HttpGet("nearby")]
        public async Task<IActionResult> GetNearbyStores([FromQuery] NearbyStoreRequest request, CancellationToken cancellationToken = default)
        {
            var result = await _storeService.GetNearbyStoresAsync(request, cancellationToken);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetStoreById(int id, CancellationToken cancellationToken = default)
        {
            var result = await _storeService.GetStoreByIdAsync(id, cancellationToken);
            if (!result.IsSuccess)
            {
                return NotFound(result);
            }
            return Ok(result);
        }
    }
}
