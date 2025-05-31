-- Add sample payment items for testing (Fixed for actual schema)
-- Run this in Supabase SQL Editor

-- First, check what columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payment_items' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Get existing project and location IDs
WITH project_data AS (
  SELECT project_id FROM public.projects LIMIT 1
),
location_data AS (
  SELECT location_id FROM public.locations LIMIT 1
)
INSERT INTO public.payment_items (
  project_id, 
  location_id,
  description, 
  category, 
  original_quantity, 
  unit_price, 
  status,
  unit_of_measure,
  item_code
)
SELECT 
  p.project_id,
  l.location_id,
  pi.description,
  pi.category,
  pi.original_quantity,
  pi.unit_price,
  pi.status,
  pi.unit_of_measure,
  pi.item_code
FROM project_data p
CROSS JOIN location_data l
CROSS JOIN (
  VALUES 
    ('LED Light Fixtures - 4ft', 'ELECTRICAL', 12.0, 85.00, 'pending', 'each', 'LED-4FT-001'),
    ('Paint - Premium Interior White', 'GENERAL', 8.0, 45.00, 'pending', 'gallon', 'PAINT-INT-WHT'),
    ('Luxury Vinyl Planks - Oak', 'GENERAL', 500.0, 4.50, 'pending', 'sq ft', 'LVP-OAK-001'),
    ('Electrical Outlets - GFCI', 'ELECTRICAL', 15.0, 12.50, 'pending', 'each', 'OUTLET-GFCI'),
    ('Drywall Sheets - 4x8', 'WALLS & CEILINGS', 25.0, 18.00, 'pending', 'sheet', 'DRY-4X8'),
    ('Insulation - R-15 Batts', 'INSULATION', 100.0, 1.25, 'pending', 'sq ft', 'INS-R15'),
    ('Ceiling Tiles - 2x2', 'WALLS & CEILINGS', 50.0, 8.75, 'pending', 'each', 'CEIL-2X2'),
    ('HVAC Ductwork - 6 inch', 'HVAC', 75.0, 15.00, 'pending', 'linear ft', 'DUCT-6IN'),
    ('Plumbing Pipes - 1/2 inch', 'PLUMBING', 200.0, 3.25, 'pending', 'linear ft', 'PIPE-HALF'),
    ('Cabinet Hardware - Handles', 'GENERAL', 30.0, 6.50, 'pending', 'each', 'CAB-HANDLE')
) AS pi(description, category, original_quantity, unit_price, status, unit_of_measure, item_code)
ON CONFLICT DO NOTHING;

-- Verify the data was inserted
SELECT 
  item_id,
  description,
  category,
  original_quantity,
  unit_price,
  status,
  unit_of_measure,
  total_price
FROM public.payment_items 
ORDER BY created_at DESC 
LIMIT 10;
