# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy everything at first to ensure all files are available
COPY . .

# Restore dependencies
WORKDIR /app/API
RUN dotnet restore ./TenXCards.API/TenXCards.Api.csproj

# Build
RUN dotnet build ./TenXCards.API/TenXCards.Api.csproj -c Release -o /app/build

# Publish
FROM build AS publish
WORKDIR /app/API
RUN dotnet publish ./TenXCards.API/TenXCards.Api.csproj -c Release -o /app/publish

# Final stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Make port configurable via environment variable
ENV PORT=5001
ENV ASPNETCORE_URLS=http://+:${PORT}
EXPOSE ${PORT}

# Add these for production
ENV ASPNETCORE_ENVIRONMENT=${ASPNETCORE_ENVIRONMENT:-Production}
ENV TZ=UTC

ENTRYPOINT ["dotnet", "TenXCards.Api.dll"] 