-- Debug subcontractors table step by step
-- Run each section separately to identify the issue

-- 1. Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'subcontractors'
) as table_exists;

-- 2. Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'subcontractors' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check RLS status
SELECT schemaname, tablename, rowsecurity, hasrls
FROM pg_tables 
WHERE tablename = 'subcontractors' 
AND schemaname = 'public';

-- 4. Check existing policies
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'subcontractors' 
AND schemaname = 'public';

-- 5. Try simple select (should work if table exists)
SELECT COUNT(*) as current_count FROM public.subcontractors;

-- 6. Try minimal insert (this is where it might fail)
INSERT INTO public.subcontractors (company_name, contact_name, email) 
VALUES ('Test Company', 'Test Contact', 'test@test.com') 
RETURNING subcontractor_id, company_name;
