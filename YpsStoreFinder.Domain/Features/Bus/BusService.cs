using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using YpsStoreFinder.Database;
using YpsStoreFinder.Database.Models;
using YpsStoreFinder.Domain.Features.Bus.DTOs;
using YpsStoreFinder.Domain.Features.Store.DTOs;
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

        public async Task<Result<List<BusLineDto>>> GetBusLinesAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                var cacheKey = "bus_lines_all";
                var busLines = await _cache.GetOrCreateAsync(cacheKey, async entry =>
                {
                    entry.SetAbsoluteExpiration(TimeSpan.FromHours(24));
                    entry.SetPriority(CacheItemPriority.High);
                    var dbEntities = await _context.TblBusLines.AsNoTracking()
                        .OrderBy(b => b.BusNumber.Length)
                        .ThenBy(b => b.BusNumber)
                        .ToListAsync(cancellationToken);
                    return dbEntities.Select(b => MapToLineDto(b)).ToList();
                });
                return Result<List<BusLineDto>>.Success(busLines ?? new List<BusLineDto>());
            }
            catch (Exception ex)
            {
                return Result<List<BusLineDto>>.Failure($"Failed to retrieve bus lines: {ex.Message}");
            }
        }

        public async Task<PagedResult<BusLineDto>> GetYpsBusLinesAsync(PaginationRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                var pageNumber = request.PageNumber < 1 ? 1 : request.PageNumber;
                var pageSize = request.PageSize < 1 ? 10 : request.PageSize;

                var query = _context.TblBusLines.AsNoTracking()
                    .Where(r => r.IsYpsAccepted)
                    .AsQueryable();

                var totalCount = await query.CountAsync(cancellationToken);
                var items = await query
                    .OrderBy(r => r.RouteId)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .Select(r => MapToLineDto(r))
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

                var query = _context.TblBusLines.AsNoTracking().AsQueryable();

                if (!string.IsNullOrWhiteSpace(request.Keyword))
                {
                    var term = request.Keyword.Trim().ToLower();
                    query = query.Where(r => (r.BusNumber != null && r.BusNumber.ToLower().Contains(term)) ||
                                             (r.OutboundTitleMm != null && r.OutboundTitleMm.ToLower().Contains(term)) ||
                                             (r.OutboundTitleEn != null && r.OutboundTitleEn.ToLower().Contains(term)) ||
                                             (r.ReturnTitleMm != null && r.ReturnTitleMm.ToLower().Contains(term)) ||
                                             (r.ReturnTitleEn != null && r.ReturnTitleEn.ToLower().Contains(term)));
                }

                var totalCount = await query.CountAsync(cancellationToken);
                var items = await query
                    .OrderBy(r => r.RouteId)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .Select(r => MapToLineDto(r))
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

                TblBusLine? busLine = null;
                if (int.TryParse(cleanNum, out var parsedRouteId))
                {
                    busLine = await _context.TblBusLines.AsNoTracking()
                        .FirstOrDefaultAsync(r => r.RouteId == parsedRouteId || (r.BusNumber != null && r.BusNumber.ToLower() == cleanNum.ToLower()), cancellationToken);
                }
                else
                {
                    busLine = await _context.TblBusLines.AsNoTracking()
                        .FirstOrDefaultAsync(r => r.BusNumber != null && r.BusNumber.ToLower() == cleanNum.ToLower(), cancellationToken);
                }

                if (busLine == null)
                {
                    return Result<BusRouteDetailDto>.Failure($"Bus line '{busNumber}' was not found.");
                }

                var routeStops = await _context.TblRouteStops
                    .AsNoTracking()
                    .Where(rs => rs.RouteId == busLine.RouteId)
                    .Include(rs => rs.BusStop)
                        .ThenInclude(bs => bs!.Township)
                    .OrderBy(rs => rs.Direction)
                    .ThenBy(rs => rs.StopOrder)
                    .ToListAsync(cancellationToken);

                var outboundStops = routeStops
                    .Where(rs => rs.Direction != null && rs.Direction.Equals("outbound", StringComparison.OrdinalIgnoreCase))
                    .Select(rs => MapToStopDto(rs))
                    .ToList();

                var returnStops = routeStops
                    .Where(rs => rs.Direction != null && rs.Direction.Equals("return", StringComparison.OrdinalIgnoreCase))
                    .Select(rs => MapToStopDto(rs))
                    .ToList();

                var dto = new BusRouteDetailDto
                {
                    RouteId = busLine.RouteId,
                    BusNumber = busLine.BusNumber ?? string.Empty,
                    IsYpsAccepted = busLine.IsYpsAccepted,
                    OutboundTitleMm = busLine.OutboundTitleMm ?? string.Empty,
                    OutboundTitleEn = busLine.OutboundTitleEn ?? string.Empty,
                    OutboundStops = outboundStops,
                    ReturnTitleMm = busLine.ReturnTitleMm ?? string.Empty,
                    ReturnTitleEn = busLine.ReturnTitleEn ?? string.Empty,
                    ReturnStops = returnStops
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
                var store = await _context.TblYpsStores
                    .AsNoTracking()
                    .Include(s => s.Township)
                    .Include(s => s.NearestStops)
                        .ThenInclude(ns => ns.MatchedStop)
                            .ThenInclude(ms => ms!.Township)
                    .Include(s => s.ServingBusLines)
                        .ThenInclude(sb => sb.BusLine)
                    .FirstOrDefaultAsync(s => s.StoreId == storeId, cancellationToken);

                if (store == null)
                {
                    return Result<StoreNearbyBusStopsDto>.Failure($"Store with ID {storeId} was not found.");
                }

                var servicingBuses = store.ServingBusLines?.Where(sb => sb.BusNumber != null).Select(sb => sb.BusNumber!).Distinct().OrderBy(b => b.Length).ThenBy(b => b).ToList() ?? new List<string>();
                var ypsSupportedBuses = store.ServingBusLines?.Where(sb => sb.BusNumber != null && sb.BusLine?.IsYpsAccepted == true).Select(sb => sb.BusNumber!).Distinct().OrderBy(b => b.Length).ThenBy(b => b).ToList() ?? new List<string>();

                var nearbyStops = new List<NearbyBusStopItem>();

                if (store.NearestStops != null && store.NearestStops.Count > 0)
                {
                    foreach (var ns in store.NearestStops)
                    {
                        nearbyStops.Add(new NearbyBusStopItem
                        {
                            StopId = ns.MatchedStopId,
                            StopNameMm = ns.StopNameMm ?? string.Empty,
                            StopNameEn = ns.StopNameEn ?? string.Empty,
                            RoadMm = ns.MatchedStop?.RoadMm ?? string.Empty,
                            RoadEn = ns.MatchedStop?.RoadEn ?? string.Empty,
                            TownshipNameMm = ns.MatchedStop?.Township?.TownshipNameMm ?? store.Township?.TownshipNameMm ?? string.Empty,
                            TownshipNameEn = ns.MatchedStop?.Township?.TownshipNameEn ?? store.Township?.TownshipNameEn ?? string.Empty,
                            ServicingBusNumbers = servicingBuses,
                            YpsSupportedBusNumbers = ypsSupportedBuses
                        });
                    }
                }

                var resultDto = new StoreNearbyBusStopsDto
                {
                    StoreId = store.StoreId,
                    StoreNameMm = store.NameMm ?? string.Empty,
                    StoreNameEn = store.NameEn ?? string.Empty,
                    TownshipNameMm = store.Township?.TownshipNameMm ?? string.Empty,
                    TownshipNameEn = store.Township?.TownshipNameEn ?? string.Empty,
                    NearbyBusStops = nearbyStops
                };

                return Result<StoreNearbyBusStopsDto>.Success(resultDto);
            }
            catch (Exception ex)
            {
                return Result<StoreNearbyBusStopsDto>.Failure($"Failed to calculate nearby bus stops: {ex.Message}");
            }
        }

        private static BusLineDto MapToLineDto(TblBusLine entity)
        {
            return new BusLineDto
            {
                RouteId = entity.RouteId,
                BusNumber = entity.BusNumber ?? string.Empty,
                OutboundTitleMm = entity.OutboundTitleMm ?? string.Empty,
                OutboundTitleEn = entity.OutboundTitleEn ?? string.Empty,
                ReturnTitleMm = entity.ReturnTitleMm ?? string.Empty,
                ReturnTitleEn = entity.ReturnTitleEn ?? string.Empty,
                IsYpsAccepted = entity.IsYpsAccepted
            };
        }

        private static BusStopDto MapToStopDto(TblRouteStop rs)
        {
            var stop = rs.BusStop;
            return new BusStopDto
            {
                StopId = rs.StopId,
                StopOrder = rs.StopOrder,
                NameMm = stop?.NameMm ?? string.Empty,
                NameEn = stop?.NameEn ?? string.Empty,
                TownshipId = stop?.TownshipId ?? 0,
                TownshipNameMm = stop?.Township?.TownshipNameMm ?? string.Empty,
                TownshipNameEn = stop?.Township?.TownshipNameEn ?? string.Empty,
                RoadMm = stop?.RoadMm ?? string.Empty,
                RoadEn = stop?.RoadEn ?? string.Empty,
                StopType = rs.StopType ?? string.Empty,
                Direction = rs.Direction ?? string.Empty,
                TotalServingBusLines = stop?.TotalServingBusLines ?? 0
            };
        }
    }
}
