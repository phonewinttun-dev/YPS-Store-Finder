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
        public async Task<IActionResult> GetStores([FromQuery] string? category = null)
        {
            var result = await _storeService.GetStoresAsync(category);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        // Paginated search results
        [HttpGet("search")]
        public async Task<IActionResult> SearchStores([FromQuery] StoreSearchRequest request)
        {
            var result = await _storeService.SearchStoresAsync(request);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategoriesSummary()
        {
            var result = await _storeService.GetCategoriesSummaryAsync();
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        // Paginated geo-spatial nearby results
        [HttpGet("nearby")]
        public async Task<IActionResult> GetNearbyStores([FromQuery] NearbyStoreRequest request)
        {
            var result = await _storeService.GetNearbyStoresAsync(request);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetStoreById(int id)
        {
            var result = await _storeService.GetStoreByIdAsync(id);
            if (!result.IsSuccess)
            {
                return NotFound(result);
            }
            return Ok(result);
        }
    }
}
