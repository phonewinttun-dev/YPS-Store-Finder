using YpsStoreFinder.Shared;

namespace YpsStoreFinder.Domain.Features.Store.DTOs
{
    public class StoreDto
    {
        public int Id { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string? Address { get; set; }
        public string? Description { get; set; }
        public string? RawAttributes { get; set; }
        public double? DistanceKm { get; set; }
        public List<NearestBusStopDto>? NearestBusStops { get; set; }
    }

    public class NearestBusStopDto
    {
        public string Mm { get; set; } = string.Empty;
        public string En { get; set; } = string.Empty;
    }

    public class StoreSearchRequest : PaginationRequest
    {
        public string? Query { get; set; }
        public string? Category { get; set; }
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
