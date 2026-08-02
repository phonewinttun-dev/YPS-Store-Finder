using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using YpsStoreFinder.Database;
using YpsStoreFinder.Database.Models;
using YpsStoreFinder.Domain.Features.Store.DTOs;
using YpsStoreFinder.Shared;

namespace YpsStoreFinder.Domain.Features.Store
{
    public class StoreService : IStoreService
    {
        private readonly AppDbContext _context;
        private readonly IMemoryCache _cache;
        private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(10);

        public StoreService(AppDbContext context, IMemoryCache cache)
        {
            _context = context;
            _cache = cache;
        }

        // Returns ALL stores for the given category (cached in memory for optimal map rendering)
        public async Task<Result<List<StoreDto>>> GetStoresAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                
                var cacheKey = "stores_all";
                var stores = await _cache.GetOrCreateAsync(cacheKey,
                async entry =>
                {
                    entry.SetAbsoluteExpiration(TimeSpan.FromHours(24));
                    entry.SetPriority(CacheItemPriority.High);

                    return await _context.TblStores
                        .AsNoTracking()
                        .Select(s => new StoreDto
                        {
                            Id = s.Id,
                            Category = s.Category,
                            Name = s.Name,
                            Latitude = s.Latitude,
                            Longitude = s.Longitude,
                            Address = s.Address,
                            Description = s.Description,
                            RawAttributes = s.RawAttributes
                        })
                        .ToListAsync(cancellationToken);
                });

                return Result<List<StoreDto>>.Success(stores ?? new List<StoreDto>());
            }
            catch (Exception ex)
            {
                return Result<List<StoreDto>>.Failure($"Failed to retrieve stores: {ex.Message}");
            }
        }

        // Paginated search method
        public async Task<PagedResult<StoreDto>> SearchStoresAsync(StoreSearchRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                if (request == null)
                    return PagedResult<StoreDto>.Failure("Invalid search request");

                var pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
                var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

                var query = _context.TblStores.AsNoTracking().AsQueryable();

                if (!string.IsNullOrWhiteSpace(request.Category))
                {
                    var categoryTerm = request.Category.Trim();
                    query = query.Where(s => s.Category.ToLower() == categoryTerm.ToLower());
                }

                if (!string.IsNullOrWhiteSpace(request.Query))
                {
                    var term = request.Query.Trim().ToLower();
                    query = query.Where(s => s.Name.ToLower().Contains(term) ||
                                             (s.Address != null && s.Address.ToLower().Contains(term)));
                }

                var totalCount = await query.CountAsync(cancellationToken);
                var items = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .Select(s => MapToDto(s))
                    .ToListAsync(cancellationToken);

                var pagination = new Pagination(pageNumber, pageSize, totalCount);
                return PagedResult<StoreDto>.Success(items, pagination);
            }
            catch (Exception ex)
            {
                return PagedResult<StoreDto>.Failure($"Search failed: {ex.Message}");
            }
        }

        public async Task<Result<StoreDto>> GetStoreByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                var cacheKey = $"store_item_{id}";
                if (_cache.TryGetValue(cacheKey, out StoreDto? cachedStore) && cachedStore != null)
                {
                    return Result<StoreDto>.Success(cachedStore);
                }

                var store = await _context.TblStores.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
                if (store == null)
                {
                    return Result<StoreDto>.Failure($"Store with ID {id} was not found.");
                }

                var dto = MapToDto(store);
                _cache.Set(cacheKey, dto, CacheDuration);
                return Result<StoreDto>.Success(dto);
            }
            catch (Exception ex)
            {
                return Result<StoreDto>.Failure($"Error retrieving store: {ex.Message}");
            }
        }

        public async Task<Result<List<CategorySummaryDto>>> GetCategoriesSummaryAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                string cacheKey = "stores_categories_summary";
                var categories = await _cache.GetOrCreateAsync(cacheKey, async entry =>
                {
                    entry.SetAbsoluteExpiration(TimeSpan.FromHours(24));
                    entry.SetPriority(CacheItemPriority.High);
                    return await _context.TblStores
                        .AsNoTracking()
                        .GroupBy(s => s.Category)
                        .Select(g => new CategorySummaryDto
                        {
                            Category = g.Key,
                            Count = g.Count()
                        })
                        .OrderBy(c => c.Count)
                        .ToListAsync(cancellationToken);
                });
                return Result<List<CategorySummaryDto>>.Success(categories ?? new List<CategorySummaryDto>());
            }
            catch (Exception ex)
            {
                return Result<List<CategorySummaryDto>>.Failure($"Failed to calculate categories summary: {ex.Message}");
            }
        }

        // Paginated geo-spatial nearby method utilizing cached store data
        public async Task<PagedResult<StoreDto>> GetNearbyStoresAsync(NearbyStoreRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                var pageNumber = request.PageNumber < 1 ? 1 : request.PageNumber;
                var pageSize = request.PageSize < 1 ? 10 : request.PageSize;

                var storesResult = await GetStoresAsync(cancellationToken);
                if (!storesResult.IsSuccess || storesResult.Data == null)
                {
                    return PagedResult<StoreDto>.Failure(storesResult.Message);
                }

                var nearbyStores = storesResult.Data
                    .Select(s => new StoreDto
                    {
                        Id = s.Id,
                        Category = s.Category,
                        Name = s.Name,
                        Latitude = s.Latitude,
                        Longitude = s.Longitude,
                        Address = s.Address,
                        Description = s.Description,
                        RawAttributes = s.RawAttributes,
                        DistanceKm = Math.Round(CalculateHaversineDistance(request.Latitude, request.Longitude, s.Latitude, s.Longitude), 2)
                    })
                    .Where(dto => dto.DistanceKm >= request.MinRadiusKm && dto.DistanceKm <= request.RadiusKm)
                    .OrderBy(dto => dto.DistanceKm)
                    .ToList();

                var totalCount = nearbyStores.Count;
                var pagedItems = nearbyStores
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                var pagination = new Pagination(pageNumber, pageSize, totalCount);
                return PagedResult<StoreDto>.Success(pagedItems, pagination);
            }
            catch (Exception ex)
            {
                return PagedResult<StoreDto>.Failure($"Geo-spatial calculation failed: {ex.Message}");
            }
        }

        private static StoreDto MapToDto(TblStore entity)
        {
            return new StoreDto
            {
                Id = entity.Id,
                Category = entity.Category,
                Name = entity.Name,
                Latitude = entity.Latitude,
                Longitude = entity.Longitude,
                Address = entity.Address,
                Description = entity.Description,
                RawAttributes = entity.RawAttributes
            };
        }

        private static double CalculateHaversineDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371.0; // Earth mean radius in kilometers

            var dLat = ToRadians(lat2 - lat1);
            var dLon = ToRadians(lon2 - lon1);

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            return R * c;
        }

        private static double ToRadians(double degrees)
        {
            return degrees * (Math.PI / 180.0);
        }
    }
}
