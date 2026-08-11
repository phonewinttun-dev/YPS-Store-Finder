namespace YpsStoreFinder.Database.Models
{
    public class TblBusLine
    {
        public int RouteId { get; set; }
        public string BusNumber { get; set; } = string.Empty;
        public string? OutboundTitleMm { get; set; }
        public string? OutboundTitleEn { get; set; }
        public string? ReturnTitleMm { get; set; }
        public string? ReturnTitleEn { get; set; }
        public bool IsYpsAccepted { get; set; }
    }
}
