-- Create a simple subcontractors table that definitely works
-- Run this if the full schema creation failed

-- Drop existing table if it has issues
DROP TABLE IF EXISTS public.subcontractors CASCADE;

-- Create simple subcontractors table
CREATE TABLE public.subcontractors (
  subcontractor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  specialty VARCHAR(100),
  hourly_rate DECIMAL(8,2),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS completely for testing
ALTER TABLE public.subcontractors DISABLE ROW LEVEL SECURITY;

-- Insert test data
INSERT INTO public.subcontractors (company_name, contact_name, email, phone, specialty, hourly_rate, status) VALUES
('Smith Electrical Services', 'John Smith', 'john@smithelectrical.com', '555-0101', 'Electrical', 85.00, 'active'),
('Premier Plumbing', 'Mike Johnson', 'mike@premierplumbing.com', '555-0102', 'Plumbing', 75.00, 'active'),
('Elite Flooring', 'Sarah Wilson', 'sarah@eliteflooring.com', '555-0103', 'Flooring', 65.00, 'active'),
('Pro Painting', 'David Brown', 'david@propainting.com', '555-0104', 'Painting', 55.00, 'active'),
('Master HVAC', 'Lisa Davis', 'lisa@masterhvac.com', '555-0105', 'HVAC', 90.00, 'active');

-- Verify the data was inserted
SELECT * FROM public.subcontractors;
