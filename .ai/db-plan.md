# Database Schema

## 1. Table `users`

- **id**: SERIAL PRIMARY KEY
- **email**: TEXT NOT NULL UNIQUE
- **password**: TEXT NOT NULL -- (stored as bcrypt hash)
- **api_key**: TEXT NOT NULL
- **created_at**: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

## 2. Table `flashcards` (Partitioned by RANGE on `created_at` column)

- **id**: SERIAL PRIMARY KEY
- **user_id**: INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
- **question**: TEXT NOT NULL
- **answer**: TEXT NOT NULL
- **review_status**: TEXT NOT NULL
  - _Constraint_: CHECK (review_status IN ('New', 'To correct', 'Approved', 'Rejected'))
- **archived_at**: TIMESTAMP WITH TIME ZONE
- **archived**: BOOLEAN DEFAULT FALSE
- **tags**: TEXT[]
- **categories**: TEXT[]
- **sm2_repetitions**: INTEGER
- **sm2_interval**: INTEGER
- **sm2_efactor**: NUMERIC
- **sm2_due_date**: TIMESTAMP WITH TIME ZONE
- **created_at**: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

## 3. Table Relationships

- **users** (one) ↔ **flashcards** (many)
  - Column `user_id` in `flashcards` table references `users(id)` with `ON DELETE CASCADE` clause (deleting a user causes deletion of associated flashcards).

## 4. Indexes

- **B-tree Index** on `user_id` column in `flashcards` table:
  ```sql
  CREATE INDEX idx_flashcards_user_id ON flashcards (user_id);
  ```

## 5. Security Rules (RLS)

- Enable RLS for `flashcards` table:
  ```sql
  ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
  ```
- Example RLS policy, restricting access to own records only:
  ```sql
  CREATE POLICY user_flashcards_policy ON flashcards
    USING (user_id = current_setting('app.current_user_id')::INTEGER);
  ```
  _Note_: The policy assumes that the application sets the `app.current_user_id` parameter for the current user.

## 6. Additional Notes

- The `flashcards` table has been designed with scalability in mind – partitioning by `created_at` will allow for easy management of large numbers of records.
- All text data (question, answer, tags, categories) are stored as TEXT, which simplifies MVP implementation.
- The schema supports functional requirements specified in the PRD and is compatible with the technology stack (PostgreSQL, .NET 8) used in the project.
