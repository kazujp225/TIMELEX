-- Add google_meet_url column to consultation_types table
-- This allows storing a fixed Google Meet URL for each consultation type
-- Migration date: 2025-11-12

ALTER TABLE consultation_types
ADD COLUMN google_meet_url VARCHAR(255) NULL;

-- Add comment to document the column purpose
COMMENT ON COLUMN consultation_types.google_meet_url IS '固定Google Meet URL（商材ごと）- 予約作成時にこのURLが優先的に使用される';

-- Create index for queries that filter by non-null google_meet_url
CREATE INDEX idx_consultation_types_google_meet_url
ON consultation_types(google_meet_url)
WHERE google_meet_url IS NOT NULL;
