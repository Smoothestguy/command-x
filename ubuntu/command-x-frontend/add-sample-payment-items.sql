-- Add sample payment items for testing
-- Run this in Supabase SQL Editor

-- First, get project and vendor IDs
WITH project_data AS (
  SELECT project_id FROM public.projects LIMIT 1
),
vendor_data AS (
  SELECT vendor_id FROM public.vendors LIMIT 1
),
location_data AS (
  SELECT location_id FROM public.locations LIMIT 1
)
INSERT INTO public.payment_items (
  project_id, 
  vendor_id, 
  location_id,
  description, 
  category, 
  quantity, 
  unit_price, 
  status,
  unit_of_measure,
  item_code
)
SELECT 
  p.project_id,
  v.vendor_id,
  l.location_id,
  pi.description,
  pi.category,
  pi.quantity,
  pi.unit_price,
  pi.status,
  pi.unit_of_measure,
  pi.item_code
FROM project_data p
CROSS JOIN vendor_data v
CROSS JOIN location_data l
CROSS JOIN (
  VALUES 
    ('LED Light Fixtures - 4ft', 'Electrical', 12.0, 85.00, 'pending', 'each', 'LED-4FT-001'),
    ('Paint - Premium Interior White', 'Materials', 8.0, 45.00, 'pending', 'gallon', 'PAINT-INT-WHT'),
    ('Luxury Vinyl Planks - Oak', 'Flooring', 500.0, 4.50, 'pending', 'sq ft', 'LVP-OAK-001'),
    ('Electrical Outlets - GFCI', 'Electrical', 15.0, 12.50, 'pending', 'each', 'OUTLET-GFCI'),
    ('Drywall Sheets - 4x8', 'Materials', 25.0, 18.00, 'pending', 'sheet', 'DRY-4X8'),
    ('Insulation - R-15 Batts', 'Insulation', 100.0, 1.25, 'pending', 'sq ft', 'INS-R15'),
    ('Ceiling Tiles - 2x2', 'Walls & Ceilings', 50.0, 8.75, 'pending', 'each', 'CEIL-2X2'),
    ('HVAC Ductwork - 6 inch', 'HVAC', 75.0, 15.00, 'pending', 'linear ft', 'DUCT-6IN'),
    ('Plumbing Pipes - 1/2 inch', 'Plumbing', 200.0, 3.25, 'pending', 'linear ft', 'PIPE-HALF'),
    ('Cabinet Hardware - Handles', 'General', 30.0, 6.50, 'pending', 'each', 'CAB-HANDLE')
) AS pi(description, category, quantity, unit_price, status, unit_of_measure, item_code)
ON CONFLICT DO NOTHING;

-- Verify the data was inserted
SELECT 
  item_id,
  description,
  category,
  quantity,
  unit_price,
  status,
  unit_of_measure
FROM public.payment_items 
ORDER BY item_id DESC 
LIMIT 10;
