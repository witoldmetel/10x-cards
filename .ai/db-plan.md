# Database Schema

## 1. Table `users`

- **id**: UUID PRIMARY KEY
- **name**: TEXT NOT NULL
- **email**: TEXT NOT NULL UNIQUE
- **password**: TEXT NOT NULL -- (stored as bcrypt hash)
- **api_model_key**: TEXT
- **created_at**: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

## 2. Table `collections`

- **id**: UUID PRIMARY KEY
- **name**: TEXT NOT NULL
- **description**: TEXT NOT NULL
- **created_at**: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
- **updated_at**: TIMESTAMP WITH TIME ZONE
- **total_cards**: INTEGER DEFAULT 0
- **due_cards**: INTEGER DEFAULT 0
- **color**: TEXT

## 3. Table `flashcards`

- **id**: UUID PRIMARY KEY
- **user_id**: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- **collection_id**: UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE
- **front**: TEXT NOT NULL
- **back**: TEXT NOT NULL
- **review_status**: TEXT NOT NULL
  - _Constraint_: CHECK (review_status IN ('New', 'ToCorrect', 'Approved', 'Rejected'))
- **creation_source**: TEXT NOT NULL
  - _Constraint_: CHECK (creation_source IN ('Manual', 'AI'))
- **last_reviewed**: TIMESTAMP WITH TIME ZONE
- **next_review**: TIMESTAMP WITH TIME ZONE
- **archived_at**: TIMESTAMP WITH TIME ZONE
- **tags**: TEXT[]
- **category**: TEXT[]
- **sm2_repetitions**: INTEGER NOT NULL DEFAULT 0
- **sm2_interval**: INTEGER NOT NULL DEFAULT 0
- **sm2_efactor**: NUMERIC NOT NULL
- **sm2_due_date**: TIMESTAMP WITH TIME ZONE
- **created_at**: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
- **updated_at**: TIMESTAMP WITH TIME ZONE

## 4. Table `study_sessions`

- **id**: UUID PRIMARY KEY
- **collection_id**: UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE
- **started_at**: TIMESTAMP WITH TIME ZONE NOT NULL
- **completed_at**: TIMESTAMP WITH TIME ZONE
- **cards_studied**: INTEGER NOT NULL DEFAULT 0
- **correct_answers**: INTEGER NOT NULL DEFAULT 0

## 5. Table Relationships

- **users** (one) ↔ **flashcards** (many)
- **collections** (one) ↔ **flashcards** (many)
- **collections** (one) ↔ **study_sessions** (many)

## 6. Indexes

- **B-tree Index** on `user_id` column in `flashcards` table:
  ```sql
  CREATE INDEX idx_flashcards_user_id ON flashcards (user_id);
  ```
- **B-tree Index** on `collection_id` column in `flashcards` table:
  ```sql
  CREATE INDEX idx_flashcards_collection_id ON flashcards (collection_id);
  ```
- **B-tree Index** on `collection_id` column in `study_sessions` table:
  ```sql
  CREATE INDEX idx_study_sessions_collection_id ON study_sessions (collection_id);
  ```

## 7. Security Rules (RLS)

- Enable RLS for all tables:
  ```sql
  ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
  ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
  ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
  ```
- Example RLS policies:
  ```sql
  -- Flashcards access policy
  CREATE POLICY user_flashcards_policy ON flashcards
    USING (user_id = current_user_id());

  -- Collections access policy
  CREATE POLICY user_collections_policy ON collections
    USING (id IN (SELECT collection_id FROM flashcards WHERE user_id = current_user_id()));

  -- Study sessions access policy
  CREATE POLICY user_study_sessions_policy ON study_sessions
    USING (collection_id IN (SELECT collection_id FROM flashcards WHERE user_id = current_user_id()));
  ```

## 8. Additional Notes

- All IDs use UUID type for better scalability and security
- Timestamps use WITH TIME ZONE for proper timezone handling
- The schema supports the SuperMemo2 (SM2) algorithm parameters for spaced repetition
- Collections table added to support grouping of flashcards
- Study sessions table added to track learning progress
- Proper foreign key constraints and cascading deletes implemented
