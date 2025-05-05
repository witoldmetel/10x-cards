# REST API Plan

## 1. Resources

### User
Maps to `users` table  
Key fields: id (UUID), name, email, password, api_model_key, created_at.

### Collection
Maps to `collections` table  
Key fields: id (UUID), name, description (optional), color, created_at, updated_at, total_cards, due_cards, tag (array of strings), category (array of strings), flashcards (array of Flashcard objects).

### Flashcard
Maps to `flashcards` table  
Key fields: id (UUID), user_id, collection_id, front, back, review_status, reviewed_at, archived_at, creation_source, sm2_repetitions, sm2_interval, sm2_efactor, sm2_due_date, created_at, updated_at.

### StudySession
Maps to `study_sessions` table  
Key fields: id (UUID), collection_id, started_at, completed_at, cards_studied, correct_answers.

## 2. Endpoints

### A. User Management

#### 1. User Registration
- **Method:** POST
- **Path:** `/api/users/register`
- **Description:** Register a new user.
- **Request Payload JSON:**
  ```json
  {
    "name": "John Doe",
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response Payload JSON:**
  ```json
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "created_at": "2023-10-05T12:34:56Z"
  }
  ```
- **Success Codes:** 201 Created
- **Error Codes:** 400 Bad Request (e.g., field validation, email already exists)

#### 2. User Login
- **Method:** POST
- **Path:** `/api/users/login`
- **Description:** Authenticate and obtain JWT token.
- **Request Payload JSON:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response Payload JSON:**
  ```json
  {
    "user_id": "user-id",
    "token": "jwt_token_here",
    "expires_in": 604800
  }
  ```
- **Success Codes:** 200 OK
- **Error Codes:** 401 Unauthorized

#### 3. Password Reset
- **Method:** POST
- **Path:** `/api/users/password-reset`
- **Description:** Reset user password.
- **Request Payload JSON:**
  ```json
  {
    "email": "user@example.com",
    "new_password": "NewSecurePassword123!"
  }
  ```
- **Response Payload JSON:**
  ```json
  {
    "message": "Password has been reset successfully."
  }
  ```
- **Success Codes:** 200 OK
- **Error Codes:** 400 Bad Request, 404 Not Found

#### 4. Delete User Account
- **Method:** DELETE
- **Path:** `/api/users/me`
- **Description:** Delete logged-in user's account.
- **Headers:** Authorization: Bearer token
- **Response Payload JSON:**
  ```json
  {
    "message": "User account deleted successfully."
  }
  ```
- **Success Codes:** 200 OK
- **Error Codes:** 401 Unauthorized

### B. Collection Management

#### 1. Get Collections
- **Method:** GET
- **Path:** `/api/collections`
- **Description:** Retrieve user's collections with their flashcards. Can filter archived collections.
- **Query Parameters:**
  - `offset` (default: 0)
  - `limit` (default: 20)
  - `archived` (boolean, default: false)
- **Response Payload JSON:**
  ```json
  {
    "collections": [
      {
        "id": "uuid",
        "name": "Programming Basics",
        "description": "Fundamental programming concepts",
        "created_at": "2024-03-20T12:34:56Z",
        "updated_at": null,
        "total_cards": 50,
        "due_cards": 10,
        "color": "#FF5733",
        "tags": ["technology"],
        "categories": ["programming"],
        "flashcards": [
          {
            "id": "uuid",
            "front": "What is REST API?",
            "back": "An application programming interface...",
            "review_status": "Approved",
            "reviewed_at": "2024-03-20T12:34:56Z",
            "created_at": "2024-03-20T12:34:56Z",
            "updated_at": null,
            "archived_at": null,
            "creation_source": "Manual",
            "sm2_repetitions": 0,
            "sm2_interval": 0,
            "sm2_efactor": 2.5,
            "sm2_due_date": null
          }
        ]
      }
    ],
    "limit": 20,
    "offset": 0,
    "totalCount": 5
  }
  ```
- **Success Codes:** 200 OK
- **Error Codes:** 400 Bad Request

#### 2. Get Dashboard Collections
- **Method:** GET
- **Path:** `/api/collections/dashboard`
- **Description:** Retrieve only collections that are not archived and have at least one active (not archived) flashcard.
- **Success Codes:** 200 OK
- **Error Codes:** 400 Bad Request

#### 3. Get Archived Collections
- **Method:** GET
- **Path:** `/api/collections/archived`
- **Description:** Retrieve all archived collections.
- **Success Codes:** 200 OK
- **Error Codes:** 400 Bad Request

#### 4. Create Collection
- **Method:** POST
- **Path:** `/api/collections`
- **Description:** Create a new collection.
- **Request Payload JSON:**
  ```json
  {
    "name": "Programming Basics",
    "color": "#FF5733",
    "description": "Fundamental programming concepts",
    "tags": ["technology"],
    "categories": ["programming"]
  }
  ```
- **Response:** Created collection object
- **Success Codes:** 201 Created
- **Error Codes:** 400 Bad Request

#### 5. Update Collection
- **Method:** PUT
- **Path:** `/api/collections/{id}`
- **Description:** Update an existing collection.
- **Request Payload JSON:**
  ```json
  {
    "name": "Updated Name",
    "description": "Updated description",
    "color": "#FF5733",
    "tags": ["updated-tag"],
    "categories": ["updated-category"]
  }
  ```
- **Response:** Updated collection object
- **Success Codes:** 200 OK
- **Error Codes:** 404 Not Found, 400 Bad Request

#### 6. Archive Collection
- **Method:** PUT
- **Path:** `/api/collections/{id}/archive`
- **Description:** Archive a collection and all its flashcards.
- **Success Codes:** 204 No Content
- **Error Codes:** 404 Not Found

#### 7. Unarchive Collection
- **Method:** PUT
- **Path:** `/api/collections/{id}/unarchive`
- **Description:** Unarchive a collection and all its flashcards.
- **Success Codes:** 204 No Content
- **Error Codes:** 404 Not Found

#### 8. Delete Collection
- **Method:** DELETE
- **Path:** `/api/collections/{id}`
- **Description:** Delete a collection and its associated flashcards.
- **Success Codes:** 204 No Content
- **Error Codes:** 404 Not Found

### C. Manual Flashcard Generation

#### 1. Create Flashcard in Collection
- **Method:** POST
- **Path:** `/api/collections/{collection_id}/flashcards`
- **Description:** Create a new flashcard in a collection. When created manually, review_status is automatically set to 'Approved'.
- **Request Payload JSON:**
  ```json
  {
    "front": "What is REST API?",
    "back": "An application programming interface...",
    "creation_source": "Manual"
  }
  ```
- **Response:** Created flashcard object with review_status set to 'Approved'
- **Success Codes:** 201 Created
- **Error Codes:** 400 Bad Request

#### 2. Update Flashcard
- **Method:** PUT
- **Path:** `/api/flashcards/{id}`
- **Description:** Update an existing flashcard. Updates reviewed_at when review_status changes.
- **Request Payload JSON:**
  ```json
  {
    "front": "Updated front",
    "back": "Updated back",
    "review_status": "Approved"
  }
  ```
- **Response:** Updated flashcard object
- **Success Codes:** 200 OK
- **Error Codes:** 404 Not Found, 400 Bad Request

#### 3. Archive Flashcard
- **Method:** PUT
- **Path:** `/api/flashcards/{id}/archive`
- **Description:** Archive a flashcard. If all flashcards in a collection are archived, the collection is also archived automatically.
- **Success Codes:** 200 OK
- **Error Codes:** 404 Not Found

#### 4. Unarchive Flashcard
- **Method:** PUT
- **Path:** `/api/flashcards/{id}/unarchive`
- **Description:** Unarchive a flashcard.
- **Success Codes:** 200 OK
- **Error Codes:** 404 Not Found

#### 5. Delete Flashcard
- **Method:** DELETE
- **Path:** `/api/flashcards/{id}`
- **Description:** Delete a flashcard by ID.
- **Success Codes:** 204 No Content
- **Error Codes:** 404 Not Found

### D. AI Flashcard Generation

#### 1. Generate Flashcards using OpenRouter
- **Method:** POST
- **Path:** `/api/collections/{collection_id}/flashcards/generate`
- **Description:** Generate flashcards for a collection using OpenRouter's AI models.
- **Request Payload JSON:**
  ```json
  {
    "source_text": "Long source text...",
    "count": 3,  // Range: 3-20, default: 3
    "model": "openai/gpt-3.5-turbo"  // Optional, defaults to configuration
  }
  ```
- **Response Payload JSON:**
  ```json
  {
    "id": "uuid",
    "userId": "uuid",
    "collectionId": "uuid",
    "front": "Generated question",
    "back": "Generated answer",
    "reviewStatus": "New",
    "creationSource": "AI",
    "createdAt": "2024-03-20T12:34:56Z",
    "updatedAt": "2024-03-20T12:34:56Z"
  }
  ```
- **Success Codes:** 201 Created
- **Error Codes:** 
  - 400 Bad Request (invalid input, JSON parsing error)
  - 401 Unauthorized (invalid API key)
  - 404 Not Found (collection not found)
  - 408 Request Timeout (AI service timeout)
  - 429 Too Many Requests (rate limit exceeded)

#### 2. Configuration (appsettings.json)
```json
{
  "OpenRouter": {
    "ApiKey": "your-openrouter-api-key",
    "BaseUrl": "https://openrouter.ai/api/v1",
    "ApiEndpoint": "/chat/completions",
    "DefaultModel": "openai/gpt-3.5-turbo",
    "TimeoutSeconds": 120,
    "SiteUrl": "http://localhost:3000",
    "SiteName": "10X Cards - Development"
  }
}
```

#### 3. Generation Process
1. Request validation:
   - Authenticate user
   - Validate collection ownership
   - Check source text length (10-4000 characters)
   - Validate count range (3-20)
2. OpenRouter API request:
   - Set required headers (Authorization, HTTP-Referer, X-Title)
   - Format system prompt for JSON array response
   - Set appropriate model parameters (temperature: 0.7, max_tokens: 4000)
3. Response processing:
   - Sanitize JSON response (remove markdown formatting)
   - Parse as array or wrapped object
   - Handle number formats and trailing commas
4. Flashcard creation:
   - Create flashcard with AI source
   - Set review status to "New"
   - Update collection statistics
   - Return created flashcard

#### 4. Error Handling
- **API Errors:**
  - Invalid API key: Return 401 with clear message
  - Rate limiting: Implement exponential backoff
  - Timeout: Set appropriate timeout (120s) and handle gracefully
  - Malformed response: Retry with fallback parsing
- **Validation Errors:**
  - Source text too short/long: Return 400 with length requirements
  - Invalid count range: Return 400 with valid range
  - Collection not found: Return 404 with clear message
  - Unauthorized access: Return 403 with ownership requirement
- **Processing Errors:**
  - JSON parsing: Log error details and return 400
  - Database errors: Log and return 500 with retry suggestion
  - Rate limits: Return 429 with retry-after header

#### 5. Security Measures
- **API Security:**
  - Store API key in secure configuration
  - Use environment-specific site URLs
  - Implement rate limiting per user
  - Log all API access attempts
- **Input Validation:**
  - Sanitize all input text
  - Validate JSON structure
  - Check character limits
  - Verify collection ownership
- **Response Handling:**
  - Sanitize AI responses
  - Validate JSON structure
  - Remove any unsafe content
  - Log suspicious responses

#### 6. Testing Scenarios
1. **Authentication:**
   - Valid JWT token
   - Invalid/expired token
   - Missing token
2. **Input Validation:**
   - Valid source text
   - Text too short/long
   - Invalid count range
   - Invalid model name
3. **API Integration:**
   - Successful response
   - Various error responses
   - Timeout handling
   - Rate limit handling
4. **Response Processing:**
   - Clean JSON response
   - Markdown-wrapped response
   - Malformed response
   - Empty response
5. **Error Handling:**
   - API errors
   - Validation errors
   - Processing errors
   - Database errors

### E. Study Session Management

#### 1. Start Study Session
- **Method:** POST
- **Path:** `/api/collections/{collection_id}/study-sessions`
- **Description:** Start a new study session for a collection.
- **Response Payload JSON:**
  ```json
  {
    "id": "uuid",
    "collection_id": "uuid",
    "started_at": "2024-03-20T12:34:56Z",
    "cards_studied": 0,
    "correct_answers": 0
  }
  ```
- **Success Codes:** 201 Created
- **Error Codes:** 400 Bad Request

#### 2. Complete Study Session
- **Method:** PATCH
- **Path:** `/api/study-sessions/{id}/complete`
- **Description:** Complete an ongoing study session.
- **Request Payload JSON:**
  ```json
  {
    "cards_studied": 20,
    "correct_answers": 15
  }
  ```
- **Response:** Updated study session object
- **Success Codes:** 200 OK
- **Error Codes:** 404 Not Found, 400 Bad Request

#### 3. Get Study Sessions
- **Method:** GET
- **Path:** `/api/collections/{collection_id}/study-sessions`
- **Description:** Get study session history for a collection.
- **Query Parameters:**
  - `offset` (default: 0)
  - `limit` (default: 20)
- **Response Payload JSON:**
  ```json
  {
    "study_sessions": [
      {
        "id": "uuid",
        "collection_id": "uuid",
        "started_at": "2024-03-20T12:34:56Z",
        "completed_at": "2024-03-20T13:34:56Z",
        "cards_studied": 20,
        "correct_answers": 15
      }
    ],
    "limit": 20,
    "offset": 0,
    "totalCount": 50
  }
  ```
- **Success Codes:** 200 OK
- **Error Codes:** 400 Bad Request

## 3. Validation and Business Logic

### Input Validation
- Required fields validation
- Valid UUID format for IDs
- Valid review status values: 'New', 'ToCorrect', 'Approved', 'Rejected'
- Valid creation source values: 'Manual', 'AI'
- Valid pagination parameters (offset >= 0, limit <= 100)
- Color format validation for collections
- Collection name and color are required, description is optional

### Business Logic
- New flashcards created manually start with review_status 'Approved'
- New flashcards created by AI start with review_status 'New'
- Collection statistics (total_cards, due_cards) are automatically updated
- Study session completion updates relevant flashcard reviewed_at dates
- reviewed_at is updated whenever review_status changes
- Search is case-insensitive
- Tag and category are case-insensitive for comparison
- Collections include their flashcards in the response
- Collections can be filtered by archived status

### Error Handling
- Proper HTTP status codes
- Descriptive error messages
- Validation errors include field details
- Not found errors for invalid IDs

## 4. Authentication and Authorization

### Authentication
- All endpoints except registration and login require authentication
- Mechanism: JWT (JSON Web Token) issued at login (valid for 7 days)
- Request header: `Authorization: Bearer <jwt_token>`

### Security Measures
- RLS policies in database
- Rate limiting (5 requests/second per user)
- Collection ownership validation
- Study session ownership validation

> **Note:** There are no global endpoints for listing or displaying flashcards. All flashcard access is through their parent collection.
