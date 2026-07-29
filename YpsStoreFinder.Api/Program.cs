using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using Scalar.AspNetCore;
using System.Threading.RateLimiting;
using YpsStoreFinder.Database;
using YpsStoreFinder.Domain;

var builder = WebApplication.CreateBuilder(args);

// Add Domain & Database dependencies
builder.AddDomain();

// Add API Controllers & Swagger / Scalar OpenAPI docs
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// Add Memory Cache & Rate Limiting (60 requests / min per IP)
builder.Services.AddMemoryCache();
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("ip-fixed-window", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 60,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 5
            }));
});

// Configure CORS policy for frontend clients
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Seed Database on startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await DataSeeder.SeedAsync(dbContext);
}

// Configure HTTP request pipeline & Scalar OpenAPI UI
app.MapOpenApi();

app.MapScalarApiReference(options =>
{
    options.WithTitle("YpsStoreFinder API Documentation")
           .WithTheme(ScalarTheme.DeepSpace)
           .WithOpenApiRoutePattern("/openapi/{documentName}.json")
           .WithDefaultHttpClient(ScalarTarget.JavaScript, ScalarClient.Fetch);
});

app.UseCors("AllowAll");
app.UseRateLimiter();
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
