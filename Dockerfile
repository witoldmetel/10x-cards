# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /build

# Copy the entire API directory
COPY . .

# Move to API directory and build
WORKDIR /build/API

# Create symbolic link to handle case sensitivity
RUN ln -s TenXCards.Api TenXCards.API

# Debug: Show project directory contents
RUN echo "API project contents:" && \
    ls -la TenXCards.Api/ && \
    echo "\nSymlink check:" && \
    ls -la TenXCards.API/

RUN dotnet restore TenXCards.sln
RUN dotnet build TenXCards.sln -c Release -o /app/build

# Publish
FROM build AS publish
WORKDIR /build/API
RUN dotnet publish TenXCards.sln -c Release -o /app/publish

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