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

ENV ASPNETCORE_URLS=http://+:5001
EXPOSE 5001

ENTRYPOINT ["dotnet", "TenXCards.Api.dll"] 