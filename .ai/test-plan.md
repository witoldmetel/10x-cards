# Test Plan

## 1. Introduction and Testing Objectives
- Ensure high software quality through early identification and elimination of bugs.
- Verify the correct operation of main application functionalities.
- Check performance, security, and integration of individual system components.
- **Ensure reliable AI service integration** for flashcard creation and management.
- **Verify correct Clean Architecture implementation** in the backend application.

## 2. Test Scope
- Unit tests for individual components.
- Integration tests checking module interactions.
- System tests covering the entire application flow.
- Performance tests to evaluate system scalability and response time.
- Regression tests after each change.
- **End-to-end tests** checking complete user paths.
- **Integration tests with OpenRouter.ai API** and other external services.
- **Layer isolation tests** according to Clean Architecture principles.

## 3. Types of Tests to be Conducted
- **Unit Tests:** 
  - **Frontend:** Validation of React components, hooks, and helper functions.
  - **Backend:** Testing services, repositories, and validators in isolation.
  - **API Controller Tests** using Microsoft.AspNetCore.Mvc.Testing.
  - **Middleware and filter tests** (e.g., GlobalExceptionHandlingMiddleware, RequestValidationMiddleware).
- **Integration Tests:** 
  - Verify correct communication between modules and external systems.
  - Testing complete HTTP pipeline in ASP.NET Core without server startup.
- **System Tests:** Testing complete application in production-like conditions.
- **Performance Tests:** Measuring response times and system load, especially for AI flashcard generation.
- **Security Tests:** Vulnerability analysis, penetration testing, and authentication mechanism verification.
- **Accessibility Tests:** WCAG compliance verification for different user groups.
- **Compatibility Tests:** Checking functionality across different browsers and mobile devices.

## 4. Test Scenarios for Key Functionalities
- Verify data operations correctness (input/output, form validation).
- UI tests considering different screen resolutions.
- Test scenarios covering system load and response under high traffic.
- Testing integration paths between internal modules and connection with external systems.
- Simulation of edge cases and invalid data scenarios.
- **Flashcard Management Tests:**
  - Creating, editing, deleting, archiving flashcards.
  - Sorting, filtering, and searching flashcards.
  - Synchronization between devices and browsers.
- **Spaced Repetition Mechanism Tests:**
  - Correct review scheduling.
  - Difficulty parameter updates.
  - Next review date calculations.
- **AI Flashcard Generation Tests:**
  - Generated flashcard quality.
  - Handling different source content formats.
  - External API error handling.
- **Authorization and Authentication Tests:**
  - JWT token verification and security mechanisms.
  - Testing different access levels and permissions.
  - Rate limiting tests.
- **Transactionality Tests:**
  - Data consistency verification in multi-stage operations.
  - Testing concurrency handling and locks.

## 5. Test Environment
- Separate environments: development, testing, and staging.
- Use of dedicated databases and virtual or containerized servers.
- Environment configuration matching latest production settings for maximum test representativeness.
- **Access to OpenRouter.ai test API** with test-appropriate request limits.
- **Automated deployments** via GitHub Actions.
- **Docker test containers for PostgreSQL and Redis** with predefined test data.
- **Separate configuration profiles** for test environment in ASP.NET Core.

## 6. Testing Tools
- **Unit and Integration Tests:**
  - **Frontend:** React Testing Library, Vitest
  - **Backend:** xUnit, NSubstitute/Moq, Fluent Assertions, WebApplicationFactory
- **API Tests:**
  - WebApplicationFactory for API integration tests
  - Swagger/OpenAPI for API contract validation
  - TestServer for advanced test scenarios
- **Interface Tests:** Playwright
- **Performance Tests:** Lighthouse, k6, JMeter, WebPageTest
- **Accessibility Tests:** Axe, WAVE
- **CI/CD Systems:** GitHub Actions with test automation in pipelines
- **Monitoring:** Sentry for production error tracking

## 7. Test Schedule
- **Daily:** Running unit tests in CI.
- **Every pull request:** Unit tests and selected integration tests.
- **Upon key functionality completion:** Conduct integration tests.
- **Pre-release:** System, regression, and performance tests on staging environment.
- **Weekly:** AI flashcard generation tests on representative data sample.
- **Periodically:** Performance and security tests, depending on deployment plan and code changes.
- **Before each database migration deployment:** Migration correctness verification in test environment.
- **After significant backend changes:** Load testing of key API endpoints.

## 8. Test Acceptance Criteria
- No critical bugs before deployment.
- Achieving minimum test coverage threshold (80% for business logic).
- Meeting established performance parameters:
  - Page load time under 2 seconds.
  - AI flashcard generation time under 10 seconds.
  - Support for minimum 100 concurrent users.
  - **API response time under 200ms for 95% of requests.**
  - **Correct operation of rate limiting mechanisms.**
- All reported bugs fixed or documented with removal plan for next iteration.
- **WCAG 2.1 Level AA compliance** for main user paths.
- **Successful verification of compliance with API contracts** defined in Swagger.

## 9. Bug Reporting Procedures
- Bug reporting using GitHub Issues with appropriate templates for different bug types.
- Bug description should include reproduction steps, system impact, and if possible, attached materials (screenshots, logs).
- Bug prioritization by criticality (critical, high, medium, low).
- Regular meetings to discuss bug status and project impact.
- **Automatic notifications** for critical bugs through team communication integrations.
- **Detailed API bug categorization** by application layers (controller, service, repository).
- **Special markings for bugs related to external service integration** like OpenRouter.ai.

## 10. API Tests
- **API Contract Tests:**
  - OpenAPI/Swagger documentation compliance verification.
  - JSON schema correctness checking.
  - HTTP response code validation.
- **API Performance Tests:**
  - Response time measurement for key endpoints.
  - API behavior testing under load.
  - Caching and optimization mechanism verification.
- **API Security Tests:**
  - JWT implementation correctness checking.
  - Common attack resistance testing (OWASP Top 10).
  - CORS and other security mechanism verification.
- **Error Handling Tests:**
  - Validation error response correctness verification.
  - Global exception handling testing (GlobalExceptionHandlingMiddleware).
  - Error logging correctness checking. 