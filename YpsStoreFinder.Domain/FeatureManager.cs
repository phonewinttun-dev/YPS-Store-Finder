using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using YpsStoreFinder.Database;
using YpsStoreFinder.Domain.Features.Store;

namespace YpsStoreFinder.Domain
{
    public static class FeatureManager
    {
        public static IServiceCollection AddDomain(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection") 
                                   ?? "Data Source=yps_finder.db";

            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlite(connectionString));

            services.AddScoped<IStoreService, StoreService>();

            return services;
        }
    }
}
