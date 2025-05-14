# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the entire API directory
COPY API/ API/

WORKDIR "/src/API"
RUN dotnet restore "TenXCards.sln"

WORKDIR "/src/API/TenXCards.API"
RUN dotnet build "TenXCards.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TenXCards.API.csproj" -c Release -o /app/publish

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

ENTRYPOINT ["dotnet", "TenXCards.API.dll"] 