-- Sample data for Command-X Construction Management
-- Run this AFTER running complete-database-setup.sql

-- Insert sample users
INSERT INTO public.users (email, full_name, role, phone, company) VALUES
('admin@commandx.com', 'Admin User', 'admin', '555-0001', 'Command-X Construction'),
('manager@commandx.com', 'Project Manager', 'manager', '555-0002', 'Command-X Construction'),
('john.contractor@email.com', 'John Smith', 'subcontractor', '555-0003', 'Smith Construction LLC');

-- Insert sample subcontractors
INSERT INTO public.subcontractors (company_name, contact_name, email, phone, specialty, hourly_rate, license_number) VALUES
('ABC Plumbing', 'Mike Johnson', 'mike@abcplumbing.com', '555-1001', 'Plumbing', 85.00, 'PL-12345'),
('Elite Electrical', 'Sarah Wilson', 'sarah@eliteelectric.com', '555-1002', 'Electrical', 95.00, 'EL-67890'),
('Premier Flooring', 'David Brown', 'david@premierflooring.com', '555-1003', 'Flooring', 75.00, 'FL-11111');

-- Insert sample vendors
INSERT INTO public.vendors (name, contact_name, email, phone, category) VALUES
('Home Depot', 'Store Manager', 'orders@homedepot.com', '555-2001', 'Building Materials'),
('Lowes', 'Commercial Sales', 'commercial@lowes.com', '555-2002', 'Building Materials'),
('Ferguson Plumbing', 'Sales Rep', 'sales@ferguson.com', '555-2003', 'Plumbing Supplies');

-- Insert sample projects
INSERT INTO public.projects (project_name, description, client_name, client_email, client_phone, address, start_date, end_date, budget, status, created_by) VALUES
('Smith Residence Renovation', 'Complete kitchen and bathroom renovation', 'John Smith', 'john.smith@email.com', '555-3001', '123 Main St, Anytown, ST 12345', '2025-01-15', '2025-04-15', 85000.00, 'active', (SELECT user_id FROM public.users WHERE email = 'admin@commandx.com')),
('Downtown Office Build-out', 'Commercial office space renovation', 'ABC Corp', 'facilities@abccorp.com', '555-3002', '456 Business Ave, Downtown, ST 12346', '2025-02-01', '2025-06-01', 150000.00, 'planning', (SELECT user_id FROM public.users WHERE email = 'admin@commandx.com')),
('Johnson Home Addition', 'Second story addition with master suite', 'Mary Johnson', 'mary.johnson@email.com', '555-3003', '789 Oak Dr, Suburbia, ST 12347', '2025-03-01', '2025-08-01', 120000.00, 'planning', (SELECT user_id FROM public.users WHERE email = 'manager@commandx.com'));

-- Insert sample locations for projects
INSERT INTO public.locations (project_id, name, description) VALUES
((SELECT project_id FROM public.projects WHERE project_name = 'Smith Residence Renovation'), 'Kitchen', 'Main kitchen area'),
((SELECT project_id FROM public.projects WHERE project_name = 'Smith Residence Renovation'), 'Master Bathroom', 'Primary bathroom renovation'),
((SELECT project_id FROM public.projects WHERE project_name = 'Smith Residence Renovation'), 'Guest Bathroom', 'Secondary bathroom updates'),
((SELECT project_id FROM public.projects WHERE project_name = 'Downtown Office Build-out'), 'Reception Area', 'Front desk and waiting area'),
((SELECT project_id FROM public.projects WHERE project_name = 'Downtown Office Build-out'), 'Conference Room', 'Main meeting space'),
((SELECT project_id FROM public.projects WHERE project_name = 'Johnson Home Addition'), 'Master Bedroom', 'New master bedroom'),
((SELECT project_id FROM public.projects WHERE project_name = 'Johnson Home Addition'), 'Master Bathroom', 'New master bathroom');

