Frontend:

- React 19 provides interactivity where needed
- TypeScript 5 for static typing and better IDE support
- Tailwind 4 enables convenient application styling
- Shadcn/ui provides a library of accessible React components on which we'll base our UI

Backend:

- .NET 8 (LTS)
- PostgreSQL - Structure and relationships: Perfect for user data, transactions, business logic. AI Integration: Support for pgvector (store embeddings from AI models and perform semantic search).
- Redis - API Cache: Store responses from OpenRouter.ai to avoid repeated model queries (e.g., 24h cache).
  User sessions: Store JWT tokens or session data in Redis (access time: ~1 ms).
  Queues: Ability to handle background tasks (e.g., sending emails).

AI - Communication with models through Openrouter.ai service:

- Access to a wide range of models (OpenAI, Anthropic, Google, and many others) that will help us find a solution providing high efficiency and low costs
- Allows setting financial limits on API keys

CI/CD and Hosting:

- Github Actions for creating CI/CD pipelines
- Render (Free Tier) for React + .NET stack
