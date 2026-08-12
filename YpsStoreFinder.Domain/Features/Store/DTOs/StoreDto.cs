using System.Collections.Generic;
using YpsStoreFinder.Shared;

namespace YpsStoreFinder.Domain.Features.Store.DTOs
{
    public class StoreDto
    {
        public int StoreId { get; set; }
        public int Id { get => StoreId; set => StoreId = value; }
        public string NameMm { get; set; } = string.Empty;
        public string NameEn { get; set; } = string.Empty;
        public string Name => !string.IsNullOrWhiteSpace(NameMm) ? NameMm : NameEn;
        public string Category { get; set; } = string.Empty;
        public int TownshipId { get; set; }
        public string TownshipNameMm { get; set; } = string.Empty;
        public string TownshipNameEn { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double? DistanceKm { get; set; }

        public List<StoreNearestStopDto> NearestStops { get; set; } = new();
        public List<StoreServingBusLineDto> ServingBusLines { get; set; } = new();
    }

    public class StoreNearestStopDto
    {
        public int Id { get; set; }
        public int StoreId { get; set; }
        public string StopNameMm { get; set; } = string.Empty;
        public string StopNameEn { get; set; } = string.Empty;
        public int? MatchedStopId { get; set; }
        public string? RoadMm { get; set; }
        public string? RoadEn { get; set; }
    }

    public class StoreServingBusLineDto
    {
        public int Id { get; set; }
        public int StoreId { get; set; }
        public string BusNumber { get; set; } = string.Empty;
        public int? RouteId { get; set; }
        public bool IsYpsAccepted { get; set; }
    }

    public class StoreSearchRequest : PaginationRequest
    {
        public string? Query { get; set; }
        public string? Category { get; set; }
        public int? TownshipId { get; set; }
    }

    public class NearbyStoreRequest : PaginationRequest
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double MinRadiusKm { get; set; } = 0.3;
        public double RadiusKm { get; set; } = 2.0;
        public string? Category { get; set; }
    }

    public class CategorySummaryDto
    {
        public string Category { get; set; } = string.Empty;
        public int Count { get; set; }
    }
}
