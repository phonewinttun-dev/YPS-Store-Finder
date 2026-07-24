using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using YpsStoreFinder.Database;
using YpsStoreFinder.Database.Models;
using YpsStoreFinder.Domain.Features.Bus.DTOs;
using YpsStoreFinder.Shared;

namespace YpsStoreFinder.Domain.Features.Bus
{
    public class BusService : IBusService
    {
        private readonly AppDbContext _context;
        private readonly IMemoryCache _cache;
        private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(10);

        public BusService(AppDbContext context, IMemoryCache cache)
        {
            _context = context;
            _cache = cache;
        }

        public async Task<PagedResult<BusLineDto>> GetBusLinesAsync(BusLineRequest request)
        {
            return await QueryBusLinesInternalAsync(request, ypsOnly: false);
        }

        public async Task<PagedResult<BusLineDto>> GetYpsBusLinesAsync(BusLineRequest request)
        {
            return await QueryBusLinesInternalAsync(request, ypsOnly: true);
        }

        private async Task<PagedResult<BusLineDto>> QueryBusLinesInternalAsync(BusLineRequest request, bool ypsOnly)
        {
            try
            {
                var pageNumber = request.PageNumber < 1 ? 1 : request.PageNumber;
                var pageSize = request.PageSize < 1 ? 10 : request.PageSize;

                var query = _context.TblBusRoutes.AsNoTracking().AsQueryable();

                if (ypsOnly)
                {
                    query = query.Where(r => r.IsYpsSupported);
                }

                if (!string.IsNullOrWhiteSpace(request.Keyword))
                {
                    var term = request.Keyword.Trim().ToLower();
                    query = query.Where(r => r.BusNumber.ToLower().Contains(term) ||
                                             (r.OutboundTitle != null && r.OutboundTitle.ToLower().Contains(term)) ||
                                             (r.ReturnTitle != null && r.ReturnTitle.ToLower().Contains(term)));
                }

                var totalCount = await query.CountAsync();
                var items = await query
                    .OrderBy(r => r.BusNumber)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .Select(r => new BusLineDto
                    {
                        BusNumber = r.BusNumber,
                        RouteId = r.RouteId,
                        IsYpsSupported = r.IsYpsSupported,
                        OutboundTitle = r.OutboundTitle,
                        OutboundTotalStops = r.OutboundTotalStops,
                        ReturnTitle = r.ReturnTitle,
                        ReturnTotalStops = r.ReturnTotalStops
                    })
                    .ToListAsync();

                var pagination = new Pagination(pageNumber, pageSize, totalCount);
                return PagedResult<BusLineDto>.Success(items, pagination);
            }
            catch (Exception ex)
            {
                return PagedResult<BusLineDto>.Failure($"Failed to retrieve bus lines: {ex.Message}");
            }
        }

        public async Task<Result<BusRouteDetailDto>> GetBusRouteByNumberAsync(string busNumber)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(busNumber))
                {
                    return Result<BusRouteDetailDto>.Failure("Bus number is required.");
                }

                var cleanNum = busNumber.Trim();
                var cacheKey = $"bus_route_detail_{cleanNum.ToLower()}";

                if (_cache.TryGetValue(cacheKey, out BusRouteDetailDto? cached) && cached != null)
                {
                    return Result<BusRouteDetailDto>.Success(cached);
                }

                var route = await _context.TblBusRoutes
                    .AsNoTracking()
                    .FirstOrDefaultAsync(r => r.BusNumber.ToLower() == cleanNum.ToLower());

                if (route == null)
                {
                    return Result<BusRouteDetailDto>.Failure($"Bus line '{busNumber}' was not found.");
                }

                var dto = new BusRouteDetailDto
                {
                    BusNumber = route.BusNumber,
                    RouteId = route.RouteId,
                    IsYpsSupported = route.IsYpsSupported,
                    OutboundTitle = route.OutboundTitle,
                    ReturnTitle = route.ReturnTitle,
                    OutboundStops = DeserializeStops(route.OutboundStopsJson),
                    ReturnStops = DeserializeStops(route.ReturnStopsJson)
                };

