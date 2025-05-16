# Database Schema

## 1. Table `users`

- **user_id**: UUID PRIMARY KEY
- **name**: TEXT NOT NULL
- **email**: TEXT NOT NULL UNIQUE
- **password**: TEXT NOT NULL -- (stored as bcrypt hash)
- **api_model_key**: TEXT
- **created_at**: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

## 2. Table `collections`

- **id**: UUID PRIMARY KEY
- **user_id**: UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE
- **name**: TEXT NOT NULL
- **description**: TEXT
- **created_at**: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
- **updated_at**: TIMESTAMP WITH TIME ZONE
- **archived_at**: TIMESTAMP WITH TIME ZONE
- **total_cards**: INTEGER DEFAULT 0
- **due_cards**: INTEGER DEFAULT 0
- **last_studied**: TIMESTAMP WITH TIME ZONE
- **mastery_level**: DOUBLE PRECISION DEFAULT 0
- **current_streak**: INTEGER DEFAULT 0
- **best_streak**: INTEGER DEFAULT 0
- **color**: TEXT NOT NULL
- **tags**: TEXT[]
- **categories**: TEXT[]

## 3. Table `flashcards`

- **id**: UUID PRIMARY KEY
- **user_id**: UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE
- **collection_id**: UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE
- **front**: TEXT NOT NULL
- **back**: TEXT NOT NULL
- **review_status**: TEXT NOT NULL
  - _Constraint_: CHECK (review_status IN ('New', 'ToCorrect', 'Approved', 'Rejected'))
  - _Default_: 'Approved' WHEN creation_source = 'Manual'
  - _Default_: 'New' WHEN creation_source = 'AI'
- **creation_source**: TEXT NOT NULL
  - _Constraint_: CHECK (creation_source IN ('Manual', 'AI'))
- **reviewed_at**: TIMESTAMP WITH TIME ZONE
- **archived_at**: TIMESTAMP WITH TIME ZONE
- **source_text_hash**: TEXT -- Hash of the source text for AI-generated cards
- **sm2_repetitions**: INTEGER NOT NULL DEFAULT 0
- **sm2_interval**: INTEGER NOT NULL DEFAULT 0
- **sm2_efactor**: NUMERIC NOT NULL DEFAULT 2.5
- **sm2_due_date**: TIMESTAMP WITH TIME ZONE
- **created_at**: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
- **updated_at**: TIMESTAMP WITH TIME ZONE

## 4. Indexes

- **B-tree Index** on `user_id` column in `flashcards` table:
  ```sql
  CREATE INDEX idx_flashcards_user_id ON flashcards (user_id);
  ```
- **B-tree Index** on `collection_id` column in `flashcards` table:
  ```sql
  CREATE INDEX idx_flashcards_collection_id ON flashcards (collection_id);
  ```
- **B-tree Index** on `reviewed_at` column in `flashcards` table:
  ```sql
  CREATE INDEX idx_flashcards_reviewed_at ON flashcards (reviewed_at);
  ```
- **B-tree Index** on `sm2_due_date` column in `flashcards` table:
  ```sql
  CREATE INDEX idx_flashcards_sm2_due_date ON flashcards (sm2_due_date);
  ```
- **B-tree Index** on `source_text_hash` column in `flashcards` table:
  ```sql
  CREATE INDEX idx_flashcards_source_text_hash ON flashcards (source_text_hash)
  WHERE source_text_hash IS NOT NULL;
  ```

## 5. Table Relationships

- **users** (one) ↔ **collections** (many)
- **users** (one) ↔ **flashcards** (many)
- **collections** (one) ↔ **flashcards** (many)

## 6. Business Rules

1. **Collection Statistics:**
   - `total_cards`: Automatically updated when flashcards are added/removed
   - `due_cards`: Updated based on SM2 algorithm due dates
   - `mastery_level`: Calculated based on flashcard review statuses
   - `current_streak`: Updated based on study sessions
   - `best_streak`: Updated when current_streak exceeds previous best

2. **Flashcard Review Status:**
   - Manual creation: Default to 'Approved'
   - AI creation: Default to 'New'
   - Updated via review process
   - Triggers update of `reviewed_at` timestamp

3. **SM2 Algorithm Integration:**
   - `sm2_repetitions`: Number of successful reviews
   - `sm2_interval`: Current interval in days
   - `sm2_efactor`: Ease factor for interval adjustments
   - `sm2_due_date`: Next review date based on algorithm

4. **Archiving Logic:**
   - Soft delete using `archived_at` timestamp
   - Collections can be archived independently
   - Archiving collection doesn't auto-archive flashcards

## 7. Security Enhancements

1. **Environment Variables:**
   - Store all sensitive information in environment variables:
     - Database credentials
     - API keys
     - JWT secrets
     - Other sensitive configuration

2. **Connection String:**
   ```sql
   -- Development
   "DefaultConnection": "Host=localhost;Port=5432;Database=ten_x_cards_db;Username=postgres;Password=${DB_PASSWORD}"

   -- Docker
   "DefaultConnection": "Host=db;Port=5432;Database=ten_x_cards_db;Username=postgres;Password=${DB_PASSWORD}"
   ```

3. **Row-Level Security:**
   ```sql
   -- Collections policy
   CREATE POLICY collections_user_policy ON collections
   USING (user_id = current_user_id());

   -- Flashcards policy
   CREATE POLICY flashcards_user_policy ON flashcards
   USING (user_id = current_user_id());
   ```

