# REST API Plan

## 1. Resources

- **User**  
  Maps to `users` table  
  Key fields: id (UUID), name, email, password, api_model_key, created_at.

- **Collection**  
  Maps to `collections` table  
  Key fields: id (UUID), name, description, created_at, updated_at, total_cards, due_cards, color.

- **Flashcard**  
  Maps to `flashcards` table  
  Key fields: id (UUID), user_id, collection_id, front, back, review_status, last_reviewed, next_review, archived_at, creation_source, tags, category, sm2_repetitions, sm2_interval, sm2_efactor, sm2_due_date, created_at, updated_at.

- **StudySession**  
  Maps to `study_sessions` table  
  Key fields: id (UUID), collection_id, started_at, completed_at, cards_studied, correct_answers.

## 2. Endpoints

### A. User Management

1. **User Registration**

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

4. **Delete User Account**
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

1. **Get Collections**

   - **Method:** GET
   - **Path:** `/api/collections`
   - **Description:** Retrieve user's collections.
   - **Query Parameters:**
     - `page` (default: 1)
     - `limit` (default: 20)
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
           "color": "#FF5733"
         }
       ],
       "pagination": {
         "page": 1,
         "limit": 20,
         "total": 5
       }
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:** 400 Bad Request

2. **Create Collection**

   - **Method:** POST
   - **Path:** `/api/collections`
   - **Description:** Create a new collection.
   - **Request Payload JSON:**
     ```json
     {
       "name": "Programming Basics",
       "description": "Fundamental programming concepts",
       "color": "#FF5733"
     }
     ```
   - **Response:** Created collection object
   - **Success Codes:** 201 Created
   - **Error Codes:** 400 Bad Request

3. **Update Collection**

   - **Method:** PUT
   - **Path:** `/api/collections/{id}`
   - **Description:** Update an existing collection.
   - **Request Payload JSON:**
     ```json
     {
       "name": "Updated Name",
       "description": "Updated description",
       "color": "#FF5733"
     }
     ```
   - **Response:** Updated collection object
   - **Success Codes:** 200 OK
   - **Error Codes:** 404 Not Found, 400 Bad Request

4. **Delete Collection**
   - **Method:** DELETE
   - **Path:** `/api/collections/{id}`
   - **Description:** Delete a collection and its associated flashcards.
   - **Success Codes:** 204 No Content
   - **Error Codes:** 404 Not Found

### C. Flashcard Management

1. **Get Collection Flashcards**

   - **Method:** GET
   - **Path:** `/api/collections/{collection_id}/flashcards`
   - **Description:** Retrieve flashcards for a specific collection.
   - **Query Parameters:**
     - `page` (default: 1)
     - `limit` (default: 20)
     - `review_status` (optional: 'New', 'ToCorrect', 'Approved', 'Rejected')
     - `search_phrase` (search in front and back fields)
     - `tag` (filter by specific tag)
     - `category` (filter by specific category)
     - `include_archived` (boolean, default: false)
   - **Response Payload JSON:**
     ```json
     {
       "flashcards": [
         {
           "id": "uuid",
           "collection_id": "uuid",
           "front": "What is REST API?",
           "back": "An application programming interface...",
           "review_status": "New",
           "last_reviewed": null,
           "next_review": null,
           "tags": ["technology"],
           "category": ["programming"],
           "created_at": "2024-03-20T12:34:56Z",
           "updated_at": null,
           "archived_at": null,
           "creation_source": "Manual",
           "sm2_repetitions": 0,
           "sm2_interval": 0,
           "sm2_efactor": 2.5,
           "sm2_due_date": null
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

2. **Create Flashcard**

   - **Method:** POST
   - **Path:** `/api/collections/{collection_id}/flashcards`
   - **Description:** Create a new flashcard in a collection.
   - **Request Payload JSON:**
     ```json
     {
       "front": "What is REST API?",
       "back": "An application programming interface...",
       "tags": ["technology"],
       "category": ["programming"],
       "creation_source": "Manual",
       "review_status": "New"
     }
     ```
   - **Response:** Created flashcard object
   - **Success Codes:** 201 Created
   - **Error Codes:** 400 Bad Request

3. **Update Flashcard**

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
       "review_status": "Approved"
     }
     ```
   - **Response:** Updated flashcard object
   - **Success Codes:** 200 OK
   - **Error Codes:** 404 Not Found, 400 Bad Request

