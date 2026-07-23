using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using YpsStoreFinder.Database;
using YpsStoreFinder.Domain;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Domain & Database dependencies
builder.Services.AddDomain(builder.Configuration);

// 2. Add API Controllers & Swagger / Scalar OpenAPI docs
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


// 3. Configure CORS policy for frontend clients
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

// 4. Seed Database on startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await DataSeeder.SeedAsync(dbContext);
}

// 5. Configure HTTP request pipeline & Scalar OpenAPI UI
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.MapScalarApiReference(options =>
    {
        options.WithTitle("YpsStoreFinder API Documentation")
               .WithTheme(ScalarTheme.DeepSpace)
               .WithOpenApiRoutePattern("/swagger/v1/swagger.json")
               .WithDefaultHttpClient(ScalarTarget.JavaScript, ScalarClient.Fetch);
    });
}

app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
