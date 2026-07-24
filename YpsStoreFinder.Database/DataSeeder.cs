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

            await SeedStoresAsync(context);
            var ypsBusLineNumbers = await SeedYpsBusLinesAsync(context);
            await SeedBusRoutesAsync(context, ypsBusLineNumbers);
        }

        private static async Task SeedStoresAsync(AppDbContext context)
        {
            if (await context.TblStores.AnyAsync()) return;

            string? jsonFilePath = FindJsonFilePath("yps_store_locations.json");
            if (jsonFilePath != null)
            {
                try
                {
                    var jsonContent = await File.ReadAllTextAsync(jsonFilePath);
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
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
                    Console.WriteLine($"Error seeding stores: {ex.Message}");
                }
            }

            var fallbackStores = new List<TblStore>
            {
                new TblStore { Name = "Sule City Hall", Category = "YPS Service Kios", Latitude = 16.7759633, Longitude = 96.1587317 },
                new TblStore { Name = "Myanmar Plaza", Category = "YPS Service Kios", Latitude = 16.8276283, Longitude = 96.1546083 }
            };
            await context.TblStores.AddRangeAsync(fallbackStores);
            await context.SaveChangesAsync();
        }

        private static async Task<HashSet<string>> SeedYpsBusLinesAsync(AppDbContext context)
        {
            var ypsSet = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            string? jsonFilePath = FindJsonFilePath("yps_ybs_bus_lines.json");
            if (jsonFilePath != null)
            {
                try
                {
                    var jsonContent = await File.ReadAllTextAsync(jsonFilePath);
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    var ypsData = JsonSerializer.Deserialize<YpsBusLinesJsonWrapper>(jsonContent, options);

                    if (ypsData?.BusLines != null && ypsData.BusLines.Count > 0)
                    {
                        foreach (var num in ypsData.BusLines)
                        {
                            ypsSet.Add(num.ToString());
                        }

                        if (!await context.TblYpsBusLines.AnyAsync())
                        {
                            var entities = ypsSet.Select(num => new TblYpsBusLine
                            {
                                BusLineNumber = num,
                                IsYpsSupported = true
                            }).ToList();

                            await context.TblYpsBusLines.AddRangeAsync(entities);
                            await context.SaveChangesAsync();
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error seeding YPS bus lines: {ex.Message}");
                }
            }

            if (ypsSet.Count == 0 && await context.TblYpsBusLines.AnyAsync())
            {
                var existing = await context.TblYpsBusLines.Select(x => x.BusLineNumber).ToListAsync();
                foreach (var e in existing) ypsSet.Add(e);
            }

            return ypsSet;
        }

        private static async Task SeedBusRoutesAsync(AppDbContext context, HashSet<string> ypsBusLines)
        {
            if (await context.TblBusRoutes.AnyAsync()) return;

            string? jsonFilePath = FindJsonFilePath("bus_routes.json");
            if (jsonFilePath != null)
            {
                try
                {
                    var jsonContent = await File.ReadAllTextAsync(jsonFilePath);
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    var rawRoutes = JsonSerializer.Deserialize<List<BusRouteRawItem>>(jsonContent, options);

                    if (rawRoutes != null && rawRoutes.Count > 0)
                    {
                        var routeEntities = new List<TblBusRoute>();
                        var stopEntities = new List<TblBusStop>();

                        foreach (var raw in rawRoutes)
                        {
                            string busNum = raw.BusNumber ?? string.Empty;
                            bool isYps = ypsBusLines.Contains(busNum);

                            var route = new TblBusRoute
                            {
                                BusNumber = busNum,
                                RouteId = raw.RouteId ?? string.Empty,
                                OutboundTitle = raw.Outbound?.Title,
                                OutboundTotalStops = raw.Outbound?.TotalStops ?? (raw.Outbound?.Stops?.Count ?? 0),
                                ReturnTitle = raw.Return?.Title,
                                ReturnTotalStops = raw.Return?.TotalStops ?? (raw.Return?.Stops?.Count ?? 0),
                                OutboundStopsJson = raw.Outbound?.Stops != null ? JsonSerializer.Serialize(raw.Outbound.Stops) : null,
                                ReturnStopsJson = raw.Return?.Stops != null ? JsonSerializer.Serialize(raw.Return.Stops) : null,
                                IsYpsSupported = isYps
                            };

                            routeEntities.Add(route);

                            if (raw.Outbound?.Stops != null)
                            {
                                foreach (var s in raw.Outbound.Stops)
                                {
                                    stopEntities.Add(new TblBusStop
                                    {
                                        BusNumber = busNum,
                                        Direction = "outbound",
                                        StopOrder = s.StopOrder,
                                        StopName = s.StopName ?? string.Empty,
                                        RoadTownship = s.RoadTownship,
                                        StopType = s.StopType ?? "intermediate"
                                    });
                                }
                            }

                            if (raw.Return?.Stops != null)
                            {
                                foreach (var s in raw.Return.Stops)
                                {
                                    stopEntities.Add(new TblBusStop
                                    {
                                        BusNumber = busNum,
                                        Direction = "return",
                                        StopOrder = s.StopOrder,
                                        StopName = s.StopName ?? string.Empty,
                                        RoadTownship = s.RoadTownship,
                                        StopType = s.StopType ?? "intermediate"
                                    });
                                }
                            }
                        }

                        await context.TblBusRoutes.AddRangeAsync(routeEntities);
                        await context.TblBusStops.AddRangeAsync(stopEntities);
                        await context.SaveChangesAsync();
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error seeding bus routes: {ex.Message}");
                }
            }
        }

        private static string? FindJsonFilePath(string filename)
        {
            var possiblePaths = new[]
            {
                Path.Combine(AppContext.BaseDirectory, "Data", filename),
                Path.Combine(AppContext.BaseDirectory, filename),
                Path.Combine(Directory.GetCurrentDirectory(), "..", "YpsStoreFinder.Database", "Data", filename),
                Path.Combine(Directory.GetCurrentDirectory(), "Data", filename),
                Path.Combine(Directory.GetCurrentDirectory(), "YpsStoreFinder.Database", "Data", filename)
            };

            return possiblePaths.FirstOrDefault(File.Exists);
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

        private class YpsBusLinesJsonWrapper
        {
            [JsonPropertyName("bus_lines")]
            public List<JsonElement>? BusLines { get; set; }
        }

        private class BusRouteRawItem
        {
            [JsonPropertyName("bus_number")]
            public string? BusNumber { get; set; }

            [JsonPropertyName("route_id")]
            public string? RouteId { get; set; }

            [JsonPropertyName("outbound")]
            public BusRouteDirectionRaw? Outbound { get; set; }

            [JsonPropertyName("return")]
            public BusRouteDirectionRaw? Return { get; set; }
        }

        private class BusRouteDirectionRaw
        {
            [JsonPropertyName("title")]
            public string? Title { get; set; }

            [JsonPropertyName("total_stops")]
            public int TotalStops { get; set; }

            [JsonPropertyName("stops")]
            public List<BusStopRaw>? Stops { get; set; }
        }

        private class BusStopRaw
        {
            [JsonPropertyName("stop_order")]
            public int StopOrder { get; set; }

            [JsonPropertyName("stop_name")]
            public string? StopName { get; set; }

            [JsonPropertyName("road_township")]
            public string? RoadTownship { get; set; }

            [JsonPropertyName("stop_type")]
            public string? StopType { get; set; }
        }
    }
}
