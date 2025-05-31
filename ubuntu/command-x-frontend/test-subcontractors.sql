-- Sample data for Command-X Construction Management System
-- Run this AFTER creating the schema with complete-database-setup.sql

-- Insert sample users
INSERT INTO public.users (email, full_name, role, phone, company) VALUES
('admin@commandx.com', 'Admin User', 'admin', '555-0001', 'Command-X Construction'),
('manager@commandx.com', 'Project Manager', 'manager', '555-0002', 'Command-X Construction'),
('john@contractor.com', 'John Smith', 'subcontractor', '555-0003', 'Smith Electrical')
ON CONFLICT (email) DO NOTHING;

-- Insert sample projects
INSERT INTO public.projects (project_name, description, client_name, client_email, address, budget, status) VALUES
('Downtown Office Renovation', 'Complete renovation of 5000 sq ft office space', 'ABC Corporation', 'contact@abc.com', '123 Main St, Downtown', 150000.00, 'active'),
('Residential Kitchen Remodel', 'Modern kitchen renovation with new appliances', 'Jane Doe', 'jane@email.com', '456 Oak Ave, Suburbs', 45000.00, 'planning'),
('Warehouse Expansion', 'Adding 2000 sq ft to existing warehouse', 'XYZ Logistics', 'info@xyz.com', '789 Industrial Blvd', 200000.00, 'active')
ON CONFLICT DO NOTHING;

-- Insert sample subcontractors
INSERT INTO public.subcontractors (company_name, contact_name, email, phone, specialty, hourly_rate, status) VALUES
('Smith Electrical Services', 'John Smith', 'john@smithelectrical.com', '555-0101', 'Electrical', 85.00, 'active'),
('Premier Plumbing', 'Mike Johnson', 'mike@premierplumbing.com', '555-0102', 'Plumbing', 75.00, 'active'),
('Elite Flooring', 'Sarah Wilson', 'sarah@eliteflooring.com', '555-0103', 'Flooring', 65.00, 'active'),
('Pro Painting', 'David Brown', 'david@propainting.com', '555-0104', 'Painting', 55.00, 'active'),
('Master HVAC', 'Lisa Davis', 'lisa@masterhvac.com', '555-0105', 'HVAC', 90.00, 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert sample vendors
INSERT INTO public.vendors (name, contact_name, email, phone, category) VALUES
('Home Depot Pro', 'Sales Team', 'pro@homedepot.com', '555-0201', 'Building Materials'),
('Electrical Supply Co', 'Tom Wilson', 'tom@electricalsupply.com', '555-0202', 'Electrical'),
('Plumbing Warehouse', 'Amy Chen', 'amy@plumbingwarehouse.com', '555-0203', 'Plumbing')
ON CONFLICT DO NOTHING;

-- Insert sample locations (get project IDs first)
WITH project_ids AS (
  SELECT project_id, project_name FROM public.projects LIMIT 3
)
INSERT INTO public.locations (project_id, name, description)
SELECT
  p.project_id,
  location_name,
  location_desc
FROM project_ids p
CROSS JOIN (
  VALUES
    ('Main Office Area', 'Primary workspace area'),
    ('Conference Room', 'Meeting and presentation space'),
    ('Kitchen', 'Employee break area'),
    ('Reception', 'Front desk and waiting area')
) AS locations(location_name, location_desc)
ON CONFLICT DO NOTHING;

-- Insert sample work orders
WITH project_data AS (
  SELECT project_id FROM public.projects LIMIT 1
),
subcontractor_data AS (
  SELECT subcontractor_id FROM public.subcontractors LIMIT 1
)
INSERT INTO public.work_orders (project_id, title, description, assigned_to, status, estimated_hours, estimated_cost)
SELECT
  p.project_id,
  wo.title,
  wo.description,
  s.subcontractor_id,
  wo.status,
  wo.estimated_hours,
  wo.estimated_cost
FROM project_data p
CROSS JOIN subcontractor_data s
CROSS JOIN (
  VALUES
    ('Install New Lighting', 'Replace all fluorescent fixtures with LED', 'in_progress', 16.0, 1200.00),
    ('Paint Office Walls', 'Prime and paint all interior walls', 'pending', 24.0, 800.00),
    ('Install Flooring', 'Remove old carpet and install luxury vinyl', 'pending', 32.0, 2500.00)
) AS wo(title, description, status, estimated_hours, estimated_cost)
ON CONFLICT DO NOTHING;

-- Insert sample payment items
WITH project_data AS (
  SELECT project_id FROM public.projects LIMIT 1
),
vendor_data AS (
  SELECT vendor_id FROM public.vendors LIMIT 1
)
INSERT INTO public.payment_items (project_id, vendor_id, description, category, quantity, unit_price, status)
SELECT
  p.project_id,
  v.vendor_id,
  pi.description,
  pi.category,
  pi.quantity,
  pi.unit_price,
  pi.status
FROM project_data p
CROSS JOIN vendor_data v
CROSS JOIN (
  VALUES
    ('LED Light Fixtures', 'Electrical', 12.0, 85.00, 'ordered'),
    ('Paint - Premium Interior', 'Materials', 8.0, 45.00, 'received'),
    ('Luxury Vinyl Planks', 'Flooring', 500.0, 4.50, 'pending')
) AS pi(description, category, quantity, unit_price, status)
ON CONFLICT DO NOTHING;
