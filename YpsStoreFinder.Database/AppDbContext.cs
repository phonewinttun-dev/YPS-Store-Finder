using Microsoft.EntityFrameworkCore;
using YpsStoreFinder.Database.Models;

namespace YpsStoreFinder.Database
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<TblStore> TblStores { get; set; } = null!;
        public DbSet<TblBusRoute> TblBusRoutes { get; set; } = null!;
        public DbSet<TblBusStop> TblBusStops { get; set; } = null!;
        public DbSet<TblYpsBusLine> TblYpsBusLines { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<TblStore>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.Category).IsRequired();
            });

            modelBuilder.Entity<TblBusRoute>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.BusNumber).IsRequired();
            });

            modelBuilder.Entity<TblBusStop>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.BusNumber).IsRequired();
                entity.Property(e => e.StopName).IsRequired();
            });

            modelBuilder.Entity<TblYpsBusLine>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.BusLineNumber).IsRequired();
            });
        }
    }
}
