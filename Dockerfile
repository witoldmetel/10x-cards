# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /build

# Copy the entire API directory
COPY . .

# Debug: Show directory structure
RUN echo "Current directory:" && \
    pwd && \
    echo "\nDirectory contents:" && \
    ls -la && \
    echo "\nAPI directory contents:" && \
    ls -la API/

# Move to API directory and build
WORKDIR /build/API
RUN echo "Current directory:" && \
    pwd && \
    echo "\nDirectory contents:" && \
    ls -la

RUN dotnet restore
RUN dotnet build -c Release -o /app/build

# Publish
FROM build AS publish
WORKDIR /build/API
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