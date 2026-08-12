namespace YpsStoreFinder.Database.Models
{
    public class TblYpsStore_NearestStop
    {
        public int Id { get; set; }
        public int StoreId { get; set; }
        public string? StopNameMm { get; set; }
        public string? StopNameEn { get; set; }
        public int? MatchedStopId { get; set; }

        public TblYpsStore? Store { get; set; }
        public TblBusStop? MatchedStop { get; set; }
    }
}
