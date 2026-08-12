using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using YpsStoreFinder.Database.Models;

namespace YpsStoreFinder.Database
{
    public static class DataSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            await context.Database.EnsureCreatedAsync();

            await SeedTableAsync<TblTownship>(context, context.TblTownships, "TblTownship.json");
            await SeedTableAsync<TblBusLine>(context, context.TblBusLines, "TblBusLine.json");
            await SeedTableAsync<TblBusStop>(context, context.TblBusStops, "TblBusStop.json");
            await SeedTableAsync<TblRouteStop>(context, context.TblRouteStops, "TblRouteStop.json");
            await SeedTableAsync<TblYpsStore>(context, context.TblYpsStores, "TblYpsStore.json");
            await SeedTableAsync<TblYpsStore_NearestStop>(context, context.TblYpsStore_NearestStops, "TblYpsStore_NearestStop.json");
            await SeedTableAsync<TblYpsStore_ServingBusLine>(context, context.TblYpsStore_ServingBusLines, "TblYpsStore_ServingBusLine.json");
        }

        private static async Task SeedTableAsync<TEntity>(AppDbContext context, DbSet<TEntity> dbSet, string jsonFileName) where TEntity : class
        {
            if (await dbSet.AnyAsync()) return;

            string? jsonFilePath = FindJsonFilePath(jsonFileName);
            if (jsonFilePath == null)
            {
                Console.WriteLine($"[DataSeeder Error] Seed file not found: {jsonFileName}");
                return;
            }

            try
            {
                var jsonContent = await File.ReadAllTextAsync(jsonFilePath);
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var items = JsonSerializer.Deserialize<List<TEntity>>(jsonContent, options);
                if (items != null && items.Count > 0)
                {
                    await dbSet.AddRangeAsync(items);
                    await context.SaveChangesAsync();
                    Console.WriteLine($"[DataSeeder Success] Seeded {items.Count} records into {typeof(TEntity).Name} from {jsonFileName}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DataSeeder Error] Failed to seed {typeof(TEntity).Name} from {jsonFileName}: {ex.Message}");
            }
        }

        private static string? FindJsonFilePath(string filename)
        {
            var possiblePaths = new[]
            {
                Path.Combine(AppContext.BaseDirectory, "Data", filename),
                Path.Combine(AppContext.BaseDirectory, filename),
                Path.Combine(Directory.GetCurrentDirectory(), "Data", filename),
                Path.Combine(Directory.GetCurrentDirectory(), "YpsStoreFinder.Database", "Data", filename),
                Path.Combine(Directory.GetCurrentDirectory(), "..", "YpsStoreFinder.Database", "Data", filename),
                Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "YpsStoreFinder.Database", "Data", filename)
            };

            var foundPath = possiblePaths.FirstOrDefault(File.Exists);
            if (foundPath == null)
            {
                Console.WriteLine($"[DataSeeder Warning] Could not locate seed JSON file: {filename}. Checked locations: {string.Join(", ", possiblePaths)}");
            }
            return foundPath;
        }
    }
}
