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
docker run --name db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=TenX@2024!SecurePass \
  -e POSTGRES_DB=ten_x_cards_db \
  -p 5432:5432 \
  -d postgres:16-alpine

# Check database status
docker ps
docker logs db

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
   docker logs api
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
   "DefaultConnection": "Host=localhost;Port=5432;Database=ten_x_cards_db;Username=postgres;Password=your-password"
   ```

2. **Docker Development**

   ```json
   "DefaultConnection": "Host=db;Port=5432;Database=ten_x_cards_db;Username=postgres;Password=your-password"
   ```

### Port Configuration

- API: 5001 (http://localhost:5001)
- Swagger UI: http://localhost:5001/swagger
- Database: 5432
- Client (Frontend): 3000

### Available Endpoints

#### Flashcards

- **GET /api/collections/{collectionId}/flashcards** - Get flashcards by collection
  - Requires authentication
  - Supports pagination (`page`, `limit`)
  - Returns paginated response with metadata

- **POST /api/collections/{collectionId}/flashcards** - Create new flashcard in collection
  - Requires authentication
  - Request body: `CreateFlashcardDto`
  - Returns created flashcard
  - Status: 201 Created, 400 Bad Request

- **PUT /api/flashcards/{id}** - Update existing flashcard
  - Requires authentication
  - Request body: `UpdateFlashcardDto`
  - Returns updated flashcard
  - Status: 200 OK, 404 Not Found, 400 Bad Request

- **PUT /api/flashcards/{id}/archive** - Archive flashcard
  - Requires authentication
  - Returns updated flashcard
  - Status: 200 OK, 404 Not Found

- **PUT /api/flashcards/{id}/unarchive** - Unarchive flashcard
  - Requires authentication
  - Returns updated flashcard
  - Status: 200 OK, 404 Not Found

- **DELETE /api/flashcards/{id}** - Delete flashcard permanently
  - Requires authentication
  - Status: 204 No Content, 404 Not Found

- **POST /api/collections/{collectionId}/flashcards/generate** - Generate flashcards using AI
  - Requires authentication
  - Request body: `FlashcardGenerationRequestDto`
  - Returns list of generated flashcards
  - Status: 201 Created, 400 Bad Request

#### Authentication

All endpoints require authentication using JWT Bearer token.

### API Features

1. **Authentication & Authorization**
   - JWT Bearer authentication
   - Required for all endpoints
   - User context management

2. **Security**
   - Rate limiting protection
   - CORS policy configuration
   - Global exception handling
   - Request validation middleware

3. **Flashcard Management**
   - Full CRUD operations
   - Collection-based organization
   - AI-powered flashcard generation
   - Archiving functionality

4. **Response Types**
   - `FlashcardResponseDto` - Standard flashcard response
   - `PaginatedResponse<T>` - Paginated list response
   - `ProblemDetails` - Error response

### Data Models

1. **CreateFlashcardDto**
   ```json
   {
     "front": "string",
     "back": "string",
     "tags": ["string"],
     "categories": ["string"],
     "creationSource": "Manual | AI"
   }
   ```

2. **UpdateFlashcardDto**
   ```json
   {
     "front": "string",
     "back": "string",
     "tags": ["string"],
     "categories": ["string"],
     "reviewStatus": "New | ToCorrect | Approved | Rejected"
   }
   ```

3. **FlashcardGenerationRequestDto**
   ```json
   {
     "content": "string",
     "count": 5,
     "categories": ["string"]
   }
   ```

4. **FlashcardResponseDto**
   ```json
   {
     "id": "uuid",
     "front": "string",
     "back": "string",
     "createdAt": "datetime",
     "updatedAt": "datetime",
     "isArchived": false,
     "archivedAt": "datetime",
     "creationSource": "Manual | AI",
     "reviewStatus": "New | ToCorrect | Approved | Rejected",
     "tags": ["string"],
     "categories": ["string"]
   }
   ```

### Configuration

1. **JWT Settings** (appsettings.json)

   ```json
   {
     "Jwt": {
       "Key": "your-secret-key",
       "Issuer": "your-issuer",
       "Audience": "your-audience"
     }
   }
   ```

2. **CORS Configuration**

   ```json
   {
     "AllowedOrigins": "http://localhost:3000,https://your-production-domain.com"
   }
   ```

3. **Rate Limiting**
   - Default: 5 requests per minute per endpoint
   - Configurable in Program.cs

### Troubleshooting Guide

1. **Database Connection Issues**

   ```bash
   # Check if database is running
   docker ps
   docker logs db

   # Check connection
   docker exec -it db psql -U postgres -d ten_x_cards_db

   # Verify connection string in appsettings.json
   ```

2. **API Issues**

   ```bash
   # Check API logs
   docker logs api

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

### Core Features

1. **Advanced Flashcard Management**
   - Full CRUD operations with pagination and filtering
   - Rich metadata support (tags, categories)
   - Review status tracking (New, ToCorrect, Approved, Rejected)
   - Support for both manual and AI-generated flashcards
   - Batch operations for efficient updates
   - Comprehensive archiving system with statistics
   - SM2 algorithm integration for spaced repetition

2. **Authentication & Authorization**
   - JWT-based authentication
   - Secure password hashing with BCrypt
   - Token-based API key system

3. **Security**
   - Rate limiting protection
   - CORS policy configuration
   - Global exception handling
   - Request validation middleware

4. **Database**
   - PostgreSQL with Entity Framework Core
   - Clean architecture implementation
   - Repository pattern with proper separation of concerns
   - Efficient archiving mechanism
   - Proper entity configurations and relationships

### Data Models

1. **Flashcard**
   ```csharp
   public class Flashcard
   {
       public Guid Id { get; set; }
       public string Front { get; set; }
       public string Back { get; set; }
       public DateTime CreatedAt { get; set; }
       public DateTime? UpdatedAt { get; set; }
       public bool IsArchived { get; set; }
       public DateTime? ArchivedAt { get; set; }
       public FlashcardCreationSource CreationSource { get; set; }
       public ReviewStatus ReviewStatus { get; set; }
       public List<string> Tags { get; set; }
       public List<string> Category { get; set; }
       public int Sm2Repetitions { get; set; }
       public int Sm2Interval { get; set; }
       public double Sm2Efactor { get; set; }
       public DateTime? Sm2DueDate { get; set; }
   }
   ```

2. **FlashcardCreationSource**
   ```csharp
   public enum FlashcardCreationSource
   {
       Manual,
       AI
   }
   ```

3. **ReviewStatus**
   ```csharp
   public enum ReviewStatus
   {
       New,
       ToCorrect,
       Approved,
       Rejected
   }
   ```

4. **Query Parameters**
   ```csharp
   public class FlashcardsQueryParams
   {
       public int Page { get; set; } = 1;
       public int Limit { get; set; } = 20;
       public ReviewStatus? ReviewStatus { get; set; }
       public string searchQuery { get; set; }
       public string Tag { get; set; }
       public string Category { get; set; }
   }
   ```

### Architecture Highlights

1. **Clean Architecture**
   - Core layer contains domain models and interfaces
   - Infrastructure layer implements data access
   - API layer handles HTTP concerns
   - Clear separation between DTOs and domain models

2. **Repository Pattern**
   - Generic repository interfaces
   - Specific implementations for each entity
   - Proper unit of work pattern
   - Transaction management

3. **Service Layer**
   - Business logic encapsulation
   - Mapping between DTOs and domain models
   - Validation and business rules
   - Error handling
