namespace YpsStoreFinder.Database.Models
{
    public class TblTownship
    {
        public int TownshipId { get; set; }
        public string? TownshipNameMm { get; set; }
        public string? TownshipNameEn { get; set; }
        public bool DeleteFlag { get; set; }
    }
}
