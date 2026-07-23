using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using YpsStoreFinder.Database;
using YpsStoreFinder.Database.Models;
using YpsStoreFinder.Domain.Features.Store.DTOs;
using YpsStoreFinder.Shared;

namespace YpsStoreFinder.Domain.Features.Store
{
    public class StoreService : IStoreService
    {
        private readonly AppDbContext _context;

        public StoreService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Result<List<StoreDto>>> GetStoresAsync(string? category = null)
        {
            try
            {
                var query = _context.TblStores.AsNoTracking().AsQueryable();

                if (!string.IsNullOrWhiteSpace(category))
                {
                    var catLower = category.Trim().ToLower();
                    query = query.Where(s => s.Category.ToLower() == catLower);
                }

                var stores = await query.ToListAsync();
                var dtos = stores.Select(MapToDto).ToList();

                return Result<List<StoreDto>>.Success(dtos);
            }
            catch (Exception ex)
            {
                return Result<List<StoreDto>>.Failure($"Failed to retrieve stores: {ex.Message}");
            }
        }

        public async Task<Result<List<StoreDto>>> SearchStoresAsync(StoreSearchRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Query) && string.IsNullOrWhiteSpace(request.Category))
                {
                    return await GetStoresAsync();
                }

                var query = _context.TblStores.AsNoTracking().AsQueryable();

                if (!string.IsNullOrWhiteSpace(request.Category))
                {
                    var catLower = request.Category.Trim().ToLower();
                    query = query.Where(s => s.Category.ToLower() == catLower);
                }

                if (!string.IsNullOrWhiteSpace(request.Query))
                {
                    var term = request.Query.Trim().ToLower();
                    query = query.Where(s => s.Name.ToLower().Contains(term) ||
                                             (s.Address != null && s.Address.ToLower().Contains(term)) ||
                                             (s.Description != null && s.Description.ToLower().Contains(term)));
                }

                var stores = await query.ToListAsync();
                var dtos = stores.Select(MapToDto).ToList();

                return Result<List<StoreDto>>.Success(dtos);
            }
            catch (Exception ex)
            {
                return Result<List<StoreDto>>.Failure($"Search failed: {ex.Message}");
            }
        }

        public async Task<Result<StoreDto>> GetStoreByIdAsync(int id)
        {
            try
            {
                var store = await _context.TblStores.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id);
                if (store == null)
                {
                    return Result<StoreDto>.Failure($"Store with ID {id} was not found.");
                }

                return Result<StoreDto>.Success(MapToDto(store));
            }
            catch (Exception ex)
            {
                return Result<StoreDto>.Failure($"Error retrieving store: {ex.Message}");
            }
        }

        public async Task<Result<List<CategorySummaryDto>>> GetCategoriesSummaryAsync()
        {
            try
            {
                var summary = await _context.TblStores
                    .AsNoTracking()
                    .GroupBy(s => s.Category)
                    .Select(g => new CategorySummaryDto
                    {
                        Category = g.Key,
                        Count = g.Count()
                    })
                    .OrderByDescending(c => c.Count)
                    .ToListAsync();

                return Result<List<CategorySummaryDto>>.Success(summary);
            }
            catch (Exception ex)
            {
                return Result<List<CategorySummaryDto>>.Failure($"Failed to calculate categories summary: {ex.Message}");
            }
        }

        public async Task<Result<List<StoreDto>>> GetNearbyStoresAsync(NearbyStoreRequest request)
        {
            try
            {
                var query = _context.TblStores.AsNoTracking().AsQueryable();

                if (!string.IsNullOrWhiteSpace(request.Category))
                {
                    var catLower = request.Category.Trim().ToLower();
                    query = query.Where(s => s.Category.ToLower() == catLower);
                }

                var allStores = await query.ToListAsync();

                var nearbyStores = allStores
                    .Select(s =>
                    {
                        var dto = MapToDto(s);
                        dto.DistanceKm = Math.Round(CalculateHaversineDistance(request.Latitude, request.Longitude, s.Latitude, s.Longitude), 2);
                        return dto;
                    })
                    .Where(dto => dto.DistanceKm <= request.RadiusKm)
                    .OrderBy(dto => dto.DistanceKm)
                    .ToList();

                return Result<List<StoreDto>>.Success(nearbyStores);
            }
            catch (Exception ex)
            {
                return Result<List<StoreDto>>.Failure($"Geo-spatial calculation failed: {ex.Message}");
            }
        }

        private static StoreDto MapToDto(TblStore entity)
        {
            return new StoreDto
            {
                Id = entity.Id,
                Category = entity.Category,
                Name = entity.Name,
                Latitude = entity.Latitude,
                Longitude = entity.Longitude,
                Address = entity.Address,
                Description = entity.Description,
                RawAttributes = entity.RawAttributes
            };
        }

        private static double CalculateHaversineDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371.0; // Earth mean radius in kilometers

            var dLat = ToRadians(lat2 - lat1);
            var dLon = ToRadians(lon2 - lon1);

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            return R * c;
        }

        private static double ToRadians(double degrees)
        {
            return degrees * (Math.PI / 180.0);
        }
    }
}
