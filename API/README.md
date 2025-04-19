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

## Project Setup Decisions

### Why Minimal APIs?

- Reduced boilerplate code
- Perfect for simple CRUD operations
- Better performance due to reduced overhead
- Modern approach recommended for .NET 8+

### Why Clean Architecture?

- Clear separation of concerns
- Independent of frameworks
- Highly testable
- Dependencies flow inward
- Domain entities at the center

## Getting Started

1. Prerequisites

   - .NET 8.0 SDK or higher
   - PostgreSQL database

2. Database Setup

   - Connection string configuration in appsettings.json
   - Run migrations: `dotnet ef database update`

3. Running the Application
   ```bash
   cd TenXCards.API
   dotnet run
   ```

## Authentication Flow

The application uses a simple but secure authentication mechanism:

- JWT (JSON Web Token) based authentication
- Token expiration: 7 days
- Basic user registration and login flow

## Development Roadmap

1. Current Phase:

   - Basic project structure ✅
   - Initial setup ✅
   - Test and Health endpoints ✅

2. Next Steps:
   - User authentication implementation
   - Database context and migrations
   - Core domain models
