namespace YpsStoreFinder.Database.Models
{
    public class TblBusStop
    {
        public int StopId { get; set; }
        public string? NameMm { get; set; }
        public string? NameEn { get; set; }
        public int TownshipId { get; set; }
        public string? RoadMm { get; set; }
        public string? RoadEn { get; set; }
        public int TotalServingBusLines { get; set; }

        public TblTownship? Township { get; set; }
    }
}
