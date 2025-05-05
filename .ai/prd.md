# Product Requirements Document (PRD) - 10x-cards

## 1. Product Overview

A web application for generating and managing educational flashcards using AI. Main features:

- Automatic creation of Q&A flashcards from source text via OpenRouter.ai
- Manual editing and organization of flashcards
- Spaced repetition system with SM-2 algorithm
- User accounts with progress history

## 2. User Problem

Manual preparation of high-quality flashcards:

- Average time to create 1 flashcard manually: 3-5 minutes
- 68% of students give up on spaced repetition due to time investment
- Lack of tools combining AI with repetition algorithms in one platform

## 3. Functional Requirements

### 3.1 AI Flashcard Generation

- Support for text up to 50k characters (User pastes any text)
- Application sends text to OpenRouter.ai and generates flashcards
- Option to provide own OpenRouter API key
- LLM model suggests a set of flashcards (questions and answers)

### 3.2 Flashcard Management

- Ability to manually create flashcard sets
- Metadata editing (categories, tags)
- Archiving without losing historical data

### 3.3 Repetition System

- Implementation of SM-2 algorithm with open source library
- Automatic scheduling of review sessions
- Learning progress indicator in dashboard
- 24h flashcard skip mechanism

### 3.4 User Accounts

- Registration via email + password
- Automatic logout after 7 days of inactivity
- Password reset via email
- Account deletion with confirmation

### 3.5 Security

- Password hashing with bcrypt using salt 12
- Rate limiting 5 requests/minute
- JWT sessions valid for 7 days
- Sanitization of all user inputs
- User API keys (e.g., for OpenRouter) will be stored securely by encrypting them using ASP.NET Core Data Protection APIs to avoid any plaintext exposure. In addition, for higher security, dedicated key management solutions like Azure Key Vault can be integrated.
- The application will adopt ASP.NET Core Identity to handle user registration, login, and session management in line with current ASP.NET standards. For API interactions, JWT tokens will be employed to enhance security, ensuring token validity for 7 days and seamless re-authentication.

### 3.6 Review Interface

- Filtering flashcards by status (new/to correct)
- Search by phrases in questions
- Highlighting matches in long texts

## 4. Product Boundaries

### Not included in MVP:

- PDF/DOCX file import
- Sharing sets between users
- Integration with external platforms (e.g., Moodle)
- Custom spaced repetition algorithms
- Mobile applications
- Flashcard generation from audio/video materials

### Technical Limitations:

- Max 3 parallel AI generations per user
- AI processing time: up to 10 minutes for 50k characters
- Max 10k active flashcards per account

## 5. User Stories

### US-001: Generating Flashcards from Text

**Description**: As a learner, I want to paste text to receive flashcards within 10 minutes  
**Acceptance Criteria**:

1. System displays generation progress in real-time
2. Email notification for generations >5 minutes
3. 50k character limit with character count preview

### US-002: Flashcard Review

**Description**: As a user, I want to quickly correct AI flashcards  
**Acceptance Criteria**:

1. Batch selection of 10+ flashcards simultaneously
2. Rejection with "Block similar" option
3. Auto-save changes every 30 seconds

### US-003: Review Planning

**Description**: As a student, I need to review materials at optimal intervals  
**Acceptance Criteria**:

1. SM-2 algorithm with manual interval adjustment option
2. Calendar view with planned sessions
3. Schedule export to iCalendar

### US-004: Account Management

**Description**: As a user, I want to securely manage account data  
**Acceptance Criteria**:

1. Password requirements: 12 characters, 1 number, 1 special character
2. 2FA available optionally
3. Complete data deletion within 48h

### US-005: Flashcard Archiving

**Description**: As a user, I want to hide outdated flashcards without losing history  
**Acceptance Criteria**:

1. "Show active only" filtering
2. Automatic archiving after 90 days of non-use
3. Effectiveness statistics for archived flashcards

### US-006: AI Error Handling

**Description**: As a user, I want to understand the reasons for failed generations  
**Acceptance Criteria**:

1. Error messages with reference code
2. Suggestions for improving source text format
3. History of last 10 generation attempts

## 6. Success Metrics

| Indicator               | Goal | Measurement Method                |
| ----------------------- | ---- | --------------------------------- |
| AI Flashcard Acceptance | ≥75% | Ratio of accepted/generated cards |
| AI Usage                | ≥75% | % of flashcards created via AI    |
