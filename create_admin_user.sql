-- ============================================
-- CREATE ADMIN USER - DIRECT INSERT (FIXED)
-- ============================================
-- This properly creates all required auth tables including auth.identities
-- Run this in Supabase SQL Editor

DO $$
DECLARE
  new_user_id uuid;
  admin_email text := 'madhup73488@gmail.com';  -- CHANGE THIS
  admin_password text := 'Task@123';  -- CHANGE THIS
  admin_full_name text := 'Madhu P';  -- CHANGE THIS
  encrypted_pw text;
BEGIN
  -- Generate new user ID
  new_user_id := gen_random_uuid();
  
  -- Encrypt password
  encrypted_pw := crypt(admin_password, gen_salt('bf'));
  
  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    admin_email,
    encrypted_pw,
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', admin_full_name, 'role', 'admin'),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );

  -- CRITICAL: Insert into auth.identities (this was missing!)
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    new_user_id,
    new_user_id::text,
    jsonb_build_object(
      'sub', new_user_id::text,
      'email', admin_email
    ),
    'email',
    NOW(),
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Admin user created successfully!';
  RAISE NOTICE 'User ID: %', new_user_id;
  RAISE NOTICE 'Email: %', admin_email;
  RAISE NOTICE 'Password: %', admin_password;
  
END $$;

-- Verify the admin user was created correctly
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.status,
  u.created_at
FROM public.users u
WHERE u.role = 'admin'
ORDER BY u.created_at DESC
LIMIT 1;
