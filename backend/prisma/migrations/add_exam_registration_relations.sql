-- Migration: Add script submission relations to exam_registrations
-- Description: Adds submittedTo, batchScriptId, and scriptId columns to track script submission
-- Date: 2025-11-10

BEGIN;

-- Add new columns to exam_registrations
ALTER TABLE exam_registrations
  ADD COLUMN IF NOT EXISTS submitted_to INTEGER,
  ADD COLUMN IF NOT EXISTS batch_script_id INTEGER,
  ADD COLUMN IF NOT EXISTS script_id INTEGER;

-- Add foreign key constraints
ALTER TABLE exam_registrations
  ADD CONSTRAINT fk_exam_registrations_submitted_to
    FOREIGN KEY (submitted_to)
    REFERENCES users(id)
    ON DELETE SET NULL;

ALTER TABLE exam_registrations
  ADD CONSTRAINT fk_exam_registrations_batch_script
    FOREIGN KEY (batch_script_id)
    REFERENCES batch_scripts(id)
    ON DELETE SET NULL;

ALTER TABLE exam_registrations
  ADD CONSTRAINT fk_exam_registrations_script
    FOREIGN KEY (script_id)
    REFERENCES scripts(id)
    ON DELETE SET NULL;

-- Add index for batch_script_id for better query performance
CREATE INDEX IF NOT EXISTS idx_exam_registrations_batch_script_id
  ON exam_registrations(batch_script_id);

COMMIT;

-- Verify the changes
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'exam_registrations'
  AND column_name IN ('submitted_to', 'batch_script_id', 'script_id')
ORDER BY ordinal_position;