4. **Password Storage:**
   - Use bcrypt for password hashing
   - Never store plain text passwords
   - Implement password complexity requirements
   - Regular password rotation policies

5. **Access Control:**
   - Implement role-based access control (RBAC)
   - Separate database users for different operations
   - Restrict database access to specific IP ranges
   - Use SSL/TLS for database connections

6. **Data Protection:**
   - Encrypt sensitive data at rest
   - Use secure protocols for data transmission
   - Regular security audits
   - Implement data backup and recovery procedures

## 8. Additional Notes

- All IDs use UUID type for better scalability and security
- Timestamps use WITH TIME ZONE for proper timezone handling
- The schema supports the SuperMemo2 (SM2) algorithm parameters for spaced repetition
- Collections require name and color fields, with description being optional
- Flashcards created manually default to 'Approved' status
- Flashcards created by AI default to 'New' status
- reviewed_at timestamp is updated whenever review_status changes
- Pagination uses limit and offset with totalCount for all list endpoints

## 9. AI Integration Considerations

### Flashcard Generation Tracking
- **source_text_hash**: Used to prevent duplicate flashcard generation
- **creation_source**: Distinguishes between manual and AI-generated cards
- **review_status**: Special handling for AI-generated cards (starts as 'New')

### Error Tracking
- Consider adding a new table for tracking API errors and performance:
```sql
CREATE TABLE api_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    endpoint TEXT NOT NULL,
    request_payload JSONB,
    response_payload JSONB,
    status_code INTEGER,
    error_message TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_logs_user_id ON api_logs (user_id);
CREATE INDEX idx_api_logs_created_at ON api_logs (created_at);
CREATE INDEX idx_api_logs_status_code ON api_logs (status_code);
```

### Rate Limiting
- Consider adding a table for tracking API usage:
```sql
CREATE TABLE api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    endpoint TEXT NOT NULL,
    requests_count INTEGER DEFAULT 1,
    last_request_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reset_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (user_id, endpoint)
);

CREATE INDEX idx_api_usage_user_id ON api_usage (user_id);
CREATE INDEX idx_api_usage_last_request ON api_usage (last_request_at);
```

### Performance Optimization
1. **Indexing Strategy:**
   ```sql
   -- Index for finding duplicates by source text hash
   CREATE INDEX idx_flashcards_source_text_hash ON flashcards (source_text_hash)
   WHERE source_text_hash IS NOT NULL;

   -- Composite index for collection statistics
   CREATE INDEX idx_flashcards_collection_stats ON flashcards 
   (collection_id, review_status, archived_at)
   INCLUDE (sm2_due_date);
   ```

2. **Materialized Views:**
   ```sql
   -- Collection statistics materialized view
   CREATE MATERIALIZED VIEW collection_stats AS
   SELECT 
       c.id as collection_id,
       COUNT(f.id) as total_cards,
       COUNT(f.id) FILTER (WHERE f.archived_at IS NULL) as active_cards,
       COUNT(f.id) FILTER (WHERE f.sm2_due_date <= CURRENT_TIMESTAMP) as due_cards
   FROM collections c
   LEFT JOIN flashcards f ON c.id = f.collection_id
   GROUP BY c.id;
   ```

### Security Enhancements
1. **Environment Variables:**
   - Store all sensitive information in environment variables:
     - Database credentials
     - API keys
     - JWT secrets
     - Other sensitive configuration

2. **Connection String:**
   ```sql
   -- Development
   "DefaultConnection": "Host=localhost;Port=5432;Database=ten_x_cards_db;Username=postgres;Password=${DB_PASSWORD}"

   -- Docker
   "DefaultConnection": "Host=db;Port=5432;Database=ten_x_cards_db;Username=postgres;Password=${DB_PASSWORD}"
   ```

3. **Row-Level Security:**
   ```sql
   -- API usage policy
   CREATE POLICY api_usage_policy ON api_usage
   USING (user_id = current_user_id());

   -- API logs policy
   CREATE POLICY api_logs_policy ON api_logs
   USING (user_id = current_user_id());
   ```

4. **Audit Logging:**
   ```sql
   -- Trigger function for audit logging
   CREATE OR REPLACE FUNCTION log_flashcard_changes()
   RETURNS TRIGGER AS $$
   BEGIN
       INSERT INTO audit_log (
           table_name,
           operation,
           record_id,
           old_data,
           new_data,
           user_id
       ) VALUES (
           TG_TABLE_NAME,
           TG_OP,
           NEW.id,
           row_to_json(OLD),
           row_to_json(NEW),
           current_user_id()
       );
       RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   ```

5. **Password Storage:**
   - Use bcrypt for password hashing
   - Never store plain text passwords
   - Implement password complexity requirements
   - Regular password rotation policies

6. **Access Control:**
   - Implement role-based access control (RBAC)
   - Separate database users for different operations
   - Restrict database access to specific IP ranges
   - Use SSL/TLS for database connections

7. **Data Protection:**
   - Encrypt sensitive data at rest
   - Use secure protocols for data transmission
   - Regular security audits
   - Implement data backup and recovery procedures

These enhancements provide better tracking, performance, and security for the AI flashcard generation feature while maintaining data integrity and system performance.
