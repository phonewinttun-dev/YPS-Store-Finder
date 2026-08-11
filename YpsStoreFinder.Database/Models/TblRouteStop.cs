namespace YpsStoreFinder.Database.Models
{
    public class TblRouteStop
    {
        public int Id { get; set; }
        public int RouteId { get; set; }
        public int StopId { get; set; }
        public string? Direction { get; set; }
        public int StopOrder { get; set; }
        public string? StopType { get; set; }

        public TblBusLine? BusLine { get; set; }
        public TblBusStop? BusStop { get; set; }
    }
}
