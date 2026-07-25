namespace YpsStoreFinder.Database.Models
{
    public class TblBusStop
    {
        public int Id { get; set; }
        public string BusNumber { get; set; } = string.Empty;
        public string Direction { get; set; } = string.Empty; // "outbound" or "return"
        public int StopOrder { get; set; }
        public string StopName { get; set; } = string.Empty;
        public string? RoadTownship { get; set; }
        public string StopType { get; set; } = string.Empty; // "start", "intermediate", "end"
    }
}
