-- Add role column to invitations table
ALTER TABLE invitations 
ADD COLUMN IF NOT EXISTS role text CHECK (role IN ('admin', 'employee')) DEFAULT 'employee';

-- Update existing invitations to have the default 'employee' role
UPDATE invitations 
SET role = 'employee' 
WHERE role IS NULL;
