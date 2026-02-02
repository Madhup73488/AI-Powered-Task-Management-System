-- Add notes column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS notes TEXT;
