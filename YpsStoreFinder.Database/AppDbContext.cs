using Microsoft.EntityFrameworkCore;
using YpsStoreFinder.Database.Models;

namespace YpsStoreFinder.Database
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<TblTownship> TblTownships { get; set; } = null!;
        public DbSet<TblBusLine> TblBusLines { get; set; } = null!;
        public DbSet<TblBusStop> TblBusStops { get; set; } = null!;
        public DbSet<TblRouteStop> TblRouteStops { get; set; } = null!;
        public DbSet<TblYpsStore> TblYpsStores { get; set; } = null!;
        public DbSet<TblYpsStore_NearestStop> TblYpsStore_NearestStops { get; set; } = null!;
        public DbSet<TblYpsStore_ServingBusLine> TblYpsStore_ServingBusLines { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<TblTownship>(entity =>
            {
                entity.ToTable("TblTownship");
                entity.HasKey(e => e.TownshipId);
                entity.Property(e => e.TownshipId).ValueGeneratedNever();
            });

            modelBuilder.Entity<TblBusLine>(entity =>
            {
                entity.ToTable("TblBusLine");
                entity.HasKey(e => e.RouteId);
                entity.Property(e => e.RouteId).ValueGeneratedNever();
            });

            modelBuilder.Entity<TblBusStop>(entity =>
            {
                entity.ToTable("TblBusStop");
                entity.HasKey(e => e.StopId);
                entity.Property(e => e.StopId).ValueGeneratedNever();

                entity.HasOne(e => e.Township)
                      .WithMany()
                      .HasForeignKey(e => e.TownshipId)
                      .IsRequired(false)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<TblRouteStop>(entity =>
            {
                entity.ToTable("TblRouteStop");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedNever();

                entity.HasOne(e => e.BusLine)
                      .WithMany()
                      .HasForeignKey(e => e.RouteId)
                      .IsRequired(false)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.BusStop)
                      .WithMany()
                      .HasForeignKey(e => e.StopId)
                      .IsRequired(false)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<TblYpsStore>(entity =>
            {
                entity.ToTable("TblYpsStore");
                entity.HasKey(e => e.StoreId);
                entity.Property(e => e.StoreId).ValueGeneratedNever();

                entity.HasOne(e => e.Township)
                      .WithMany()
                      .HasForeignKey(e => e.TownshipId)
                      .IsRequired(false)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<TblYpsStore_NearestStop>(entity =>
            {
                entity.ToTable("TblYpsStore_NearestStop");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedNever();

                entity.HasOne(e => e.Store)
                      .WithMany(s => s.NearestStops)
                      .HasForeignKey(e => e.StoreId)
                      .IsRequired(false)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.MatchedStop)
                      .WithMany()
                      .HasForeignKey(e => e.MatchedStopId)
                      .IsRequired(false)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<TblYpsStore_ServingBusLine>(entity =>
            {
                entity.ToTable("TblYpsStore_ServingBusLine");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedNever();

                entity.HasOne(e => e.Store)
                      .WithMany(s => s.ServingBusLines)
                      .HasForeignKey(e => e.StoreId)
                      .IsRequired(false)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.BusLine)
                      .WithMany()
                      .HasForeignKey(e => e.RouteId)
                      .IsRequired(false)
                      .OnDelete(DeleteBehavior.SetNull);
            });
        }
    }
}
