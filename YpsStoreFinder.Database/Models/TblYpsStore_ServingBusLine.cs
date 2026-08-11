namespace YpsStoreFinder.Database.Models
{
    public class TblYpsStore_ServingBusLine
    {
        public int Id { get; set; }
        public int StoreId { get; set; }
        public string BusNumber { get; set; } = string.Empty;
        public int? RouteId { get; set; }

        public TblYpsStore? Store { get; set; }
        public TblBusLine? BusLine { get; set; }
    }
}
