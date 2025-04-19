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

## Development Guide

### Prerequisites

- .NET 8.0 SDK or higher
- Docker Desktop
- PostgreSQL (via Docker)

### Development Scripts

#### Database Management

```bash
# Option 1: Using Docker Compose (Recommended)
docker-compose up db -d

# Option 2: Using Docker directly
docker run --name tenxcards-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=TenX@2024!SecurePass \
  -e POSTGRES_DB=ten_x_cards_db \
  -p 5432:5432 \
  -d postgres:16-alpine

# Check database status
docker ps
docker logs tenxcards-db

# Stop database
docker-compose stop db
```

#### API Development

1. **Local Development (Recommended for coding)**

   ```bash
   # From API/TenXCards.API directory
   dotnet restore
   dotnet run
   ```

2. **Docker Development**

   ```bash
   # From root directory
   docker-compose up api -d
   docker logs tenxcards-api
   ```

3. **Building and Testing**

   ```bash
   dotnet build
   dotnet test
   dotnet watch run  # Hot reload
   ```

### Connection Strings

1. **Local Development**

   ```json
   "DefaultConnection": "Host=localhost;Port=5432;Database=ten_x_cards_db;Username=postgres;Password=TenX@2024!SecurePass"
   ```

2. **Docker Development**

   ```json
   "DefaultConnection": "Host=db;Port=5432;Database=ten_x_cards_db;Username=postgres;Password=TenX@2024!SecurePass"
   ```

### Port Configuration

- API: 5001 (http://localhost:5001)
- Swagger UI: http://localhost:5001/swagger
- Database: 5432
- Client (Frontend): 3000

### Available Endpoints

- GET /api/test - Test endpoint
- GET /api/health/status - Health check endpoint
- More endpoints coming soon...

### Troubleshooting Guide

1. **Database Connection Issues**

   ```bash
   # Check if database is running
   docker ps
   docker logs tenxcards-db

   # Check connection
   docker exec -it tenxcards-db psql -U postgres -d ten_x_cards_db

   # Verify connection string in appsettings.json
   ```

2. **API Issues**

   ```bash
   # Check API logs
   docker logs tenxcards-api

   # Check port availability
   lsof -i :5001

   # Restart API
   docker-compose restart api
   ```

3. **Common Solutions**
   - Ensure Docker is running
   - Check port conflicts
   - Verify environment variables
   - Check connection strings
   - Ensure database migrations are applied

### Development Best Practices

1. **Code Organization**

   - Follow Clean Architecture principles
   - Keep controllers thin
   - Use services for business logic
   - Implement repository pattern

2. **API Design**

   - Use RESTful conventions
   - Implement proper error handling
   - Include request validation
   - Document with Swagger

3. **Database**
   - Use migrations for schema changes
   - Implement proper indexing
   - Follow naming conventions
   - Use transactions where needed

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

## Next Steps

- [ ] Implement user authentication
- [ ] Set up database migrations
- [ ] Add request validation
- [ ] Implement logging middleware
