# 10x Cards

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/yourusername/10x-cards) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Development Scripts](#development-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)
- [Features](#features)

## Project Description

10x Cards is an AI-powered flashcard application that automates the creation of educational flashcards from text content. The application combines AI generation capabilities with a spaced repetition system to deliver an efficient learning experience. Key features include:

- Automatic Q&A flashcard generation from text using OpenRouter.ai
- Manual flashcard editing and organization with tags and categories
- Spaced repetition system using the SM-2 algorithm
- User accounts with learning progress tracking
- Secure data handling with modern authentication

## Tech Stack

- **Frontend:** React 19 with TypeScript 5, Tailwind 4, and Shadcn/ui components
- **Backend:** .NET 8 (LTS) with Entity Framework Core
- **Database:** PostgreSQL 16
- **AI Integration:** OpenRouter.ai API

_Note: For detailed technology specifications, please refer to the [tech-stack.md](.ai/tech-stack.md) file._

## Getting Started Locally

Follow these steps to set up the project on your local machine:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/10x-cards.git
   cd 10x-cards
   ```

2. **Environment Setup:**

   Copy the `.env.example` file to `.env` and update the values:

   ```bash
   cp .env.example .env
   # Edit .env with your preferred text editor
   ```

3. **Start the Database:**

   Start PostgreSQL using Docker:

   ```bash
   docker-compose up db -d
   ```

   Database connection details:

   - Host: localhost
   - Port: 5432
   - Database: ten_x_cards_db
   - Username: postgres
   - Password: (set in .env file)

4. **Start the API:**

   Navigate to the API directory and run the .NET application:

   ```bash
   cd API/TenXCards.API
   dotnet restore
   dotnet run
   ```

   The API will be available at:

   - Main API: http://localhost:5001
   - Swagger UI: http://localhost:5001/swagger

5. **Start the Client:**

   In a new terminal, navigate to the Client directory:

   ```bash
   cd Client
   npm install
   npm run dev
   ```

   The client will be available at http://localhost:3000

### Port Configuration

All services use fixed ports for consistency:

- Frontend (Client): 3000
- Backend (API): 5001
- Database: 5432

### Docker Commands

```bash
# Start all services
docker-compose up -d --build

# Start only database
docker-compose up db -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Development Scripts

### Database Management

```bash
# Start PostgreSQL
docker-compose up db -d

# Check database status
docker ps
docker logs tenxcards-db

# Stop database
docker-compose stop db

# Reset database (removes all data)
docker-compose down -v

# Create a new migration
cd API/TenXCards.API
dotnet ef migrations add MigrationName -p ../TenXCards.Infrastructure/TenXCards.Infrastructure.csproj

# Apply pending migrations
dotnet ef database update

# Clear cache
dotnet ef database update 0

# Remove the last migration (only if not applied to database)
dotnet ef migrations remove

# List all migrations
dotnet ef migrations list

# Generate SQL script for migrations
dotnet ef migrations script
```

### Backend (API) Development

```bash
# Local Development
cd API/TenXCards.API
dotnet restore
dotnet run

# Docker Development
docker-compose up api -d
docker logs tenxcards-api
docker-compose stop api
```

### Frontend Development

```bash
# Start development server
cd Client
npm run dev

# Build for production
npm run build

# Lint and format
npm run lint
npm run format
```

### Docker Commands

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up db -d
docker-compose up api -d

# View logs
docker-compose logs -f
docker logs tenxcards-db
docker logs tenxcards-api

# Stop services
docker-compose stop
docker-compose down

# Rebuild services
docker-compose up -d --build
```

### Troubleshooting Commands

```bash
# Check ports in use
lsof -i :5001  # API port
lsof -i :5432  # Database port
lsof -i :3000  # Client port

# Check container health
docker inspect tenxcards-db | grep Status
docker inspect tenxcards-api | grep Status

# View real-time logs
docker-compose logs -f
```

### Port Configuration

All services use fixed ports for consistency:

- Frontend (Client): http://localhost:3000
- Backend (API): http://localhost:5001
- Swagger UI: http://localhost:5001/swagger
- Database: localhost:5432

### Database Connection Details

- Host: localhost
- Port: 5432
- Database: ten_x_cards_db
- Username: postgres
- Password: (set in .env file)

## Project Scope

The MVP scope includes:

- AI-powered flashcard generation from text
- Flashcard management with metadata
- Spaced repetition system
- User account management
- Review interface with filtering

## Project Status

Currently in active development. See [PRD](.ai/prd.md) for details.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Features

### Authentication & Security

- User registration and login with JWT authentication
- Secure password hashing using BCrypt
- Rate limiting protection (5 requests/minute)
- CORS security with configurable origins

### API Endpoints

- POST /api/users/register - Create new account
- POST /api/users/login - Authenticate user
- More endpoints coming soon...

### Configuration Files

1. **Environment Variables** (.env)

   ```env
   # Database
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your-secure-password
   POSTGRES_DB=ten_x_cards_db

   # JWT Authentication
   JWT_KEY=your-secret-key
   JWT_ISSUER=your-issuer
   JWT_AUDIENCE=your-audience

   # CORS
   ALLOWED_ORIGINS=http://localhost:3000
   ```

2. **API Configuration** (appsettings.json)
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Port=5432;Database=ten_x_cards_db;Username=postgres;Password=your-secure-password"
     },
     "Jwt": {
       "Key": "your-secret-key",
       "Issuer": "your-issuer",
       "Audience": "your-audience"
     },
     "AllowedOrigins": "http://localhost:3000"
   }
   ```
