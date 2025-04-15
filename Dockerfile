FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["API/TenXCards.Api/TenXCards.Api.csproj", "API/TenXCards.Api/"]
RUN dotnet restore "API/TenXCards.Api/TenXCards.Api.csproj"
COPY . .
WORKDIR "/src/API/TenXCards.Api"
RUN dotnet build "TenXCards.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TenXCards.Api.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TenXCards.Api.dll"] 