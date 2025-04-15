# 10x Cards

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/yourusername/10x-cards) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

10x Cards is an AI-powered flashcard application that automates the creation of educational flashcards from text content. The application combines AI generation capabilities with a spaced repetition system to deliver an efficient learning experience. Key features include:

- Automatic Q&A flashcard generation from text using OpenRouter.ai
- Manual flashcard editing and organization with tags and categories
- Spaced repetition system using the SM-2 algorithm
- User accounts with learning progress tracking
- Secure data handling with modern authentication

## Tech Stack

- **Frontend:** React 19 with TypeScript 5, Tailwind 4, and Shadcn/ui components
- **Backend:** .NET 8 (LTS)
- **Databases:** PostgreSQL for data storage, Redis for caching
- **AI Integration:** OpenRouter.ai API

_Note: For detailed technology specifications, please refer to the [tech-stack.md](.ai/tech-stack.md) file._

## Getting Started Locally

Follow these steps to set up the project on your local machine:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/10x-cards.git
   cd 10x-cards
   ```

2. **Start the API and Database:**

   The API and SQL Server database run in Docker containers. Make sure you have Docker installed, then:

   ```bash
   docker-compose up -d
   ```

   This will start:

   - Azure SQL Edge (SQL Server compatible) on port 1433
   - .NET API on port 5001

   The API will be available at `http://localhost:5001`

   API Endpoints:

   - GET /api/flashcards - Get all flashcards
   - GET /api/flashcards/{id} - Get a specific flashcard
   - POST /api/flashcards - Create a new flashcard
   - PUT /api/flashcards/{id} - Update a flashcard
   - DELETE /api/flashcards/{id} - Delete a flashcard
   - GET /api/test - Test endpoint returning "Hello world"

   Swagger documentation is available at `http://localhost:5001/swagger`

3. **Start the Client:**

   ```bash
   cd Client
   npm install
   npm run dev
   ```

   The client will be available at `http://localhost:5173`

4. **Database Connection Details:**

   If you need to connect to the database directly:

   - Server: localhost,1433
   - Database: TenXCardsDb
   - Username: sa
   - Password: YourStrong!Passw0rd

## Available Scripts

Below are some of the key scripts defined in the project:

- **npm run start:** Runs the application using Vite
- **npm run build:** Builds the production-ready application with TypeScript compilation
- **npm run lint:** Checks code using Biome
- **npm run format:** Formats code using Biome
- **npm run validate:** Runs TypeScript checks and linting

_For a complete list of scripts, please check the [package.json](package.json) file._

## Project Scope

The MVP scope includes:

- AI-powered flashcard generation from text (up to 50k characters)
- Flashcard management with metadata editing
- Spaced repetition system with SM-2 algorithm
- User account management with email authentication
- Review interface with filtering and search capabilities

Currently out of scope:

- PDF/DOCX file import
- Sharing sets between users
- Mobile applications
- Custom spaced repetition algorithms
- External platform integrations

## Project Status

The project is currently in active development. For detailed requirements and specifications, see the [PRD](.ai/prd.md).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
