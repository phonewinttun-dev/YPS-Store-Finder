using System.Collections.Generic;
using YpsStoreFinder.Shared;

namespace YpsStoreFinder.Domain.Features.Bus.DTOs
{
    public class BusLineDto
    {
        public int RouteId { get; set; }
        public string BusNumber { get; set; } = string.Empty;
        public string OutboundTitleMm { get; set; } = string.Empty;
        public string OutboundTitleEn { get; set; } = string.Empty;
        public string ReturnTitleMm { get; set; } = string.Empty;
        public string ReturnTitleEn { get; set; } = string.Empty;
        public bool IsYpsAccepted { get; set; }
        public bool IsYpsSupported { get => IsYpsAccepted; set => IsYpsAccepted = value; }

        public string OutboundTitle => !string.IsNullOrWhiteSpace(OutboundTitleMm) ? OutboundTitleMm : OutboundTitleEn;
        public string ReturnTitle => !string.IsNullOrWhiteSpace(ReturnTitleMm) ? ReturnTitleMm : ReturnTitleEn;
        public int OutboundTotalStops { get; set; }
        public int ReturnTotalStops { get; set; }
    }

    public class BusStopDto
    {
        public int StopId { get; set; }
        public int StopOrder { get; set; }
        public string NameMm { get; set; } = string.Empty;
        public string NameEn { get; set; } = string.Empty;
        public string StopName => !string.IsNullOrWhiteSpace(NameMm) ? NameMm : NameEn;
        public int TownshipId { get; set; }
        public string TownshipNameMm { get; set; } = string.Empty;
        public string TownshipNameEn { get; set; } = string.Empty;
        public string RoadMm { get; set; } = string.Empty;
        public string RoadEn { get; set; } = string.Empty;
        public string? RoadTownship => $"{RoadMm} {TownshipNameMm}".Trim();
        public string StopType { get; set; } = string.Empty;
        public string Direction { get; set; } = string.Empty;
        public int TotalServingBusLines { get; set; }
    }

    public class BusRouteDetailDto
    {
        public int RouteId { get; set; }
        public string BusNumber { get; set; } = string.Empty;
        public bool IsYpsAccepted { get; set; }
        public bool IsYpsSupported { get => IsYpsAccepted; set => IsYpsAccepted = value; }
        public string OutboundTitleMm { get; set; } = string.Empty;
        public string OutboundTitleEn { get; set; } = string.Empty;
        public string OutboundTitle => !string.IsNullOrWhiteSpace(OutboundTitleMm) ? OutboundTitleMm : OutboundTitleEn;
        public List<BusStopDto> OutboundStops { get; set; } = new();
        public string ReturnTitleMm { get; set; } = string.Empty;
        public string ReturnTitleEn { get; set; } = string.Empty;
        public string ReturnTitle => !string.IsNullOrWhiteSpace(ReturnTitleMm) ? ReturnTitleMm : ReturnTitleEn;
        public List<BusStopDto> ReturnStops { get; set; } = new();
    }

    public class BusLineRequest : PaginationRequest
    {
        public string? Keyword { get; set; }
    }

    public class StoreNearbyBusStopsDto
    {
        public int StoreId { get; set; }
        public string StoreNameMm { get; set; } = string.Empty;
        public string StoreNameEn { get; set; } = string.Empty;
        public string StoreName => !string.IsNullOrWhiteSpace(StoreNameMm) ? StoreNameMm : StoreNameEn;
        public string TownshipNameMm { get; set; } = string.Empty;
        public string TownshipNameEn { get; set; } = string.Empty;
        public List<NearbyBusStopItem> NearbyBusStops { get; set; } = new();
    }

    public class NearbyBusStopItem
    {
        public int? StopId { get; set; }
        public string StopNameMm { get; set; } = string.Empty;
        public string StopNameEn { get; set; } = string.Empty;
        public string StopName => !string.IsNullOrWhiteSpace(StopNameMm) ? StopNameMm : StopNameEn;
        public string RoadMm { get; set; } = string.Empty;
        public string RoadEn { get; set; } = string.Empty;
        public string TownshipNameMm { get; set; } = string.Empty;
        public string TownshipNameEn { get; set; } = string.Empty;
        public List<string> ServicingBusNumbers { get; set; } = new();
        public List<string> YpsSupportedBusNumbers { get; set; } = new();
    }
}
