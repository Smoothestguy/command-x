-- Update payment_items table to match TypeScript interface
-- This script adds missing columns and updates the schema

-- First, let's add the missing columns to the payment_items table
ALTER TABLE public.payment_items 
ADD COLUMN IF NOT EXISTS item_code VARCHAR(100),
ADD COLUMN IF NOT EXISTS unit_of_measure VARCHAR(50) DEFAULT 'each',
ADD COLUMN IF NOT EXISTS original_quantity DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS actual_quantity DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS actual_total_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS qc_approval_status VARCHAR(50) DEFAULT 'pending' CHECK (qc_approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS supervisor_approval_status VARCHAR(50) DEFAULT 'pending' CHECK (supervisor_approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS accountant_approval_status VARCHAR(50) DEFAULT 'pending' CHECK (accountant_approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS work_order_id UUID REFERENCES public.work_orders(work_order_id),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(user_id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.users(user_id);

-- Update the status check constraint to include more statuses
ALTER TABLE public.payment_items DROP CONSTRAINT IF EXISTS payment_items_status_check;
ALTER TABLE public.payment_items ADD CONSTRAINT payment_items_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'in_progress', 'ordered', 'received', 'installed'));

-- Copy quantity to original_quantity for existing records
UPDATE public.payment_items 
SET original_quantity = quantity 
WHERE original_quantity IS NULL;

-- Make original_quantity NOT NULL after copying data
ALTER TABLE public.payment_items 
ALTER COLUMN original_quantity SET NOT NULL;

-- Update the total_price calculation to use original_quantity
ALTER TABLE public.payment_items 
DROP COLUMN IF EXISTS total_price;

ALTER TABLE public.payment_items 
ADD COLUMN total_price DECIMAL(10,2) GENERATED ALWAYS AS (original_quantity * unit_price) STORED;

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_payment_items_work_order ON public.payment_items(work_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_items_status ON public.payment_items(status);
CREATE INDEX IF NOT EXISTS idx_payment_items_category ON public.payment_items(category);

-- Create a view that provides integer IDs for compatibility with the frontend
-- This allows us to use UUIDs in the database but present them as integers to the frontend
CREATE OR REPLACE VIEW public.payment_items_view AS
SELECT 
  -- Convert UUID to a hash integer for frontend compatibility
  ('x' || substr(md5(item_id::text), 1, 8))::bit(32)::int AS item_id,
  item_id AS uuid_item_id,
  project_id,
  location_id,
  vendor_id,
  work_order_id,
  description,
  item_code,
  unit_of_measure,
  unit_price,
  original_quantity,
  actual_quantity,
  quantity, -- Keep for backward compatibility
  total_price,
  actual_total_price,
  status,
  qc_approval_status,
  supervisor_approval_status,
  accountant_approval_status,
  category,
  notes,
  created_at,
  updated_at,
  created_by,
  updated_by
FROM public.payment_items;

-- Grant permissions on the view
GRANT ALL ON public.payment_items_view TO authenticated;
GRANT ALL ON public.payment_items_view TO anon;

-- Create a function to insert payment items through the view
CREATE OR REPLACE FUNCTION public.insert_payment_item(
  p_project_id UUID,
  p_description VARCHAR(255),
  p_unit_of_measure VARCHAR(50) DEFAULT 'each',
  p_unit_price DECIMAL(10,2),
  p_original_quantity DECIMAL(10,2),
  p_status VARCHAR(50) DEFAULT 'pending',
  p_item_code VARCHAR(100) DEFAULT NULL,
  p_category VARCHAR(100) DEFAULT NULL,
  p_location_id UUID DEFAULT NULL,
  p_work_order_id UUID DEFAULT NULL,
  p_vendor_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  new_item_id UUID;
BEGIN
  INSERT INTO public.payment_items (
    project_id,
    description,
    unit_of_measure,
    unit_price,
    original_quantity,
    status,
    item_code,
    category,
    location_id,
    work_order_id,
    vendor_id,
    notes
  ) VALUES (
    p_project_id,
    p_description,
    p_unit_of_measure,
    p_unit_price,
    p_original_quantity,
    p_status,
    p_item_code,
    p_category,
    p_location_id,
    p_work_order_id,
    p_vendor_id,
    p_notes
  ) RETURNING item_id INTO new_item_id;
  
  RETURN new_item_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.insert_payment_item TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_payment_item TO anon;
