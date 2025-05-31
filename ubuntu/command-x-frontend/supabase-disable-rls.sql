-- Temporarily disable Row Level Security for testing
-- Run this in your Supabase SQL Editor

-- Disable RLS on all tables
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcontractors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.line_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('projects', 'work_orders', 'payment_items', 'subcontractors', 'vendors', 'locations', 'line_items', 'users');
