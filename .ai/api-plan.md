# REST API Plan

## 1. Resources

- **User**  
  Maps to `users` table  
  Key fields: id, email, password, api_key, created_at.

- **Flashcard**  
  Maps to `flashcards` table  
  Key fields: id, front, back, is_archived, archived_at, creation_source, review_status, tags, category, sm2_repetitions, sm2_interval, sm2_efactor, sm2_due_date, created_at, updated_at.

## 2. Endpoints

### A. User Management

1. **User Registration**

   - **Method:** POST
   - **Path:** `/api/users/register`
   - **Description:** Register a new user.
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
       "id": 1,
       "email": "user@example.com",
       "created_at": "2023-10-05T12:34:56Z"
     }
     ```
   - **Success Codes:** 201 Created
   - **Error Codes:** 400 Bad Request (e.g., field validation, email already exists)

2. **User Login**

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
       "token": "jwt_token_here",
       "expires_in": 604800
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:** 401 Unauthorized

3. **Password Reset**

   - **Method:** POST
   - **Path:** `/api/users/password-reset`
   - **Description:** Initiate password reset procedure.
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

4. **Delete User Account**
   - **Method:** DELETE
   - **Path:** `/api/users` (or `/api/users/me`)
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

### B. Flashcard Management

1. **Get Active Flashcards**

   - **Method:** GET
   - **Path:** `/api/flashcards`
   - **Description:** Retrieve active (non-archived) flashcards with pagination and filtering.
   - **Query Parameters:**
     - `page` (default: 1)
     - `limit` (default: 20)
     - `reviewStatus` (optional: 'New', 'ToCorrect', 'Approved', 'Rejected')
     - `searchPhrase` (search in front and back fields)
     - `tag` (filter by specific tag)
     - `category` (filter by specific category)
   - **Response Payload JSON:**
     ```json
     {
       "items": [
         {
           "id": "guid",
           "front": "What is REST API?",
           "back": "An application programming interface...",
           "reviewStatus": "New",
           "tags": ["technology"],
           "category": ["programming"],
           "createdAt": "2024-03-20T12:34:56Z",
           "updatedAt": null,
           "isArchived": false,
           "archivedAt": null,
           "creationSource": "Manual",
           "sm2Repetitions": 0,
           "sm2Interval": 0,
           "sm2Efactor": 2.5,
           "sm2DueDate": null
         }
       ],
       "pagination": {
         "page": 1,
         "limit": 20,
         "total": 100
       }
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:** 400 Bad Request

2. **Get Archived Flashcards**

   - **Method:** GET
   - **Path:** `/api/flashcards/archived`
   - **Description:** Retrieve archived flashcards with pagination and filtering.
   - **Query Parameters:** Same as Get Active Flashcards
   - **Response:** Same structure as Get Active Flashcards
   - **Success Codes:** 200 OK
   - **Error Codes:** 400 Bad Request

3. **Get Archived Statistics**

   - **Method:** GET
   - **Path:** `/api/flashcards/archived/statistics`
   - **Description:** Get statistics about archived flashcards.
   - **Response Payload JSON:**
     ```json
     {
       "totalArchived": 50,
       "archivedByCategory": {
         "programming": 20,
         "language": 30
       }
     }
     ```
   - **Success Codes:** 200 OK

4. **Get Flashcard Details**

   - **Method:** GET
   - **Path:** `/api/flashcards/{id}`
   - **Description:** Retrieve details of a specific flashcard.
   - **Response:** Single flashcard object
   - **Success Codes:** 200 OK
   - **Error Codes:** 404 Not Found

5. **Create Flashcard**

   - **Method:** POST
   - **Path:** `/api/flashcards`
   - **Description:** Create a new flashcard.
   - **Request Payload JSON:**
     ```json
     {
       "front": "What is REST API?",
       "back": "An application programming interface...",
       "tags": ["technology"],
       "category": ["programming"],
       "creationSource": "Manual",
       "reviewStatus": "New"
     }
     ```
   - **Response:** Created flashcard object
   - **Success Codes:** 201 Created
   - **Error Codes:** 400 Bad Request

6. **Update Flashcard**

   - **Method:** PUT
   - **Path:** `/api/flashcards/{id}`
   - **Description:** Update an existing flashcard.
   - **Request Payload JSON:**
     ```json
     {
       "front": "Updated front",
       "back": "Updated back",
       "tags": ["updated-tag"],
       "category": ["updated-category"],
       "reviewStatus": "Approved",
       "isArchived": false
     }
     ```
   - **Response:** Updated flashcard object
   - **Success Codes:** 200 OK
   - **Error Codes:** 404 Not Found, 400 Bad Request

7. **Batch Update**

   - **Method:** PATCH
   - **Path:** `/api/flashcards/batch`
   - **Description:** Update multiple flashcards simultaneously.
   - **Request Payload JSON:**
     ```json
     {
       "flashcardIds": ["guid1", "guid2"],
       "update": {
         "reviewStatus": "Approved",
         "tags": ["new-tag"],
         "isArchived": false
       }
     }
     ```
   - **Response Payload JSON:**
     ```json
     {
       "updatedIds": ["guid1", "guid2"],
       "message": "Successfully updated 2 flashcards"
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:** 400 Bad Request

8. **Archive Flashcard**

   - **Method:** PATCH
   - **Path:** `/api/flashcards/{id}/archive`
   - **Description:** Archive a flashcard.
   - **Response:** Updated flashcard object with isArchived=true
   - **Success Codes:** 200 OK
   - **Error Codes:** 404 Not Found

9. **Unarchive Flashcard**

   - **Method:** PATCH
   - **Path:** `/api/flashcards/{id}/unarchive`
   - **Description:** Unarchive a flashcard.
   - **Response:** Updated flashcard object with isArchived=false
   - **Success Codes:** 200 OK
   - **Error Codes:** 404 Not Found

10. **Delete Flashcard**
    - **Method:** DELETE
    - **Path:** `/api/flashcards/{id}`
    - **Description:** Permanently delete a flashcard.
    - **Success Codes:** 204 No Content
    - **Error Codes:** 404 Not Found

## 3. Validation and Business Logic

- **Input Validation:**
  - Required fields: front, back
  - Valid review status values
  - Valid creation source values
  - Proper GUID format for IDs
  - Valid pagination parameters (page > 0, limit <= 100)

- **Business Logic:**
  - New flashcards start with default SM2 parameters
  - Archiving tracks the archive timestamp
  - Updates track the modification timestamp
  - Search is case-insensitive
  - Tags and categories are case-insensitive for comparison

- **Error Handling:**
  - Proper HTTP status codes
  - Descriptive error messages
  - Validation errors include field details
  - Not found errors for invalid IDs

## 4. Authentication and Authorization

- All endpoints modifying resources (flashcards, users) require authorization in the full implementation.
- Mechanism used: JWT (JSON Web Token) issued at login (valid for 7 days).
- Request header:  
  `Authorization: Bearer <jwt_token>`
- Additionally, for data protection:
  - RLS policies in database (e.g., `user_flashcards_policy`).
  - Rate limiting middleware (5 requests/minute).

## 5. AI Flashcard Generation

1. **Generate Flashcards using AI**

   - **Method:** POST
   - **Path:** `/api/flashcards/generate`
   - **Description:** Accept text (up to 50k characters) and optionally OpenRouter API key, initiate AI flashcard generation.
   - **Request Payload JSON:**
     ```json
     {
       "text": "Long source text...",
       "openrouter_api_key": "optional_api_key_value"
     }
     ```
   - **Response Payload JSON:**
     ```json
     {
       "task_id": "abc123",
       "status": "in_progress",
       "message": "Flashcard generation initiated."
     }
     ```
   - **Success Codes:** 202 Accepted
   - **Error Codes:** 400 Bad Request (e.g., character limit exceeded), 401 Unauthorized

2. **Monitor Generation Progress**
   - **Method:** GET
   - **Path:** `/api/flashcards/generate/{task_id}`
   - **Description:** Monitor the status of flashcard generation process.
   - **Response Payload JSON:**
     ```json
     {
       "task_id": "abc123",
       "status": "completed", // or "in_progress"/"failed"
       "progress": 100, // percentage
       "generated_flashcards": [
         /* list of generated flashcards if completed */
       ],
       "error": null // or error code/message if failed
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:** 404 Not Found, 401 Unauthorized
