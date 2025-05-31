-- Ensure work_order_contractors table exists for multi-contractor assignments
-- Run this in Supabase SQL Editor

-- Create work_order_contractors table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.work_order_contractors (
  assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID REFERENCES public.work_orders(work_order_id) ON DELETE CASCADE,
  subcontractor_id UUID REFERENCES public.subcontractors(subcontractor_id) ON DELETE CASCADE,
  allocation_percentage DECIMAL(5,2) NOT NULL CHECK (allocation_percentage > 0 AND allocation_percentage <= 100),
  allocation_amount DECIMAL(10,2) DEFAULT 0,
  role_description VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_work_order_contractors_work_order ON public.work_order_contractors(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_contractors_subcontractor ON public.work_order_contractors(subcontractor_id);

-- Disable RLS for testing
ALTER TABLE public.work_order_contractors DISABLE ROW LEVEL SECURITY;

-- Verify table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'work_order_contractors' AND table_schema = 'public'
ORDER BY ordinal_position;
