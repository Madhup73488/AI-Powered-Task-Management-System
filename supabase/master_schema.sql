-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the 'users' table
-- Note: ON DELETE NO ACTION preserves user records when auth user is deleted
-- This is important for maintaining historical task assignment data
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE NO ACTION,
  full_name text,
  email text UNIQUE,
  role text CHECK (role IN ('admin', 'employee')) DEFAULT 'employee',
  manager text,
  team text,
  profile_image text,
  phone text,
  status text CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at timestamp DEFAULT now()
);

-- Create the 'tasks' table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  status text CHECK (status IN ('not_picked', 'in_progress', 'completed')) DEFAULT 'not_picked',
  priority text CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  deadline date,
  notes text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create the 'task_comments' table
CREATE TABLE IF NOT EXISTS task_comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  comment text NOT NULL,
  created_at timestamp DEFAULT now()
);

-- Create the 'analytics_snapshots' table
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  snapshot_date date DEFAULT CURRENT_DATE,
  total_tasks int,
  completed_tasks int,
  in_progress_tasks int,
  not_picked_tasks int,
  employee_id uuid REFERENCES users(id) ON DELETE CASCADE
);

-- Create the 'invitations' table
CREATE TABLE IF NOT EXISTS invitations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  invited_by uuid REFERENCES users(id) ON DELETE SET NULL,
  role text CHECK (role IN ('admin', 'employee')) DEFAULT 'employee',
  invitation_token text UNIQUE,
  status text CHECK (status IN ('pending', 'accepted', 'expired')) DEFAULT 'pending',
  created_at timestamp DEFAULT now()
);

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(invitation_token);

-- Create the 'notifications' table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id uuid REFERENCES users(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES users(id) ON DELETE SET NULL,
  type text CHECK (type IN ('task_assigned', 'task_completed', 'comment_added', 'task_updated', 'message_sent', 'pr_raised', 'task_in_progress', 'user_login', 'user_signup')) NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  related_task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  is_read boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create index for faster queries on notifications
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- NO RLS - Keep it simple for development
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots DISABLE ROW LEVEL SECURITY;
ALTER TABLE invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on tasks table
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for updating updated_at on notifications
DROP TRIGGER IF EXISTS trigger_update_notifications_updated_at ON notifications;
CREATE TRIGGER trigger_update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create notifications
CREATE OR REPLACE FUNCTION create_notification(
  recipient_id_param uuid,
  sender_id_param uuid,
  type_param text,
  title_param text,
  message_param text,
  related_task_id_param uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (
    recipient_id,
    sender_id,
    type,
    title,
    message,
    related_task_id
  ) VALUES (
    recipient_id_param,
    sender_id_param,
    type_param,
    title_param,
    message_param,
    related_task_id_param
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to automatically create user in public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _full_name TEXT;
  _role TEXT;
BEGIN
  -- Log the raw_user_meta_data for debugging
  RAISE NOTICE 'handle_new_user: NEW.raw_user_meta_data = %', NEW.raw_user_meta_data;

  -- Safely extract full_name, defaulting to an empty string if not found
  SELECT COALESCE(NEW.raw_user_meta_data->>'full_name', '') INTO _full_name;
  -- Safely extract role, defaulting to 'employee' if not found
  SELECT COALESCE(NEW.raw_user_meta_data->>'role', 'employee') INTO _role;

  RAISE NOTICE 'handle_new_user: extracted full_name = %, role = %', _full_name, _role;

  INSERT INTO public.users (id, email, full_name, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    _full_name,
    _role,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- NOTE: Storage Policies
-- ============================================
-- Storage policies for profile_images bucket should be applied separately
-- through Supabase Dashboard or using the migration file:
-- supabase/migrations/setup_storage_policies.sql
-- 
-- These require special permissions and cannot be run in regular SQL scripts.
