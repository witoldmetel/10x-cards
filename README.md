# <img src="Client/src/assets/logo.png" alt="10x Cards Logo" width="40" height="40" style="vertical-align: middle"> 10x Cards

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/yourusername/10x-cards) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Development Setup](#development-setup)
  - [Prerequisites](#prerequisites)
  - [Environment Configuration](#environment-configuration)
  - [Running the Application](#running-the-application)
  - [Database Management](#database-management)
  - [Testing](#testing)
  - [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [License](#license)

## Project Description

10x Cards is an AI-powered flashcard application that automates the creation of educational flashcards from text content. The application combines AI generation capabilities with a spaced repetition system to deliver an efficient learning experience. Key features include:

- Automatic Q&A flashcard generation from text using OpenRouter.ai
- Manual flashcard editing and organization with tags and categories
- Spaced repetition system using the SM-2 algorithm
- User accounts with learning progress tracking
- Secure data handling with modern authentication

## Tech Stack

- **Frontend:** React 19 with TypeScript 5, Tailwind 3, and Shadcn/ui components
- **Backend:** .NET 8 (LTS) with Entity Framework Core
- **Database:** PostgreSQL 16
- **AI Integration:** OpenRouter.ai API

## Development Setup

### Prerequisites

1. **Required Software:**
   - Node.js (v18+)
   - .NET SDK 8.0
   - Docker Desktop
   - Git

2. **IDE Recommendations:**
   - Visual Studio Code with extensions:
     - ESLint
     - Prettier
     - C# Dev Kit
     - Docker

### Environment Configuration

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/yourusername/10x-cards.git
   cd 10x-cards
   ```

2. **Environment Variables:**

   Create `.env` file in the root directory:
   ```env
   # Database
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your-secure-password
   POSTGRES_DB=ten_x_cards_db

   # OpenRouter AI
   OPENROUTER_API_KEY=your-api-key
   SITE_URL=http://localhost:3000
   SITE_NAME=10X Cards - Development

   # JWT Authentication
   JWT_KEY=your-secret-key
   JWT_ISSUER=your-issuer
   JWT_AUDIENCE=your-audience

   # CORS
   ALLOWED_ORIGINS=http://localhost:3000
   ```

3. **API Configuration:**

   Update `API/TenXCards.API/appsettings.Development.json`:
   ```json
   {
     "AllowedHosts": "*",
     "AllowedOrigins": "http://localhost:3000",
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Port=5432;Database=ten_x_cards_db;Username=postgres;Password=your-secure-password"
     },
     "Jwt": {
       "Key": "your-jwt-secret-key",
       "Issuer": "http://localhost:5001", 
       "Audience": "http://localhost:3000"
     },
     "OpenRouter": {
       "ApiKey": "your-api-key",
       "BaseUrl": "https://openrouter.ai/api/v1",
       "ApiEndpoint": "/chat/completions",
       "DefaultModel": "openai/gpt-3.5-turbo",
       "TimeoutSeconds": 120,
       "SiteUrl": "http://localhost:3000",
       "SiteName": "10X Cards - Development"
     }
   }
   ```

### Running the Application

1. **Start All Services:**
   ```bash
   npm install
   npm run dev
   ```
   This will start:
   - PostgreSQL database (port 5432)
   - .NET API (port 5001)
   - React client (port 3000)

2. **Individual Service Commands:**
   ```bash
   # Start only database
   npm run server

   # Start only frontend
   npm run client

   # Rebuild and restart API
   npm run refresh

   # Clean Docker environment
   npm run clean-docker
   ```

### Database Management

1. **Create New Migration:**
   ```bash
   cd API/TenXCards.Infrastructure
   dotnet ef migrations add MigrationName
   ```

2. **Apply Migrations:**
   ```bash
   dotnet ef database update
   ```

3. **Reset Database:**
   ```bash
   # Stop all services
   docker-compose down

   # Remove volumes
   docker-compose down -v

   # Start fresh
   docker-compose up -d
   ```

4. **Fix Common Issues:**
   ```bash
   # Fix "relation already exists" error
   docker exec -it db psql -U postgres -d ten_x_cards_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
   cd API/TenXCards.Infrastructure
   rm -rf Migrations/*
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

### Testing

1. **Frontend Tests:**
   ```bash
   cd Client
   
   # Unit tests
   npm run test
   
   # Test coverage
   npm run test:coverage
   
   # E2E tests
   npm run test:e2e
   ```

2. **Backend Tests:**
   ```bash
   cd API
   
   # Run all tests
   dotnet test
   
   # Run specific project tests
   dotnet test TenXCards.Tests
   ```

### Available Scripts

```bash
# Development
npm run dev          # Start all services
npm run client       # Start frontend only
npm run server       # Start database and API

# API Management
npm run rebuild-api  # Clean and rebuild API
npm run restart-api  # Restart API containers
npm run refresh      # Rebuild and restart API

# Docker
npm run clean-docker # Clean all Docker resources

# Database
docker-compose up db -d    # Start database
docker-compose stop db     # Stop database
docker-compose down -v     # Reset database
```

## Project Structure

```
10x-cards/
├── API/                      # Backend API
│   ├── TenXCards.API/       # API entry point
│   ├── TenXCards.Core/      # Business logic
│   └── TenXCards.Infrastructure/ # Data access
├── Client/                   # Frontend React app
├── .env                      # Environment variables
├── docker-compose.yml        # Docker configuration
└── package.json             # Project scripts
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.