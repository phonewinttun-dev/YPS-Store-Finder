# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj files for layer caching
COPY ["YpsStoreFinder.Api/YpsStoreFinder.Api.csproj", "YpsStoreFinder.Api/"]
COPY ["YpsStoreFinder.Database/YpsStoreFinder.Database.csproj", "YpsStoreFinder.Database/"]
COPY ["YpsStoreFinder.Domain/YpsStoreFinder.Domain.csproj", "YpsStoreFinder.Domain/"]
COPY ["YpsStoreFinder.Shared/YpsStoreFinder.Shared.csproj", "YpsStoreFinder.Shared/"]

RUN dotnet restore "YpsStoreFinder.Api/YpsStoreFinder.Api.csproj"

# Copy remaining source code and publish
COPY . .
WORKDIR "/src/YpsStoreFinder.Api"
RUN dotnet publish "YpsStoreFinder.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Default ASP.NET Core URL binding for Render / Cloud Containers
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "YpsStoreFinder.Api.dll"]
