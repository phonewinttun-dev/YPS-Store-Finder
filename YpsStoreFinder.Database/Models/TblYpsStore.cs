using System.Collections.Generic;

namespace YpsStoreFinder.Database.Models
{
    public class TblYpsStore
    {
        public int StoreId { get; set; }
        public string? NameMm { get; set; }
        public string? NameEn { get; set; }
        public string? Category { get; set; }
        public int TownshipId { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public TblTownship? Township { get; set; }
        public ICollection<TblYpsStore_NearestStop> NearestStops { get; set; } = new List<TblYpsStore_NearestStop>();
        public ICollection<TblYpsStore_ServingBusLine> ServingBusLines { get; set; } = new List<TblYpsStore_ServingBusLine>();
    }
}
