-- Check what tables exist in the database
-- Run this in Supabase SQL Editor first

-- List all tables in public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- If subcontractors table exists, check its structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'subcontractors' 
AND table_schema = 'public'
ORDER BY ordinal_position;
