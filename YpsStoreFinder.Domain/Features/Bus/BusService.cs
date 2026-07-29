using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Nodes;
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

        private static readonly Dictionary<string, string> BilingualDictionary = new(StringComparer.OrdinalIgnoreCase)
        {
            { "Sule", "ဆူလေ" },
            { "City Hall", "မြို့တော်ခန်းမ" },
            { "Kyauktada", "ကျောက်တံတား" },
            { "Pabedan", "ပန်းဘဲတန်း" },
            { "Latha", "လသာ" },
            { "Lanmadaw", "လမ်းမတော်" },
            { "Ahlone", "အလုံ" },
            { "San Chaung", "စမ်းချောင်း" },
            { "Sanchaung", "စမ်းချောင်း" },
            { "Kyun Taw", "ကျွန်းတော" },
            { "Kamayut", "ကမာရွတ်" },
            { "Bahan", "ဗဟန်း" },
            { "Dagon", "ဒဂုံ" },
            { "Yankin", "ရန်ကင်း" },
            { "Mayangone", "မရမ်းကုန်း" },
            { "Mayangon", "မရမ်းကုန်း" },
            { "Insein", "အင်းစိန်" },
            { "Mingaladon", "မင်္ဂလာဒုံ" },
            { "Tamwe", "တာမွေ" },
            { "Thingangyun", "သင်္ဃန်းကျွန်း" },
            { "South Okkalapa", "တောင်ဥက္ကလာပ" },
            { "North Okkalapa", "မြောက်ဥက္ကလာပ" },
            { "Thaketa", "သာကေတ" },
            { "Dawbon", "ဒေါပုံ" },
            { "Pazundaung", "ပုဇွန်တောင်" },
            { "Botahtaung", "ဗိုလ်တထောင်" },
            { "Hlaing", "လှိုင်" },
            { "Hlaingthaya", "လှိုင်သာယာ" },
            { "Shwepyitha", "ရွှေပြည်သာ" },
            { "Pyay", "ပြည်" },
            { "Kaba Aye", "ကမ္ဘာအေး" },
            { "Anawrahta", "အနော်ရထာ" },
            { "Maha Bandula", "မဟာဗန္ဓုလ" },
            { "Merchant", "ကုန်သည်" },
            { "Strand", "ကမ်းနား" }
        };

        public BusService(AppDbContext context, IMemoryCache cache)
        {
            _context = context;
            _cache = cache;
        }

        public async Task<PagedResult<BusLineDto>> GetBusLinesAsync(BusLineRequest request, CancellationToken cancellationToken = default)
        {
            return await QueryBusLinesInternalAsync(request, ypsOnly: false, cancellationToken);
        }

        public async Task<PagedResult<BusLineDto>> GetYpsBusLinesAsync(BusLineRequest request, CancellationToken cancellationToken = default)
        {
            return await QueryBusLinesInternalAsync(request, ypsOnly: true, cancellationToken);
        }

        private async Task<PagedResult<BusLineDto>> QueryBusLinesInternalAsync(BusLineRequest request, bool ypsOnly, CancellationToken cancellationToken = default)
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

                // Extract township / landmark search terms in English & Myanmar
                var keywords = ExtractSearchTerms(store.Name, store.Address, store.Description);

                var query = _context.TblBusStops.AsNoTracking().AsQueryable();
                var matchedStops = new List<TblBusStop>();

                foreach (var kw in keywords)
                {
                    var term = kw.ToLower();
                    var hits = await query
                        .Where(s => s.StopName.ToLower().Contains(term) || (s.RoadTownship != null && s.RoadTownship.ToLower().Contains(term)))
                        .Take(25)
                        .ToListAsync(cancellationToken);
                    matchedStops.AddRange(hits);
                }

                // Fallback: If direct term matching yielded no results, query by township or city center stops
                if (matchedStops.Count == 0)
                {
                    var fallbackHits = await query.Take(15).ToListAsync(cancellationToken);
                    matchedStops.AddRange(fallbackHits);
                }

                var distinctStops = matchedStops
                    .GroupBy(s => new { s.StopName, s.RoadTownship })
                    .Take(10)
                    .ToList();

                var ypsLines = await _context.TblYpsBusLines
                    .AsNoTracking()
                    .Select(x => x.BusLineNumber)
                    .ToListAsync(cancellationToken);

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
                        if (BilingualDictionary.TryGetValue(clean, out var myVal) && !terms.Contains(myVal))
                        {
                            terms.Add(myVal);
                        }
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
                        if (BilingualDictionary.TryGetValue(clean, out var myVal) && !terms.Contains(myVal))
                        {
                            terms.Add(myVal);
                        }
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
