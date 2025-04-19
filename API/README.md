# TenXCards Backend API

## Project Structure

The solution follows Clean Architecture principles and is divided into three main projects:

### 1. TenXCards.API

- Entry point of the application
- Handles HTTP requests and responses
- Uses Minimal API approach for simple endpoints
- Contains controllers for more complex operations

### 2. TenXCards.Core

- Heart of the application
- Contains:
  - Business logic
  - Domain entities
  - Interfaces
  - Use cases/application services

### 3. TenXCards.Infrastructure

- Implements interfaces from Core
- Handles external concerns like:
  - Database operations
  - External services integration
  - File system operations
  - Email sending, etc.

## Technology Stack

- .NET 8.0+
- PostgreSQL as the database
- Entity Framework Core for ORM
- MediatR for CQRS pattern implementation

## Getting Started

### Prerequisites

- .NET 8.0 SDK or higher
- Docker Desktop
- PostgreSQL (via Docker)

### Running the Application

1. **Start the Database (Option 1 - Docker Compose)**

   ```bash
   # From the root directory
   docker-compose up db -d
   ```

   **Start the Database (Option 2 - Docker)**

   ```bash
   # Run PostgreSQL container directly
   docker run --name tenxcards-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=TenX@2024!SecurePass -e POSTGRES_DB=ten_x_cards_db -p 5432:5432 -d postgres:16-alpine
   ```

2. **Run the API**

   ```bash
   # From the API/TenXCards.API directory
   dotnet restore
   dotnet run
   ```

   The API will be available at:

   - Main API: http://localhost:5001
   - Swagger UI: http://localhost:5001/swagger

### Port Configuration

- API: 5001
- Database: 5432
- Client (Frontend): 3000

### Available Endpoints

- GET /api/test - Test endpoint
- GET /api/health/status - Health check endpoint
- More endpoints coming soon...

### Development Notes

- CORS is configured to allow requests from http://localhost:3000
- Database connection is automatically checked on startup
- Swagger UI is available in development mode

## Project Setup Decisions

### Why Clean Architecture?

- Clear separation of concerns
- Independent of frameworks
- Highly testable
- Dependencies flow inward
- Domain entities at the center

### Why PostgreSQL?

- Open-source and reliable
- Excellent performance
- Rich feature set
- Great community support
- Docker-friendly

## Troubleshooting

1. **Database Connection Issues**

   - Ensure PostgreSQL container is running: `docker ps`
   - Check logs: `docker logs tenxcards-db`
   - Verify connection string in appsettings.json

2. **Port Conflicts**
   - Ensure no other services are using ports 5001 or 5432
   - Check running services: `lsof -i :5001` or `lsof -i :5432`

## Next Steps

- [ ] Implement user authentication
- [ ] Set up database migrations
- [ ] Add request validation
- [ ] Implement logging middleware
