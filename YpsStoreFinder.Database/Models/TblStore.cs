namespace YpsStoreFinder.Database.Models
{
    public class TblStore
    {
        public int Id { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string? Address { get; set; }
        public string? Description { get; set; }
        public string? RawAttributes { get; set; }
    }
}
