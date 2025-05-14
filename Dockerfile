# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files first
COPY ["API/TenXCards.sln", "."]
COPY ["API/TenXCards.API/TenXCards.Api.csproj", "TenXCards.API/"]
COPY ["API/TenXCards.Core/TenXCards.Core.csproj", "TenXCards.Core/"]
COPY ["API/TenXCards.Infrastructure/TenXCards.Infrastructure.csproj", "TenXCards.Infrastructure/"]

RUN dotnet restore
COPY API/ .

WORKDIR "/src/TenXCards.API"
RUN dotnet build "TenXCards.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TenXCards.Api.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Make port configurable via environment variable
ENV PORT=5001
ENV ASPNETCORE_URLS=http://+:${PORT}
EXPOSE ${PORT}

# Add these for production
ENV ASPNETCORE_ENVIRONMENT=Production
ENV TZ=UTC

ENTRYPOINT ["dotnet", "TenXCards.Api.dll"] 