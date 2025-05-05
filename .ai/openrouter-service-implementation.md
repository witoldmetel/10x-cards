# OpenRouter Service Implementation Plan

## 1. Service Description
The OpenRouter service integrates the OpenRouter API to enhance LLM-based chats. Its main task is to send precisely formulated queries to the AI model, and then receive and analyze structured responses. The service uses the following elements:

1. **HTTP Communication** – handling requests to the OpenRouter API using HttpClient in ASP.NET Core.
2. **Message Construction** – creating system and user messages and formulating payload with appropriate model parameters.
3. **Response Parsing** – analyzing API responses, with particular attention to response_format, which defines the JSON structure.
4. **Error Handling** – centralization of logic for detecting, logging, and handling communication and validation errors.

## 2. Constructor Description
The service constructor is responsible for initializing necessary components such as HttpClient, API configuration (addresses, keys, timeouts), and model parameters. The constructor can also set default system messages that will be modified during execution depending on the context.

## 3. Public Methods and Fields
**Public Methods:**
1. `SendRequest` – method sending requests to the OpenRouter API, accepting user messages and additional parameters.
2. `SetModelParameters` – method enabling configuration of model parameters (e.g., temperature, top_p, max_tokens).
3. `ParseResponse` – method processing API response according to the declared response_format.
4. `LogCommunication` – method logging communication details (for debugging and audit).

**Public Fields:**
- `ApiEndpoint` – OpenRouter API endpoint URL.
- `DefaultModelName` – default model name (e.g., "openrouter-llm-v1").
- `DefaultParameters` – default model parameters, e.g., { temperature: 0.7, top_p: 0.95, max_tokens: 150 }.

## 4. Private Methods and Fields
**Private Methods:**
1. `BuildPayload` – builds request structure with all required parameters, such as system message, user message, response_format, model name, and model parameters.
2. `ValidateResponse` – validates the structure of responses received from the API, checking compliance with the declared JSON schema.
3. `HandleApiError` – manages API-side errors, implementing retry and fallback strategies.

**Private Fields:**
- `httpClient` – HttpClient instance used for API communication.
- `internalLogger` – mechanism for logging errors and system events.

## 5. Error Handling
The service should anticipate the following error scenarios:
1. **API Connection Error:**
   - *Challenge:* API may be unavailable or timeout may occur.
   - *Solution:* Implementation of retry logic, timeout setting, and circuit breaker mechanism.
2. **Response Validation Error:**
   - *Challenge:* Response may not match the declared JSON schema.
   - *Solution:* Response validation using JSON schema, logging validation errors, and returning compensatory information.
3. **Authorization Error:**
   - *Challenge:* Invalid API key or lack of permissions.
   - *Solution:* Key verification before sending request, handling 401/403 errors.
4. **Input Error:**
   - *Challenge:* Invalid user input data.
   - *Solution:* Input data validation and informing users about errors using clear messages.

## 6. Security Considerations
- **API Key Storage and Usage:** Storage in secure vaults (e.g., Azure Key Vault, AWS Secrets Manager) and use of environment variables.
- **Communication Encryption:** Enforcing HTTPS for all API connections.
- **Attack Protection:** Implementation of rate limiting, input data validation, and protection against injection attacks.
- **Audit and Logging:** Monitoring all communication operations and implementing alert system for detecting unauthorized access attempts.

## 7. Step-by-Step Implementation Plan
1. **Environment Preparation:**
   - Configure ASP.NET Core project and add necessary NuGet packages (HttpClient, logging libraries, etc.).
   - Set environment variables for API keys and endpoints.
2. **Service Constructor Implementation:**
   - Initialize HttpClient and set default parameters (DefaultModelName, DefaultParameters).
3. **Communication Component Building:**
   - Implement `BuildPayload` method considering the following elements:
     1. **System Message:**
        - Example: "System: Provide precise and comprehensive response, considering current conversation context.".
     2. **User Message:**
        - Example: "User: Please describe the implementation process details.".
     3. **Response_format:**
        - Example: 
          ```json
          { "type": "json_schema", "json_schema": { "name": "chatResponse", "strict": true, "schema": { "answer": { "type": "string" }, "metadata": { "type": "object" } } } }
          ```
     4. **Model Name:**
        - Example: "openrouter-llm-v1".
     5. **Model Parameters:**
        - Example: { "temperature": 0.7, "top_p": 0.95, "max_tokens": 150 }.
4. **Request Sending Method Implementation:**
   - Implement `SendRequest` method that calls OpenRouter API and passes the built payload.
5. **Response Parsing and Validation:**
   - Implementation of `ParseResponse` method with additional `ValidateResponse` method to check response compliance with declared schema.
6. **Error Handling and Logging:**
   - Integration of `HandleApiError` and `LogCommunication` methods for exception management and communication logging.
7. **Integration and Unit Tests:**
   - Conduct tests for key scenarios, including connection error simulation, incorrect responses, and payload validity validation.
8. **Deployment and Monitoring:**
   - Deploy service to development environment, followed by tests in production environment.
   - Implementation of monitoring mechanisms and alerts for ongoing service status tracking.

---

The above guide provides a comprehensive plan for implementing the OpenRouter service, which should be easily adaptable to the specific technology stack used in the 10xCards project.