using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
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

            if (await context.TblStores.AnyAsync())
            {
                return; // Database already populated
            }

            var possiblePaths = new[]
            {
                Path.Combine(AppContext.BaseDirectory, "Data", "yps_store_locations.json"),
                Path.Combine(AppContext.BaseDirectory, "yps_store_locations.json"),
                Path.Combine(Directory.GetCurrentDirectory(), "..", "YpsStoreFinder.Database", "Data", "yps_store_locations.json"),
                Path.Combine(Directory.GetCurrentDirectory(), "Data", "yps_store_locations.json")
            };

            string? jsonFilePath = possiblePaths.FirstOrDefault(File.Exists);

            if (jsonFilePath != null)
            {
                try
                {
                    var jsonContent = await File.ReadAllTextAsync(jsonFilePath);
                    var options = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    };

                    var dataWrapper = JsonSerializer.Deserialize<YpsDataWrapper>(jsonContent, options);

                    if (dataWrapper?.Stores != null && dataWrapper.Stores.Count > 0)
                    {
                        var entityList = dataWrapper.Stores.Select(s => new TblStore
                        {
                            Category = string.IsNullOrWhiteSpace(s.Category) ? "Uncategorized" : s.Category.Trim(),
                            Name = string.IsNullOrWhiteSpace(s.Name) ? "Unknown Store" : s.Name.Trim(),
                            Latitude = s.Latitude,
                            Longitude = s.Longitude,
                            Address = s.Address,
                            Description = s.Description,
                            RawAttributes = s.Attributes.HasValue ? s.Attributes.Value.GetRawText() : null
                        }).ToList();

                        await context.TblStores.AddRangeAsync(entityList);
                        await context.SaveChangesAsync();
                        return;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error reading yps_store_locations.json: {ex.Message}");
                }
            }

            // Fallback seed if JSON file is missing
            var fallbackStores = new List<TblStore>
            {
                new TblStore
                {
                    Name = "Sule City Hall",
                    Category = "YPS Service Kios",
                    Latitude = 16.7759633,
                    Longitude = 96.1587317,
                    Description = "Sr.: 1<br>Lat: 16.7759633<br>Long: 96.1587317"
                },
                new TblStore
                {
                    Name = "Myanmar Plaza",
                    Category = "YPS Service Kios",
                    Latitude = 16.8276283,
                    Longitude = 96.1546083,
                    Description = "Sr.: 3<br>Lat: 16.8276283<br>Long: 96.1546083"
                }
            };

            await context.TblStores.AddRangeAsync(fallbackStores);
            await context.SaveChangesAsync();
        }

        private class YpsDataWrapper
        {
            [JsonPropertyName("stores")]
            public List<YpsStoreJsonItem>? Stores { get; set; }
        }

        private class YpsStoreJsonItem
        {
            [JsonPropertyName("category")]
            public string? Category { get; set; }

            [JsonPropertyName("name")]
            public string? Name { get; set; }

            [JsonPropertyName("latitude")]
            public double Latitude { get; set; }

            [JsonPropertyName("longitude")]
            public double Longitude { get; set; }

            [JsonPropertyName("address")]
            public string? Address { get; set; }

            [JsonPropertyName("description")]
            public string? Description { get; set; }

            [JsonPropertyName("attributes")]
            public JsonElement? Attributes { get; set; }
        }
    }
}