4. **Archive Flashcard**

   - **Method:** PATCH
   - **Path:** `/api/flashcards/{id}/archive`
   - **Description:** Archive a flashcard.
   - **Response:** Updated flashcard object with archived_at timestamp
   - **Success Codes:** 200 OK
   - **Error Codes:** 404 Not Found

5. **Unarchive Flashcard**

   - **Method:** PATCH
   - **Path:** `/api/flashcards/{id}/unarchive`
   - **Description:** Unarchive a flashcard.
   - **Response:** Updated flashcard object with archived_at set to null
   - **Success Codes:** 200 OK
   - **Error Codes:** 404 Not Found

6. **Delete Flashcard**
   - **Method:** DELETE
   - **Path:** `/api/flashcards/{id}`
   - **Description:** Permanently delete a flashcard.
   - **Success Codes:** 204 No Content
   - **Error Codes:** 404 Not Found

### D. Study Session Management

1. **Start Study Session**

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

2. **Complete Study Session**

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

3. **Get Study Sessions**

   - **Method:** GET
   - **Path:** `/api/collections/{collection_id}/study-sessions`
   - **Description:** Get study session history for a collection.
   - **Query Parameters:**
     - `page` (default: 1)
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
       "pagination": {
         "page": 1,
         "limit": 20,
         "total": 50
       }
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:** 400 Bad Request

### E. AI Flashcard Generation

1. **Generate Flashcards using AI**

   - **Method:** POST
   - **Path:** `/api/collections/{collection_id}/flashcards/generate`
   - **Description:** Generate flashcards for a collection using AI.
   - **Request Payload JSON:**
     ```json
     {
       "source_text": "Long source text...",
       "number_of_cards": 10,
       "api_model_key": "optional_api_key"
     }
     ```
   - **Response Payload JSON:**
     ```json
     {
       "flashcards": [
         {
           "front": "Generated question",
           "back": "Generated answer",
           "tags": ["ai-generated"],
           "category": ["auto-detected"],
           "creation_source": "AI",
           "review_status": "New"
         }
       ],
       "collection_id": "uuid"
     }
     ```
   - **Success Codes:** 201 Created
   - **Error Codes:** 400 Bad Request, 401 Unauthorized

## 3. Validation and Business Logic

- **Input Validation:**
  - Required fields validation
  - Valid UUID format for IDs
  - Valid review status values: 'New', 'ToCorrect', 'Approved', 'Rejected'
  - Valid creation source values: 'Manual', 'AI'
  - Valid pagination parameters (page > 0, limit <= 100)
  - Color format validation for collections

- **Business Logic:**
  - New flashcards start with default SM2 parameters
  - Collection statistics (total_cards, due_cards) are automatically updated
  - Study session completion updates relevant flashcard review dates
  - Search is case-insensitive
  - Tags and categories are case-insensitive for comparison

- **Error Handling:**
  - Proper HTTP status codes
  - Descriptive error messages
  - Validation errors include field details
  - Not found errors for invalid IDs

## 4. Authentication and Authorization

- All endpoints except registration and login require authentication
- Mechanism: JWT (JSON Web Token) issued at login (valid for 7 days)
- Request header:  
  `Authorization: Bearer <jwt_token>`
- Security measures:
  - RLS policies in database
  - Rate limiting (5 requests/second per user)
  - Collection ownership validation
  - Study session ownership validation
