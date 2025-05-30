-- Create the inspections table
CREATE TABLE inspections (
    inspection_id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    work_order_id INT REFERENCES work_orders(work_order_id) ON DELETE SET NULL,
    inspection_type VARCHAR(100) NOT NULL,
    scheduled_date DATE,
    completion_date DATE,
    status VARCHAR(50) DEFAULT 'Scheduled',
    description TEXT,
    results TEXT,
    conducted_by INT REFERENCES users(user_id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for inspections table
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON inspections
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Create the issues table
CREATE TABLE issues (
    issue_id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    work_order_id INT REFERENCES work_orders(work_order_id) ON DELETE SET NULL,
    inspection_id INT REFERENCES inspections(inspection_id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    severity VARCHAR(50) DEFAULT 'Medium', -- Low, Medium, High, Critical
    status VARCHAR(50) DEFAULT 'Open', -- Open, In Progress, Resolved, Closed
    assigned_to INT REFERENCES users(user_id),
    reported_by INT REFERENCES users(user_id),
    resolution_details TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for issues table
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON issues
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Create the contractor_assignments table for enhanced work orders
CREATE TABLE contractor_assignments (
    assignment_id SERIAL PRIMARY KEY,
    work_order_id INT NOT NULL REFERENCES work_orders(work_order_id) ON DELETE CASCADE,
    subcontractor_id INT NOT NULL REFERENCES subcontractors(subcontractor_id) ON DELETE CASCADE,
    allocation_percentage NUMERIC(5, 2) DEFAULT 0.00,
    allocation_amount NUMERIC(12, 2) DEFAULT 0.00,
    role_description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(work_order_id, subcontractor_id)
);

-- Create trigger for contractor_assignments table
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON contractor_assignments
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Create indexes for the new tables
CREATE INDEX idx_inspections_project_id ON inspections(project_id);
CREATE INDEX idx_inspections_work_order_id ON inspections(work_order_id);
CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_issues_project_id ON issues(project_id);
CREATE INDEX idx_issues_work_order_id ON issues(work_order_id);
CREATE INDEX idx_issues_inspection_id ON issues(inspection_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_contractor_assignments_work_order_id ON contractor_assignments(work_order_id);
CREATE INDEX idx_contractor_assignments_subcontractor_id ON contractor_assignments(subcontractor_id);

-- Insert sample users
INSERT INTO users (user_id, username, password_hash, email, first_name, last_name, role, status) VALUES
(1, 'sarah.johnson', '$2b$10$dummy_hash_1', 'sarah.johnson@commandx.com', 'Sarah', 'Johnson', 'project_manager', 'Active'),
(2, 'mike.wilson', '$2b$10$dummy_hash_2', 'mike.wilson@commandx.com', 'Mike', 'Wilson', 'field_worker', 'Active'),
(3, 'lisa.chen', '$2b$10$dummy_hash_3', 'lisa.chen@commandx.com', 'Lisa', 'Chen', 'user', 'Active'),
(4, 'robert.taylor', '$2b$10$dummy_hash_4', 'robert.taylor@commandx.com', 'Robert', 'Taylor', 'project_manager', 'Active'),
(5, 'james.rodriguez', '$2b$10$dummy_hash_5', 'james.rodriguez@commandx.com', 'James', 'Rodriguez', 'user', 'Active')
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample subcontractors
INSERT INTO subcontractors (subcontractor_id, company_name, contact_name, email, phone, trade, insurance_expiry, license_number, status, address, rating, notes) VALUES
(1, 'Elite Electrical Services', 'John Doe', 'john@eliteelectrical.com', '555-123-4567', 'Electrical', '2025-12-31', 'EL-12345', 'Active', '456 Circuit Ave, Anytown, USA', 4.8, 'Preferred electrical contractor for all projects'),
(2, 'Premier Plumbing Co.', 'Jane Smith', 'jane@premierplumbing.com', '555-987-6543', 'Plumbing', '2025-10-15', 'PL-54321', 'Active', '789 Water Way, Anytown, USA', 4.5, 'Specializes in high-end residential plumbing'),
(3, 'Concrete Masters', 'Mike Johnson', 'mike@concretemaster.com', '555-456-7890', 'Concrete', '2025-08-22', 'CM-98765', 'Active', '123 Foundation Blvd, Anytown, USA', 4.7, 'Excellent for large commercial foundations'),
(4, 'Skyline HVAC Solutions', 'Robert Chen', 'robert@skylinehvac.com', '555-789-1234', 'HVAC', '2025-11-30', 'HVAC-7890', 'Active', '567 Climate Control Dr, Anytown, USA', 4.6, 'Specializes in energy-efficient systems'),
(5, 'Green Landscape Design', 'Sarah Williams', 'sarah@greenlandscape.com', '555-234-5678', 'Landscaping', '2025-09-15', 'LS-4567', 'Active', '890 Garden Path, Anytown, USA', 4.9, 'Sustainable landscaping practices'),
(6, 'Precision Drywall Inc.', 'David Martinez', 'david@precisiondrywall.com', '555-345-6789', 'Drywall', '2025-07-10', 'DW-2345', 'Inactive', '432 Wall Street, Anytown, USA', 3.8, 'Currently inactive due to quality concerns'),
(7, 'Sunrise Painting', 'Lisa Thompson', 'lisa@sunrisepainting.com', '555-456-7890', 'Painting', '2025-06-30', 'PT-3456', 'Active', '765 Color Ave, Anytown, USA', 4.4, 'Excellent for interior finishes')
ON CONFLICT (subcontractor_id) DO NOTHING;

-- Insert sample projects
INSERT INTO projects (project_id, project_name, location, client_name, start_date, end_date, budget, status, created_by) VALUES
(1, 'Smith Residence Renovation', '123 Main St, Anytown, USA', 'John Smith', '2025-01-15', '2025-06-30', 350000, 'Active', 1),
(2, 'Downtown Office Building', '456 Commerce Ave, Anytown, USA', 'ABC Corporation', '2025-02-01', '2026-03-15', 1500000, 'Active', 4),
(3, 'City Park Pavilion', '789 Park Rd, Anytown, USA', 'Anytown Municipality', '2025-03-10', '2025-08-30', 250000, 'Active', 1),
(4, 'Riverside Apartments', '321 River View Dr, Anytown, USA', 'Riverfront Development LLC', '2025-01-05', '2026-05-20', 4200000, 'Planning', 4),
(5, 'Highway 7 Bridge Repair', 'Highway 7, Anytown County', 'State Transportation Department', '2025-04-15', '2025-07-30', 850000, 'Pending', 1)
ON CONFLICT (project_id) DO NOTHING;

-- Insert sample work orders
INSERT INTO work_orders (work_order_id, project_id, assigned_subcontractor_id, description, status, scheduled_date, completion_date, estimated_cost, actual_cost, retainage_percentage, amount_billed, amount_paid, created_by) VALUES
(1, 1, 1, 'Foundation Work', 'In Progress', '2025-02-15', '2025-02-28', 45000, 47500, 10, 47500, 42750, 1),
(2, 1, 2, 'Framing', 'Completed', '2025-03-01', '2025-03-20', 35000, 34200, 5, 34200, 34200, 1),
(3, 2, 3, 'Electrical Installation', 'In Progress', '2025-04-10', NULL, 28000, 15000, 10, 15000, 0, 4),
(4, 2, 4, 'HVAC Installation', 'Completed', '2025-03-15', '2025-04-05', 42000, 43500, 10, 43500, 39150, 4),
(5, 3, 5, 'Site Preparation', 'Completed', '2025-03-10', '2025-03-25', 18000, 17500, 0, 17500, 17500, 1),
(6, 1, NULL, 'Multi-Contractor Kitchen Renovation', 'In Progress', '2025-05-01', NULL, 75000, NULL, 10, 0, 0, 1)
ON CONFLICT (work_order_id) DO NOTHING;

-- Insert contractor assignments for the multi-contractor work order
INSERT INTO contractor_assignments (assignment_id, work_order_id, subcontractor_id, allocation_percentage, allocation_amount, role_description) VALUES
(1, 6, 1, 60.00, 45000, 'Electrical work and lighting installation'),
(2, 6, 2, 40.00, 30000, 'Plumbing and fixture installation')
ON CONFLICT (assignment_id) DO NOTHING;

-- Insert sample locations
INSERT INTO locations (location_id, project_id, location_name, location_type, parent_location_id, description) VALUES
(1, 1, 'Kitchen', 'Room', NULL, 'Main kitchen area'),
(2, 1, 'Master Bedroom', 'Room', NULL, 'Primary bedroom'),
(3, 1, 'Master Bathroom', 'Room', 2, 'Ensuite bathroom'),
(4, 1, 'Living Room', 'Room', NULL, 'Main living area'),
(5, 1, 'Garage', 'Room', NULL, 'Two-car garage'),
(6, 2, 'Lobby', 'Room', NULL, 'Main entrance lobby'),
(7, 2, 'Office Floor 1', 'Floor', NULL, 'First floor offices'),
(8, 2, 'Office Floor 2', 'Floor', NULL, 'Second floor offices')
ON CONFLICT (location_id) DO NOTHING;
