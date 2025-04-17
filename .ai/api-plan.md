# REST API Plan

## 1. Resources

- **User**  
  Maps to `users` table  
  Key fields: id, email, password, api_key, created_at.

- **Flashcard**  
  Maps to `flashcards` table  
  Key fields: id, user_id, question, answer, review_status, archived_at, archived, tags, category, sm2_repetitions, sm2_interval, sm2_efactor, sm2_due_date, created_at.

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

1. **Get Flashcards List**

   - **Method:** GET
   - **Path:** `/api/flashcards`
   - **Description:** Retrieve user's flashcards with pagination, filtering (e.g., status, tag, category), and sorting.
   - **Query Parameters:**
     - `page` (optional)
     - `limit` (optional)
     - `review_status` (optional: 'New', 'To correct', 'Approved', 'Rejected')
     - `search` (search phrase in question field)
   - **Response Payload JSON:**
     ```json
     {
       "flashcards": [
         {
           "id": 10,
           "question": "What is REST API?",
           "answer": "An application programming interface based on HTTP protocol...",
           "review_status": "New",
           "tags": ["technology"],
           "category": ["programming"],
           "created_at": "2023-10-05T12:34:56Z"
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
   - **Error Codes:** 401 Unauthorized

2. **Get Flashcard Details**

   - **Method:** GET
   - **Path:** `/api/flashcards/{id}`
   - **Description:** Retrieve details of a specific flashcard.
   - **Response Payload JSON:**
     ```json
     {
       "id": 10,
       "question": "What is REST API?",
       "answer": "An application programming interface...",
       "review_status": "New",
       "tags": ["technology"],
       "category": ["programming"],
       "sm2_repetitions": 0,
       "sm2_interval": 0,
       "sm2_efactor": 2.5,
       "sm2_due_date": null,
       "created_at": "2023-10-05T12:34:56Z"
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:** 404 Not Found, 401 Unauthorized

3. **Create New Flashcard (Manual)**

   - **Method:** POST
   - **Path:** `/api/flashcards`
   - **Description:** Manually create a flashcard.
   - **Request Payload JSON:**
     ```json
     {
       "question": "What is REST API?",
       "answer": "An application programming interface based on HTTP protocol...",
       "tags": ["technology"],
       "category": ["programming"],
       "review_status": "New"
     }
     ```
   - **Response Payload JSON:**
     ```json
     {
       "id": 11,
       "question": "What is REST API?",
       "answer": "An application programming interface based on HTTP protocol...",
       "review_status": "New",
       "tags": ["technology"],
       "category": ["programming"],
       "created_at": "2023-10-05T12:45:00Z"
     }
     ```
   - **Success Codes:** 201 Created
   - **Error Codes:** 400 Bad Request, 401 Unauthorized

4. **Update Flashcard**

   - **Method:** PATCH (or PUT)
   - **Path:** `/api/flashcards/{id}`
   - **Description:** Update flashcard data, including question, answer, review_status, tags, category, and SM-2 parameters.
   - **Request Payload JSON:**
     ```json
     {
       "question": "New question",
       "review_status": "To correct",
       "tags": ["new tag"]
     }
     ```
   - **Response Payload JSON:**
     ```json
     {
       "id": 10,
       "question": "New question",
       "answer": "An application programming interface...",
       "review_status": "To correct",
       "tags": ["new tag"],
       "category": ["programming"],
       "updated_at": "2023-10-05T13:00:00Z"
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:** 400 Bad Request, 404 Not Found, 401 Unauthorized

5. **Delete Flashcard**

   - **Method:** DELETE
   - **Path:** `/api/flashcards/{id}`
   - **Description:** Delete a specific flashcard.
   - **Response Payload JSON:**
     ```json
     {
       "message": "Flashcard deleted successfully."
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:** 404 Not Found, 401 Unauthorized

6. **Archive Flashcard**

   - **Method:** PATCH
   - **Path:** `/api/flashcards/{id}/archive`
   - **Description:** Mark flashcard as archived (sets `archived` flag and saves `archived_at`).
   - **Request Payload JSON:**
     ```json
     {
       "archived": true
     }
     ```
   - **Response Payload JSON:**
     ```json
     {
       "id": 10,
       "archived": true,
       "archived_at": "2023-10-05T13:15:00Z"
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:** 400 Bad Request, 404 Not Found, 401 Unauthorized

7. **Batch Update**
   - **Method:** PATCH
   - **Path:** `/api/flashcards/batch`
   - **Description:** Update status or other fields for multiple flashcards simultaneously.
   - **Request Payload JSON:**
     ```json
     {
       "flashcard_ids": [10, 11, 12],
       "update": {
         "review_status": "Rejected"
       }
     }
     ```
   - **Response Payload JSON:**
     ```json
     {
       "updated_ids": [10, 11, 12],
       "message": "Batch update successful."
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:** 400 Bad Request, 401 Unauthorized

### C. AI Flashcard Generation

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

### D. Additional Endpoints (Optional)

1. **Archived Flashcards Statistics**
   - **Method:** GET
   - **Path:** `/api/flashcards/archived/statistics`
   - **Description:** Returns statistics about archived flashcards (e.g., count, learning effectiveness).
   - **Response Payload JSON:**
     ```json
     {
       "total_archived": 50,
       "archived_by_category": {
         "math": 20,
         "science": 30
       }
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:** 401 Unauthorized

## 3. Authentication and Authorization

- All endpoints modifying resources (flashcards, users) require authorization in the full implementation.
- Mechanism used: JWT (JSON Web Token) issued at login (valid for 7 days).
- Request header:  
  `Authorization: Bearer <jwt_token>`
- Additionally, for data protection:
  - RLS policies in database (e.g., `user_flashcards_policy`).
  - Rate limiting middleware (5 requests/minute).

## 4. Validation and Business Logic

- **Input Data Validation:**
  - Flashcards: Validation of required fields (`question`, `answer`).
  - `review_status`: Only allowed values: "New", "To correct", "Approved", "Rejected".
  - Text passed to AI generation: maximum 50k characters - validation at API level.
- **Business Logic:**
  - AI flashcard generation must handle long-running process with progress monitoring and error handling (e.g., email notification if >5 minutes).
  - Flashcard management allows manual editing, batch updates, and archiving while preserving history.
  - Users can self-manage their accounts (registration, login, password reset, account deletion) using ASP.NET Core Identity and JWT mechanisms.
- **SM-2 Logic Integration:**

  - Flashcard parameters update (sm2_repetitions, sm2_interval, sm2_efactor, sm2_due_date) occurs through update endpoints – SM-2 algorithm logic must be integrated at service layer.

- **Additional Aspects:**
  - API-level rate limiting (5 requests/minute) for abuse prevention.
  - Error handling: All endpoints should return consistent error structures, including codes and potential fix suggestions (e.g., for AI generation errors).
