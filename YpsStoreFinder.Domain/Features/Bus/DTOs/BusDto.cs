using System.Collections.Generic;
using YpsStoreFinder.Shared;

namespace YpsStoreFinder.Domain.Features.Bus.DTOs
{
    public class BusLineDto
    {
        public string BusNumber { get; set; } = string.Empty;
        public string RouteId { get; set; } = string.Empty;
        public bool IsYpsSupported { get; set; }
        public string? OutboundTitle { get; set; }
        public int OutboundTotalStops { get; set; }
        public string? ReturnTitle { get; set; }
        public int ReturnTotalStops { get; set; }
    }

    public class BusStopDto
    {
        public int StopOrder { get; set; }
        public string StopName { get; set; } = string.Empty;
        public string? RoadTownship { get; set; }
        public string StopType { get; set; } = string.Empty;
    }

    public class BusRouteDetailDto
    {
        public string BusNumber { get; set; } = string.Empty;
        public string RouteId { get; set; } = string.Empty;
        public bool IsYpsSupported { get; set; }
        public string? OutboundTitle { get; set; }
        public List<BusStopDto> OutboundStops { get; set; } = new();
        public string? ReturnTitle { get; set; }
        public List<BusStopDto> ReturnStops { get; set; } = new();
    }

    public class BusLineRequest : PaginationRequest
    {
        public string? Keyword { get; set; }
    }

    public class StoreNearbyBusStopsDto
    {
        public int StoreId { get; set; }
        public string StoreName { get; set; } = string.Empty;
        public string? Township { get; set; }
        public List<NearbyBusStopItem> NearbyBusStops { get; set; } = new();
    }

    public class NearbyBusStopItem
    {
        public string StopName { get; set; } = string.Empty;
        public string? RoadTownship { get; set; }
        public List<string> ServicingBusNumbers { get; set; } = new();
        public List<string> YpsSupportedBusNumbers { get; set; } = new();
    }
}
