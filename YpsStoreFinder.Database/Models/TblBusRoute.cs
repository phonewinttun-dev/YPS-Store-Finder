namespace YpsStoreFinder.Database.Models
{
    public class TblBusRoute
    {
        public int Id { get; set; }
        public string BusNumber { get; set; } = string.Empty;
        public string RouteId { get; set; } = string.Empty;
        public string? OutboundTitle { get; set; }
        public int OutboundTotalStops { get; set; }
        public string? ReturnTitle { get; set; }
        public int ReturnTotalStops { get; set; }
        public string? OutboundStopsJson { get; set; }
        public string? ReturnStopsJson { get; set; }
        public bool IsYpsSupported { get; set; }
    }
}
