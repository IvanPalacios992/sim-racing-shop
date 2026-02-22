FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files for restore (layer caching)
COPY src/SimRacingShop.Core/SimRacingShop.Core.csproj src/SimRacingShop.Core/
COPY src/SimRacingShop.Infrastructure/SimRacingShop.Infrastructure.csproj src/SimRacingShop.Infrastructure/
COPY src/SimRacingShop.API/SimRacingShop.API.csproj src/SimRacingShop.API/

RUN dotnet restore src/SimRacingShop.API/SimRacingShop.API.csproj

# Copy source and publish
COPY src/ src/
RUN dotnet publish src/SimRacingShop.API/SimRacingShop.API.csproj \
    -c Release -o /app/out --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 8080
ENTRYPOINT ["dotnet", "SimRacingShop.API.dll"]
