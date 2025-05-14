# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /API

# Copy solution and project files
COPY API/TenXCards.sln .
COPY TenXCards.API/TenXCards.Api.csproj TenXCards.API/
COPY API/TenXCards.Core/TenXCards.Core.csproj TenXCards.Core/
COPY API/TenXCards.Infrastructure/TenXCards.Infrastructure.csproj TenXCards.Infrastructure/

# Restore dependencies
RUN dotnet restore

# Copy the rest of the files
COPY API/ .

# Build
RUN dotnet build -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

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