-- Insert sample work orders
INSERT INTO public.work_orders (project_id, title, description, assigned_to, status, priority, estimated_hours, estimated_cost, start_date, due_date, created_by) VALUES
((SELECT project_id FROM public.projects WHERE project_name = 'Smith Residence Renovation'), 'Kitchen Plumbing Rough-in', 'Install new plumbing for kitchen renovation', (SELECT subcontractor_id FROM public.subcontractors WHERE company_name = 'ABC Plumbing'), 'in_progress', 'high', 16.0, 1360.00, '2025-01-20', '2025-01-22', (SELECT user_id FROM public.users WHERE email = 'admin@commandx.com')),
((SELECT project_id FROM public.projects WHERE project_name = 'Smith Residence Renovation'), 'Electrical Panel Upgrade', 'Upgrade main electrical panel for increased capacity', (SELECT subcontractor_id FROM public.subcontractors WHERE company_name = 'Elite Electrical'), 'pending', 'high', 8.0, 760.00, '2025-01-25', '2025-01-25', (SELECT user_id FROM public.users WHERE email = 'admin@commandx.com')),
((SELECT project_id FROM public.projects WHERE project_name = 'Downtown Office Build-out'), 'Flooring Installation', 'Install luxury vinyl plank flooring throughout office', (SELECT subcontractor_id FROM public.subcontractors WHERE company_name = 'Premier Flooring'), 'pending', 'medium', 24.0, 1800.00, '2025-02-10', '2025-02-12', (SELECT user_id FROM public.users WHERE email = 'manager@commandx.com'));

-- Insert sample payment items
INSERT INTO public.payment_items (project_id, location_id, vendor_id, description, category, quantity, unit_price, status, notes) VALUES
((SELECT project_id FROM public.projects WHERE project_name = 'Smith Residence Renovation'), (SELECT location_id FROM public.locations WHERE name = 'Kitchen'), (SELECT vendor_id FROM public.vendors WHERE name = 'Home Depot'), 'Quartz Countertop - Calacatta', 'Countertops', 25.5, 89.99, 'pending', 'Premium quartz with veining'),
((SELECT project_id FROM public.projects WHERE project_name = 'Smith Residence Renovation'), (SELECT location_id FROM public.locations WHERE name = 'Kitchen'), (SELECT vendor_id FROM public.vendors WHERE name = 'Home Depot'), 'Kitchen Cabinet - Shaker Style', 'Cabinets', 12.0, 299.99, 'ordered', 'White shaker style upper cabinets'),
((SELECT project_id FROM public.projects WHERE project_name = 'Smith Residence Renovation'), (SELECT location_id FROM public.locations WHERE name = 'Master Bathroom'), (SELECT vendor_id FROM public.vendors WHERE name = 'Ferguson Plumbing'), 'Kohler Toilet - Cimarron', 'Fixtures', 1.0, 329.99, 'pending', 'Comfort height elongated toilet'),
((SELECT project_id FROM public.projects WHERE project_name = 'Smith Residence Renovation'), (SELECT location_id FROM public.locations WHERE name = 'Master Bathroom'), (SELECT vendor_id FROM public.vendors WHERE name = 'Home Depot'), 'Porcelain Tile 12x24', 'Flooring', 45.0, 4.99, 'received', 'Large format bathroom tile'),
((SELECT project_id FROM public.projects WHERE project_name = 'Downtown Office Build-out'), (SELECT location_id FROM public.locations WHERE name = 'Reception Area'), (SELECT vendor_id FROM public.vendors WHERE name = 'Lowes'), 'Luxury Vinyl Plank', 'Flooring', 350.0, 3.49, 'pending', 'Commercial grade LVP flooring');

-- Insert sample line items for work orders
INSERT INTO public.line_items (work_order_id, description, quantity, unit_price) VALUES
((SELECT work_order_id FROM public.work_orders WHERE title = 'Kitchen Plumbing Rough-in'), 'Labor - Plumbing rough-in', 16.0, 85.00),
((SELECT work_order_id FROM public.work_orders WHERE title = 'Kitchen Plumbing Rough-in'), 'PEX Tubing 1/2"', 100.0, 0.89),
((SELECT work_order_id FROM public.work_orders WHERE title = 'Kitchen Plumbing Rough-in'), 'Fittings and Connectors', 1.0, 125.00),
((SELECT work_order_id FROM public.work_orders WHERE title = 'Electrical Panel Upgrade'), 'Labor - Panel installation', 8.0, 95.00),
((SELECT work_order_id FROM public.work_orders WHERE title = 'Electrical Panel Upgrade'), '200A Electrical Panel', 1.0, 350.00),
((SELECT work_order_id FROM public.work_orders WHERE title = 'Flooring Installation'), 'Labor - LVP installation', 24.0, 75.00);
