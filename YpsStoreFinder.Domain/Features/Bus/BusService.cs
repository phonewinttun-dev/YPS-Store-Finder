using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System.Text.Json;
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

        public async Task<PagedResult<BusLineDto>> GetBusLinesAsync(PaginationRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                var pageNumber = request.PageNumber < 1 ? 1 : request.PageNumber;
                var pageSize = request.PageSize < 1 ? 10 : request.PageSize;

                var query = _context.TblBusRoutes.AsNoTracking().AsQueryable();

                var totalCount = await query.CountAsync(cancellationToken);
                var items = await query
                    .OrderBy(r => r.BusNumber.Length)
                    .ThenBy(r => r.BusNumber)
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
                    .ToListAsync(cancellationToken);

                var pagination = new Pagination(pageNumber, pageSize, totalCount);
                return PagedResult<BusLineDto>.Success(items, pagination);
            }
            catch (Exception ex)
            {
                return PagedResult<BusLineDto>.Failure($"Failed to retrieve bus lines: {ex.Message}");
            }
        }

        public async Task<PagedResult<BusLineDto>> GetYpsBusLinesAsync(PaginationRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                var pageNumber = request.PageNumber < 1 ? 1 : request.PageNumber;
                var pageSize = request.PageSize < 1 ? 10 : request.PageSize;

                var query = _context.TblBusRoutes.AsNoTracking()
                    .Where(r => r.IsYpsSupported)
                    .AsQueryable();

                var totalCount = await query.CountAsync(cancellationToken);
                var items = await query
                    .OrderBy(r => r.BusNumber.Length)
                    .ThenBy(r => r.BusNumber)
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
                    .ToListAsync(cancellationToken);

                var pagination = new Pagination(pageNumber, pageSize, totalCount);
                return PagedResult<BusLineDto>.Success(items, pagination);
            }
            catch (Exception ex)
            {
                return PagedResult<BusLineDto>.Failure($"Failed to retrieve YPS bus lines: {ex.Message}");
            }
        }

        public async Task<PagedResult<BusLineDto>> SearchBusLinesAsync(BusLineRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                var pageNumber = request.PageNumber < 1 ? 1 : request.PageNumber;
                var pageSize = request.PageSize < 1 ? 10 : request.PageSize;

                var query = _context.TblBusRoutes.AsNoTracking().AsQueryable();

                if (!string.IsNullOrWhiteSpace(request.Keyword))
                {
                    var term = request.Keyword.Trim().ToLower();
                    query = query.Where(r => r.BusNumber.ToLower().Contains(term) ||
                                             (r.OutboundTitle != null && r.OutboundTitle.ToLower().Contains(term)) ||
                                             (r.ReturnTitle != null && r.ReturnTitle.ToLower().Contains(term)));
                }

                var totalCount = await query.CountAsync(cancellationToken);
                var items = await query
                    .OrderBy(r => r.BusNumber.Length)
                    .ThenBy(r => r.BusNumber)
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
                    .ToListAsync(cancellationToken);

                var pagination = new Pagination(pageNumber, pageSize, totalCount);
                return PagedResult<BusLineDto>.Success(items, pagination);
            }
            catch (Exception ex)
            {
                return PagedResult<BusLineDto>.Failure($"Failed to search bus lines: {ex.Message}");
            }
        }

        public async Task<Result<BusRouteDetailDto>> GetBusRouteByNumberAsync(string busNumber, CancellationToken cancellationToken = default)
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
                    .FirstOrDefaultAsync(r => r.BusNumber.ToLower() == cleanNum.ToLower(), cancellationToken);

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

        public async Task<Result<StoreNearbyBusStopsDto>> GetNearbyBusStopsForStoreAsync(int storeId, CancellationToken cancellationToken = default)
        {
            try
            {
                var store = await _context.TblStores
                    .AsNoTracking()
                    .FirstOrDefaultAsync(s => s.Id == storeId, cancellationToken);

                if (store == null)
                {
                    return Result<StoreNearbyBusStopsDto>.Failure($"Store with ID {storeId} was not found.");
                }

                var matchedStops = new List<TblBusStop>();
                var searchTerms = new List<string>();

                // 1. Primary source: extract nearest bus stop names directly from store.NearestBusStopsJson
                if (!string.IsNullOrWhiteSpace(store.NearestBusStopsJson))
                {
                    try
                    {
                        using var doc = JsonDocument.Parse(store.NearestBusStopsJson);
                        if (doc.RootElement.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var elem in doc.RootElement.EnumerateArray())
                            {
                                if (elem.TryGetProperty("mm", out var mmProp))
                                {
                                    var mmVal = mmProp.GetString()?.Trim();
                                    if (!string.IsNullOrEmpty(mmVal) && !searchTerms.Contains(mmVal))
                                        searchTerms.Add(mmVal);
                                }
                                if (elem.TryGetProperty("en", out var enProp))
                                {
                                    var enVal = enProp.GetString()?.Trim();
                                    if (!string.IsNullOrEmpty(enVal) && !searchTerms.Contains(enVal))
                                        searchTerms.Add(enVal);
                                }
                            }
                        }
                    }
                    catch { }
                }

                // 2. Secondary source: extract terms from store Name and Address
                var addressKeywords = ExtractSearchTerms(store.Name, store.Address, store.Description);
                foreach (var kw in addressKeywords)
                {
                    if (!searchTerms.Contains(kw)) searchTerms.Add(kw);
                }

                var query = _context.TblBusStops.AsNoTracking().AsQueryable();

                foreach (var term in searchTerms)
                {
                    var lowerTerm = term.ToLower();
                    var hits = await query
                        .Where(s => s.StopName.ToLower().Contains(lowerTerm) || 
                                    (s.RoadTownship != null && s.RoadTownship.ToLower().Contains(lowerTerm)))
                        .Take(25)
                        .ToListAsync(cancellationToken);
                    matchedStops.AddRange(hits);
                }

                // 3. Fallback: query by township extracted from address if direct terms yielded no hits
                if (matchedStops.Count == 0)
                {
                    var township = ExtractTownship(store.Address);
                    if (!string.IsNullOrWhiteSpace(township))
                    {
                        var lowerTownship = township.ToLower();
                        var townshipHits = await query
                            .Where(s => s.RoadTownship != null && s.RoadTownship.ToLower().Contains(lowerTownship))
                            .Take(25)
                            .ToListAsync(cancellationToken);
                        matchedStops.AddRange(townshipHits);
                    }
                }

                var distinctStops = matchedStops
                    .GroupBy(s => new { s.StopName, s.RoadTownship })
                    .Take(15)
                    .ToList();

                var ypsLines = await _context.TblYpsBusLines
                    .AsNoTracking()
                    .Select(x => x.BusLineNumber)
                    .ToListAsync(cancellationToken);

                var ypsSet = new HashSet<string>(ypsLines, StringComparer.OrdinalIgnoreCase);

                var stopItems = new List<NearbyBusStopItem>();

                foreach (var group in distinctStops)
                {
                    var servicingBuses = group.Select(x => x.BusNumber).Distinct().OrderBy(b => b.Length).ThenBy(b => b).ToList();
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
                var list = new List<BusStopDto>();
                using var doc = JsonDocument.Parse(json);

                if (doc.RootElement.ValueKind == JsonValueKind.Array)
                {
                    int autoOrder = 1;
                    foreach (var elem in doc.RootElement.EnumerateArray())
                    {
                        string stopName = "";
                        string? roadTownship = null;
                        int order = autoOrder++;
                        string stopType = "";

                        if (elem.TryGetProperty("stopName", out var sn) || elem.TryGetProperty("StopName", out sn) || elem.TryGetProperty("stop_name", out sn) || elem.TryGetProperty("name", out sn))
                        {
                            stopName = sn.GetString() ?? "";
                        }
                        if (elem.TryGetProperty("roadTownship", out var rt) || elem.TryGetProperty("RoadTownship", out rt) || elem.TryGetProperty("road_township", out rt) || elem.TryGetProperty("township", out rt))
                        {
                            roadTownship = rt.GetString();
                        }
                        if (elem.TryGetProperty("stopOrder", out var so) || elem.TryGetProperty("StopOrder", out so) || elem.TryGetProperty("stop_order", out so) || elem.TryGetProperty("sequenceOrder", out so))
                        {
                            if (so.ValueKind == JsonValueKind.Number) order = so.GetInt32();
                        }
                        if (elem.TryGetProperty("stopType", out var st) || elem.TryGetProperty("StopType", out st))
                        {
                            stopType = st.GetString() ?? "";
                        }

                        if (!string.IsNullOrWhiteSpace(stopName))
                        {
                            list.Add(new BusStopDto
                            {
                                StopName = stopName,
                                RoadTownship = roadTownship,
                                StopOrder = order,
                                StopType = stopType
                            });
                        }
                    }
                }
                return list;
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
                    var clean = p.Trim();
                    if (clean.Length >= 2 && !terms.Contains(clean))
                    {
                        terms.Add(clean);
                    }
                }
            }

            if (!string.IsNullOrWhiteSpace(name))
            {
                var parts = name.Split(new[] { ' ', '(', ')', '[', ']' }, StringSplitOptions.RemoveEmptyEntries);
                foreach (var p in parts)
                {
                    var clean = p.Trim();
                    if (clean.Length >= 2 && !terms.Contains(clean))
                    {
                        terms.Add(clean);
                    }
                }
            }

            return terms.Take(8).ToList();
        }

        private static string? ExtractTownship(string? address)
        {
            if (string.IsNullOrWhiteSpace(address)) return null;
            var parts = address.Split(',');
            return parts.Length > 1 ? parts.Last().Trim() : address.Trim();
        }
    }
}
