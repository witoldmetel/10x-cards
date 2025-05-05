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
- **description**: TEXT -- Made optional
- **created_at**: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
- **updated_at**: TIMESTAMP WITH TIME ZONE
- **archived_at**: TIMESTAMP WITH TIME ZONE  # Added for soft-archiving collections
- **total_cards**: INTEGER DEFAULT 0
- **due_cards**: INTEGER DEFAULT 0
- **color**: TEXT NOT NULL -- Required field
- **tags**: TEXT[] -- Moved from flashcards
- **categories**: TEXT[] -- Moved from flashcards

## 3. Table `flashcards`

- **id**: UUID PRIMARY KEY
- **user_id**: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- **collection_id**: UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE
- **front**: TEXT NOT NULL
- **back**: TEXT NOT NULL
- **review_status**: TEXT NOT NULL
  - _Constraint_: CHECK (review_status IN ('New', 'ToCorrect', 'Approved', 'Rejected'))
  - _Default_: 'Approved' WHEN creation_source = 'Manual'
  - _Default_: 'New' WHEN creation_source = 'AI'
- **creation_source**: TEXT NOT NULL
  - _Constraint_: CHECK (creation_source IN ('Manual', 'AI'))
- **reviewed_at**: TIMESTAMP WITH TIME ZONE  # Replaces last_reviewed and next_review
- **archived_at**: TIMESTAMP WITH TIME ZONE  # Used for soft-archiving flashcards
- **sm2_repetitions**: INTEGER NOT NULL DEFAULT 0
- **sm2_interval**: INTEGER NOT NULL DEFAULT 0
- **sm2_efactor**: NUMERIC NOT NULL DEFAULT 2.5
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

> **Archiving logic:**
> - If all flashcards in a collection are archived, the collection is automatically archived (archived_at set).
> - Collections with archived_at set are only returned when archived=true query parameter is used.
> - Flashcards are included in their parent collection response.
> - Collection responses include a flashcards array with all related flashcard objects.

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
- **B-tree Index** on `reviewed_at` column in `flashcards` table:
  ```sql
  CREATE INDEX idx_flashcards_reviewed_at ON flashcards (reviewed_at);
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
    user_id UUID NOT NULL REFERENCES users(id),
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
    user_id UUID NOT NULL REFERENCES users(id),
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

   -- Refresh function
   CREATE OR REPLACE FUNCTION refresh_collection_stats()
   RETURNS TRIGGER AS $$
   BEGIN
       REFRESH MATERIALIZED VIEW CONCURRENTLY collection_stats;
       RETURN NULL;
   END;
   $$ LANGUAGE plpgsql;

   -- Trigger for automatic refresh
   CREATE TRIGGER refresh_collection_stats_trigger
   AFTER INSERT OR UPDATE OR DELETE ON flashcards
   FOR EACH STATEMENT
   EXECUTE FUNCTION refresh_collection_stats();
   ```

3. **Partitioning Strategy:**
   ```sql
   -- Partition api_logs by month
   CREATE TABLE api_logs (
       id UUID NOT NULL,
       user_id UUID NOT NULL,
       endpoint TEXT NOT NULL,
       created_at TIMESTAMP WITH TIME ZONE NOT NULL,
       -- other fields
       PRIMARY KEY (created_at, id)
   ) PARTITION BY RANGE (created_at);

   -- Create monthly partitions
   CREATE TABLE api_logs_y2024m05 PARTITION OF api_logs
   FOR VALUES FROM ('2024-05-01') TO ('2024-06-01');
   ```

### Data Cleanup
1. **Archival Strategy:**
   ```sql
   -- Function to archive old logs
   CREATE OR REPLACE FUNCTION archive_old_api_logs(
       days_to_keep INTEGER DEFAULT 30
   ) RETURNS void AS $$
   BEGIN
       INSERT INTO api_logs_archive
       SELECT * FROM api_logs
       WHERE created_at < CURRENT_DATE - days_to_keep;

       DELETE FROM api_logs
       WHERE created_at < CURRENT_DATE - days_to_keep;
   END;
   $$ LANGUAGE plpgsql;
   ```

2. **Maintenance Tasks:**
   ```sql
   -- Schedule regular maintenance
   SELECT cron.schedule('0 0 * * *', $$
       VACUUM ANALYZE api_logs;
       VACUUM ANALYZE api_usage;
       REFRESH MATERIALIZED VIEW CONCURRENTLY collection_stats;
   $$);
   ```

### Security Enhancements
1. **Row-Level Security:**
   ```sql
   -- API usage policy
   CREATE POLICY api_usage_policy ON api_usage
   USING (user_id = current_user_id());

   -- API logs policy
   CREATE POLICY api_logs_policy ON api_logs
   USING (user_id = current_user_id());
   ```

2. **Audit Logging:**
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

   -- Apply trigger to flashcards table
   CREATE TRIGGER flashcard_audit_trigger
   AFTER INSERT OR UPDATE OR DELETE ON flashcards
   FOR EACH ROW EXECUTE FUNCTION log_flashcard_changes();
   ```

These enhancements provide better tracking, performance, and security for the AI flashcard generation feature while maintaining data integrity and system performance.
