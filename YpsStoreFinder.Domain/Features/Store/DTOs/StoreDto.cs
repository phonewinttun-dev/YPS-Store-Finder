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
    }

    public class StoreSearchRequest
    {
        public string? Query { get; set; }
        public string? Category { get; set; }
    }

    public class NearbyStoreRequest
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double RadiusKm { get; set; } = 5.0;
        public string? Category { get; set; }
    }

    public class CategorySummaryDto
    {
        public string Category { get; set; } = string.Empty;
        public int Count { get; set; }
    }
}
