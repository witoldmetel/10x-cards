FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["API/TenXCards.API/TenXCards.API.csproj", "API/TenXCards.API/"]
COPY ["API/TenXCards.Core/TenXCards.Core.csproj", "API/TenXCards.Core/"]
COPY ["API/TenXCards.Infrastructure/TenXCards.Infrastructure.csproj", "API/TenXCards.Infrastructure/"]
COPY ["API/TenXCards.sln", "API/"]
RUN dotnet restore "API/TenXCards.API/TenXCards.API.csproj"
COPY . .
WORKDIR "/src/API/TenXCards.API"
RUN dotnet build "TenXCards.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TenXCards.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

ENV ASPNETCORE_URLS=http://+:5001
EXPOSE 5001

ENTRYPOINT ["dotnet", "TenXCards.API.dll"] 