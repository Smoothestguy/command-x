-- Personnel Registration Database Schema
-- Run this in Supabase SQL Editor to create workers and time_entries tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create workers table for individual personnel
CREATE TABLE IF NOT EXISTS public.workers (
  worker_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  home_address TEXT,
  position_applying_for VARCHAR(100),
  role VARCHAR(100),
  hire_date DATE,
  subcontractor_id UUID REFERENCES public.subcontractors(subcontractor_id),
  personal_id_document_id UUID REFERENCES public.documents(document_id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create time_entries table for personnel time tracking
CREATE TABLE IF NOT EXISTS public.time_entries (
  entry_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES public.workers(worker_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours DECIMAL(4,2) NOT NULL,
  project_id UUID REFERENCES public.projects(project_id),
  work_order_id UUID REFERENCES public.work_orders(work_order_id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workers_subcontractor ON public.workers(subcontractor_id);
CREATE INDEX IF NOT EXISTS idx_workers_active ON public.workers(is_active);
CREATE INDEX IF NOT EXISTS idx_workers_email ON public.workers(email);
CREATE INDEX IF NOT EXISTS idx_time_entries_worker ON public.time_entries(worker_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON public.time_entries(date);
CREATE INDEX IF NOT EXISTS idx_time_entries_project ON public.time_entries(project_id);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_workers_updated_at 
    BEFORE UPDATE ON public.workers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at 
    BEFORE UPDATE ON public.time_entries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Disable Row Level Security for testing (enable later for production)
ALTER TABLE public.workers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries DISABLE ROW LEVEL SECURITY;

-- Insert sample data for testing
INSERT INTO public.workers (first_name, last_name, email, phone, home_address, position_applying_for, role, is_active) VALUES
('John', 'Smith', 'john.smith@example.com', '555-0101', '123 Main St, City, State 12345', 'Construction Worker', 'Field Worker', true),
('Maria', 'Garcia', 'maria.garcia@example.com', '555-0102', '456 Oak Ave, City, State 12345', 'Electrician', 'Electrician', true),
('David', 'Johnson', 'david.johnson@example.com', '555-0103', '789 Pine Rd, City, State 12345', 'Plumber', 'Plumber', true),
('Sarah', 'Williams', 'sarah.williams@example.com', '555-0104', '321 Elm St, City, State 12345', 'Project Supervisor', 'Supervisor', true),
('Michael', 'Brown', 'michael.brown@example.com', '555-0105', '654 Maple Dr, City, State 12345', 'Carpenter', 'Carpenter', false)
ON CONFLICT (email) DO NOTHING;

-- Verify table creation
SELECT 'Workers table created successfully' as status;
SELECT COUNT(*) as worker_count FROM public.workers;
