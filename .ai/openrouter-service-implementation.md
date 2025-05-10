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

## 8. Testing Results and Problem Resolution

### Initial Problems Encountered
1. **400 Bad Request Errors:**
   - *Problem:* Initial implementation received 400 Bad Request errors from OpenRouter API
   - *Root Cause:* 
     - Incorrect base URL (using `/api/v1` instead of just `/v1`)
     - Response format specification not supported by OpenRouter
     - JSON parsing issues with markdown-formatted responses
   - *Solution:*
     - Updated base URL to `https://openrouter.ai/api/v1`
     - Removed `response_format` field from request
     - Implemented `SanitizeJsonResponse` to handle markdown formatting

2. **Authentication Issues:**
   - *Problem:* API calls failing with 401 Unauthorized
   - *Root Cause:* Missing or incorrect HTTP headers
   - *Solution:* Added required headers:
     ```csharp
     Authorization: Bearer {api_key}
     HTTP-Referer: {site_url}
     X-Title: {site_name}
     ```

3. **Response Parsing Challenges:**
   - *Problem:* Inconsistent response formats from different models
   - *Root Cause:* AI models sometimes return markdown-wrapped JSON or different JSON structures
   - *Solution:* 
     - Implemented flexible JSON parsing that handles both direct arrays and wrapped objects
     - Added JSON sanitization to remove markdown formatting
     - Added support for number handling from string values

### Testing Process
1. **Direct API Testing:**
   ```bash
   curl -X POST https://openrouter.ai/api/v1/chat/completions \
     -H "Authorization: Bearer {api_key}" \
     -H "Content-Type: application/json" \
     -H "HTTP-Referer: http://localhost:3000" \
     -H "X-Title: 10X Cards - Development" \
     -d '{
       "model": "openai/gpt-3.5-turbo",
       "messages": [
         {
           "role": "system",
           "content": "Create 3 flashcards. Return ONLY a JSON array with front and back fields."
         },
         {
           "role": "user",
           "content": "Sample text for flashcard generation"
         }
       ],
       "temperature": 0.7,
       "max_tokens": 4000
     }'
   ```

2. **Integration Testing:**
   - Created test collection
   - Generated flashcards with various text lengths
   - Verified JSON parsing and database storage
   - Tested error handling and retries

3. **End-to-End Testing:**
   - Registered test user
   - Created collection
   - Generated flashcards
   - Verified flashcard creation in database

### Best Practices Identified
1. **Request Format:**
   - Keep system prompt simple and explicit
   - Request JSON array format directly
   - Use higher max_tokens (4000) for multiple flashcards
   - Set appropriate temperature (0.7) for consistent results

2. **Response Handling:**
   - Always sanitize JSON responses
   - Handle both array and object formats
   - Implement proper error handling with logging
   - Add retry logic for transient failures

3. **Configuration:**
   - Store API key securely
   - Use environment-specific site URLs
   - Set appropriate timeouts (120 seconds)
   - Use compatible models (gpt-3.5-turbo)

### Monitoring and Maintenance
1. **Logging:**
   - Log all API requests and responses
   - Track response times and success rates
   - Monitor token usage and costs
   - Alert on high error rates

2. **Performance:**
   - Cache frequently used prompts
   - Implement rate limiting
   - Monitor response times
   - Track token usage

3. **Error Handling:**
   - Implement exponential backoff
   - Add circuit breaker for API outages
   - Provide clear error messages
   - Log detailed error information

This implementation has been tested and verified to work with the following configuration:
```json
{
  "OpenRouter": {
    "ApiKey": "sk-or-v1-...",
    "BaseUrl": "https://openrouter.ai/api/v1",
    "ApiEndpoint": "/chat/completions",
    "DefaultModel": "openai/gpt-3.5-turbo",
    "TimeoutSeconds": 120,
    "SiteUrl": "http://localhost:3000",
    "SiteName": "10X Cards - Development"
  }
}
```

---

The above guide provides a comprehensive plan for implementing the OpenRouter service, which should be easily adaptable to the specific technology stack used in the 10xCards project.