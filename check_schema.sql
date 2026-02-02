-- Check if all necessary auth tables and columns exist
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'auth' 
  AND table_name = 'users'
);

SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'users'
);

-- Check auth.users columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'users'
ORDER BY ordinal_position;
