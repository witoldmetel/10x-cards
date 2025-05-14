Frontend:

- React 19.1 with React DOM 19.1 provides interactivity where needed
- TypeScript 5.7 for static typing and better IDE support
- Tailwind 3.4 enables convenient application styling
- Shadcn/ui (via Radix UI components) provides a library of accessible React components
- Additional key libraries:
  - Tanstack Query 5.74 for data fetching and state management
  - React Hook Form 7.56 with Zod 3.24 for form handling and validation
  - Framer Motion 12.9 for animations
  - Axios 1.9 for HTTP requests

Testing:
- Frontend Testing:
  - React Testing Library 16.3 + Vitest 3.1 for unit and integration tests
  - Playwright 1.52 for E2E testing and cross-browser compatibility
  - Lighthouse and WebPageTest for performance testing
  - Axe and WAVE for accessibility testing (WCAG 2.1 Level AA compliance)
- Backend Testing:
  - xUnit with NSubstitute/Moq and Fluent Assertions
  - WebApplicationFactory for API integration tests
  - TestServer for advanced test scenarios
  - k6 and JMeter for performance testing
- CI/CD Testing:
  - GitHub Actions for automated test pipelines
  - Sentry for production error tracking
  - Swagger/OpenAPI for API contract validation

Backend:

- .NET 8.0 (LTS) with ASP.NET Core
- Entity Framework Core 8.0 for ORM
- PostgreSQL with Npgsql provider - Structure and relationships: Perfect for user data, transactions, business logic. AI Integration: Support for pgvector (store embeddings from AI models and perform semantic search)
- JWT Authentication via Microsoft.AspNetCore.Authentication.JwtBearer
- OpenAI SDK integration
- Redis - API Cache: Store responses from OpenRouter.ai to avoid repeated model queries (e.g., 24h cache).
  User sessions: Store JWT tokens or session data in Redis (access time: ~1 ms).
  Queues: Ability to handle background tasks (e.g., sending emails).

AI - Communication with models through Openrouter.ai service:

- Access to a wide range of models (OpenAI, Anthropic, Google, and many others) that will help us find a solution providing high efficiency and low costs
- Allows setting financial limits on API keys

CI/CD and Hosting:

- Github Actions for creating CI/CD pipelines
- Render (Free Tier) for React + .NET stack
