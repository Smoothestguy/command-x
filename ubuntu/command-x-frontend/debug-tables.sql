-- Debug script to check table structure
-- Run this in Supabase SQL Editor to see what's wrong

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check subcontractors table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'subcontractors' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check for any constraints on subcontractors
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'subcontractors'
AND table_schema = 'public';

-- Check current data in subcontractors
SELECT * FROM public.subcontractors LIMIT 5;
