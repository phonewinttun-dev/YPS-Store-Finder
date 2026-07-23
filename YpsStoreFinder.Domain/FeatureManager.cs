using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using YpsStoreFinder.Database;
using YpsStoreFinder.Domain.Features.Store;

namespace YpsStoreFinder.Domain
{
    public static class FeatureManager
    {
        public static void AddDomain(this WebApplicationBuilder builder)
        {
            // Database
            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") 
                                   ?? "Data Source=yps_finder.db"));

            // Feature Services
            builder.Services.AddScoped<IStoreService, StoreService>();
        }
    }
}
