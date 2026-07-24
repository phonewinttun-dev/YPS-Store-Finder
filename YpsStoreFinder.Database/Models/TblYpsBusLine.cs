namespace YpsStoreFinder.Database.Models
{
    public class TblYpsBusLine
    {
        public int Id { get; set; }
        public string BusLineNumber { get; set; } = string.Empty;
        public bool IsYpsSupported { get; set; } = true;
    }
}