                _cache.Set(cacheKey, dto, CacheDuration);
                return Result<BusRouteDetailDto>.Success(dto);
            }
            catch (Exception ex)
            {
                return Result<BusRouteDetailDto>.Failure($"Error retrieving bus route: {ex.Message}");
            }
        }

        public async Task<Result<StoreNearbyBusStopsDto>> GetNearbyBusStopsForStoreAsync(int storeId)
        {
            try
            {
                var store = await _context.TblStores
                    .AsNoTracking()
                    .FirstOrDefaultAsync(s => s.Id == storeId);

                if (store == null)
                {
                    return Result<StoreNearbyBusStopsDto>.Failure($"Store with ID {storeId} was not found.");
                }

                // Extract township / keywords from store address or description
                var keywords = ExtractSearchTerms(store.Name, store.Address, store.Description);

                var query = _context.TblBusStops.AsNoTracking().AsQueryable();
                var matchedStops = new List<TblBusStop>();

                foreach (var kw in keywords)
                {
                    var term = kw.ToLower();
                    var hits = await query
                        .Where(s => s.StopName.ToLower().Contains(term) || (s.RoadTownship != null && s.RoadTownship.ToLower().Contains(term)))
                        .Take(20)
                        .ToListAsync();
                    matchedStops.AddRange(hits);
                }

                var distinctStops = matchedStops
                    .GroupBy(s => new { s.StopName, s.RoadTownship })
                    .Take(10)
                    .ToList();

                var ypsLines = await _context.TblYpsBusLines
                    .AsNoTracking()
                    .Select(x => x.BusLineNumber)
                    .ToListAsync();

                var ypsSet = new HashSet<string>(ypsLines, StringComparer.OrdinalIgnoreCase);

                var stopItems = new List<NearbyBusStopItem>();

                foreach (var group in distinctStops)
                {
                    var servicingBuses = group.Select(x => x.BusNumber).Distinct().OrderBy(b => b).ToList();
                    var ypsSupportedBuses = servicingBuses.Where(b => ypsSet.Contains(b)).ToList();

                    stopItems.Add(new NearbyBusStopItem
                    {
                        StopName = group.Key.StopName,
                        RoadTownship = group.Key.RoadTownship,
                        ServicingBusNumbers = servicingBuses,
                        YpsSupportedBusNumbers = ypsSupportedBuses
                    });
                }

                var resultDto = new StoreNearbyBusStopsDto
                {
                    StoreId = store.Id,
                    StoreName = store.Name,
                    Township = ExtractTownship(store.Address),
                    NearbyBusStops = stopItems
                };

                return Result<StoreNearbyBusStopsDto>.Success(resultDto);
            }
            catch (Exception ex)
            {
                return Result<StoreNearbyBusStopsDto>.Failure($"Failed to calculate nearby bus stops: {ex.Message}");
            }
        }

        private static List<BusStopDto> DeserializeStops(string? json)
        {
            if (string.IsNullOrWhiteSpace(json)) return new List<BusStopDto>();
            try
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<List<BusStopDto>>(json, options) ?? new List<BusStopDto>();
            }
            catch
            {
                return new List<BusStopDto>();
            }
        }

        private static List<string> ExtractSearchTerms(string name, string? address, string? description)
        {
            var terms = new List<string>();

            if (!string.IsNullOrWhiteSpace(address))
            {
                var parts = address.Split(new[] { ',', ' ', '၊', '။' }, StringSplitOptions.RemoveEmptyEntries);
                foreach (var p in parts)
                {
                    if (p.Trim().Length >= 2 && !terms.Contains(p.Trim()))
                    {
                        terms.Add(p.Trim());
                    }
                }
            }

            if (!string.IsNullOrWhiteSpace(name))
            {
                var parts = name.Split(new[] { ' ', '(', ')', '[', ']' }, StringSplitOptions.RemoveEmptyEntries);
                foreach (var p in parts)
                {
                    if (p.Trim().Length >= 3 && !terms.Contains(p.Trim()))
                    {
                        terms.Add(p.Trim());
                    }
                }
            }

            return terms.Take(5).ToList();
        }

        private static string? ExtractTownship(string? address)
        {
            if (string.IsNullOrWhiteSpace(address)) return null;
            var parts = address.Split(',');
            return parts.Length > 1 ? parts.Last().Trim() : address.Trim();
        }
    }
}
