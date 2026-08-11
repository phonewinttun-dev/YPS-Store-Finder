using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
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

        public async Task<Result<List<StoreDto>>> GetStoresAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                var cacheKey = "stores_all";
                var stores = await _cache.GetOrCreateAsync(cacheKey, async entry =>
                {
                    entry.SetAbsoluteExpiration(TimeSpan.FromHours(24));
                    entry.SetPriority(CacheItemPriority.High);

                    var dbEntities = await GetBaseStoreQuery()
                        .ToListAsync(cancellationToken);

                    return dbEntities.Select(s => MapToDto(s)).ToList();
                });

                return Result<List<StoreDto>>.Success(stores ?? new List<StoreDto>());
            }
            catch (Exception ex)
            {
                return Result<List<StoreDto>>.Failure($"Failed to retrieve stores: {ex.Message}");
            }
        }

        public async Task<PagedResult<StoreDto>> SearchStoresAsync(StoreSearchRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                if (request == null)
                    return PagedResult<StoreDto>.Failure("Invalid search request");

                var pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
                var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

                var query = GetBaseStoreQuery();

                if (!string.IsNullOrWhiteSpace(request.Category))
                {
                    var categoryTerm = request.Category.Trim().ToLower();
                    query = query.Where(s => s.Category != null && s.Category.ToLower() == categoryTerm);
                }

                if (request.TownshipId.HasValue && request.TownshipId > 0)
                {
                    query = query.Where(s => s.TownshipId == request.TownshipId.Value);
                }

                if (!string.IsNullOrWhiteSpace(request.Query))
                {
                    var term = request.Query.Trim().ToLower();
                    query = query.Where(s => (s.NameMm != null && s.NameMm.ToLower().Contains(term)) ||
                                             (s.NameEn != null && s.NameEn.ToLower().Contains(term)) ||
                                             (s.Township != null && ((s.Township.TownshipNameMm != null && s.Township.TownshipNameMm.ToLower().Contains(term)) ||
                                                                    (s.Township.TownshipNameEn != null && s.Township.TownshipNameEn.ToLower().Contains(term)))));
                }

                var totalCount = await query.CountAsync(cancellationToken);
                var items = await query
                    .OrderBy(s => s.StoreId)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync(cancellationToken);

                var dtos = items.Select(s => MapToDto(s)).ToList();
                var pagination = new Pagination(pageNumber, pageSize, totalCount);
                return PagedResult<StoreDto>.Success(dtos, pagination);
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

                var store = await GetBaseStoreQuery()
                    .FirstOrDefaultAsync(s => s.StoreId == id, cancellationToken);

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
                    return await _context.TblYpsStores
                        .AsNoTracking()
                        .Where(s => s.Category != null)
                        .GroupBy(s => s.Category!)
                        .Select(g => new CategorySummaryDto
                        {
                            Category = g.Key,
                            Count = g.Count()
                        })
                        .OrderByDescending(c => c.Count)
                        .ToListAsync(cancellationToken);
                });
                return Result<List<CategorySummaryDto>>.Success(categories ?? new List<CategorySummaryDto>());
            }
            catch (Exception ex)
            {
                return Result<List<CategorySummaryDto>>.Failure($"Failed to calculate categories summary: {ex.Message}");
            }
        }

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

                var query = storesResult.Data.AsEnumerable();

                if (!string.IsNullOrWhiteSpace(request.Category))
                {
                    var cat = request.Category.Trim().ToLower();
                    query = query.Where(s => s.Category.ToLower() == cat);
                }

                var nearbyStores = query
                    .Select(s =>
                    {
                        var dist = Math.Round(CalculateHaversineDistance(request.Latitude, request.Longitude, s.Latitude, s.Longitude), 2);
                        return new StoreDto
                        {
                            StoreId = s.StoreId,
                            NameMm = s.NameMm,
                            NameEn = s.NameEn,
                            Category = s.Category,
                            TownshipId = s.TownshipId,
                            TownshipNameMm = s.TownshipNameMm,
                            TownshipNameEn = s.TownshipNameEn,
                            Latitude = s.Latitude,
                            Longitude = s.Longitude,
                            DistanceKm = dist,
                            NearestStops = s.NearestStops,
                            ServingBusLines = s.ServingBusLines
                        };
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

        private IQueryable<TblYpsStore> GetBaseStoreQuery()
        {
            return _context.TblYpsStores
                .AsNoTracking()
                .Include(s => s.Township)
                .Include(s => s.NearestStops)
                    .ThenInclude(ns => ns.MatchedStop)
                .Include(s => s.ServingBusLines)
                    .ThenInclude(sb => sb.BusLine);
        }

        private static StoreDto MapToDto(TblYpsStore entity)
        {
            return new StoreDto
            {
                StoreId = entity.StoreId,
                NameMm = entity.NameMm ?? string.Empty,
                NameEn = entity.NameEn ?? string.Empty,
                Category = entity.Category ?? string.Empty,
                TownshipId = entity.TownshipId,
                TownshipNameMm = entity.Township?.TownshipNameMm ?? string.Empty,
                TownshipNameEn = entity.Township?.TownshipNameEn ?? string.Empty,
                Latitude = entity.Latitude,
                Longitude = entity.Longitude,
                NearestStops = entity.NearestStops?.Select(ns => new StoreNearestStopDto
                {
                    Id = ns.Id,
                    StoreId = ns.StoreId,
                    StopNameMm = ns.StopNameMm ?? string.Empty,
                    StopNameEn = ns.StopNameEn ?? string.Empty,
                    MatchedStopId = ns.MatchedStopId,
                    RoadMm = ns.MatchedStop?.RoadMm,
                    RoadEn = ns.MatchedStop?.RoadEn
                }).ToList() ?? new List<StoreNearestStopDto>(),
                ServingBusLines = entity.ServingBusLines?.Select(sb => new StoreServingBusLineDto
                {
                    Id = sb.Id,
                    StoreId = sb.StoreId,
                    BusNumber = sb.BusNumber ?? string.Empty,
                    RouteId = sb.RouteId,
                    IsYpsAccepted = sb.BusLine?.IsYpsAccepted ?? false
                }).ToList() ?? new List<StoreServingBusLineDto>()
            };
        }

        private static double CalculateHaversineDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371.0;

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
