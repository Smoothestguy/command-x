-- Enable TimescaleDB extension if not already enabled
-- CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Users and Permissions Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Store hashed passwords only
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- e.g., 'admin', 'project_manager', 'field_worker', 'subcontractor_contact'
    status VARCHAR(50) DEFAULT 'Active' NOT NULL, -- Added status column
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    -- Add fields for HIPAA/GDPR compliance if necessary (e.g., consent flags)
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Permissions Table (Example - could be more granular)
-- CREATE TABLE permissions (
--     permission_id SERIAL PRIMARY KEY,
--     role VARCHAR(50) NOT NULL,
--     resource VARCHAR(100) NOT NULL, -- e.g., 'projects', 'work_orders/financials'
--     can_create BOOLEAN DEFAULT FALSE,
--     can_read BOOLEAN DEFAULT FALSE,
--     can_update BOOLEAN DEFAULT FALSE,
--     can_delete BOOLEAN DEFAULT FALSE,
--     UNIQUE (role, resource)
-- );

-- Subcontractors Table
CREATE TABLE subcontractors (
    subcontractor_id SERIAL PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL,
    address TEXT,
    phone_number VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    primary_contact_name VARCHAR(100),
    primary_contact_email VARCHAR(100),
    primary_contact_phone VARCHAR(20),
    performance_rating NUMERIC(3, 2) DEFAULT NULL, -- e.g., 1.00 to 5.00
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for subcontractors table
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON subcontractors
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Projects Table
CREATE TABLE projects (
    project_id SERIAL PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    location TEXT,
    client_name VARCHAR(150),
    start_date DATE,
    end_date DATE,
    budget NUMERIC(15, 2),
    status VARCHAR(50) DEFAULT 'Planning', -- e.g., Planning, Active, Completed, On Hold
    created_by INT REFERENCES users(user_id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for projects table
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Work Orders Table
CREATE TYPE work_order_status AS ENUM ('Pending', 'Assigned', 'Started', 'In Progress', 'Quality Check', 'Completed', 'Cancelled');

CREATE TABLE work_orders (
    work_order_id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    assigned_subcontractor_id INT REFERENCES subcontractors(subcontractor_id),
    description TEXT NOT NULL,
    status work_order_status DEFAULT 'Pending',
    scheduled_date DATE,
    completion_date DATE,
    estimated_cost NUMERIC(12, 2),
    actual_cost NUMERIC(12, 2),
    retainage_percentage NUMERIC(5, 2) DEFAULT 0.00,
    amount_billed NUMERIC(12, 2) DEFAULT 0.00,
    amount_paid NUMERIC(12, 2) DEFAULT 0.00,
    created_by INT REFERENCES users(user_id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for work_orders table
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON work_orders
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Line Items Table (Tasks within Work Orders)
CREATE TYPE line_item_status AS ENUM ('Not Started', 'In Progress', 'Completed', 'Blocked');

CREATE TABLE line_items (
    line_item_id SERIAL PRIMARY KEY,
    work_order_id INT NOT NULL REFERENCES work_orders(work_order_id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2),
    unit_cost NUMERIC(10, 2),
    total_cost NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
    status line_item_status DEFAULT 'Not Started',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for line_items table
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON line_items
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Documents and Files Table
CREATE TABLE documents (
    document_id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(project_id) ON DELETE SET NULL,
    work_order_id INT REFERENCES work_orders(work_order_id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL UNIQUE, -- Path in storage (e.g., S3 bucket URL or local path)
    file_type VARCHAR(100), -- MIME type
    file_size BIGINT, -- Size in bytes
    version INT DEFAULT 1,
    description TEXT,
    uploaded_by INT REFERENCES users(user_id),
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    -- Add fields for access control if needed
);

-- Trigger for documents table
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Quality Control Inspections Table
CREATE TYPE inspection_status AS ENUM ('Scheduled', 'In Progress', 'Passed', 'Failed', 'Correction Required', 'Verified');

CREATE TABLE quality_inspections (
    inspection_id SERIAL PRIMARY KEY,
    work_order_id INT NOT NULL REFERENCES work_orders(work_order_id) ON DELETE CASCADE,
    line_item_id INT REFERENCES line_items(line_item_id) ON DELETE SET NULL, -- Optional: link to specific line item
    inspection_date TIMESTAMPTZ,
    inspector_id INT REFERENCES users(user_id),
    status inspection_status DEFAULT 'Scheduled',
    notes TEXT,
    correction_details TEXT, -- Details if failed/correction required
    verified_date TIMESTAMPTZ, -- Date when correction was verified
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for quality_inspections table
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON quality_inspections
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Inspection Photos/Documents (linking documents to inspections)
CREATE TABLE inspection_attachments (
    attachment_id SERIAL PRIMARY KEY,
    inspection_id INT NOT NULL REFERENCES quality_inspections(inspection_id) ON DELETE CASCADE,
    document_id INT NOT NULL REFERENCES documents(document_id) ON DELETE CASCADE,
    UNIQUE (inspection_id, document_id) -- Prevent duplicate attachments
);

-- Financial Transactions Table (for payments, invoices, etc.)
CREATE TYPE transaction_type AS ENUM ('Invoice', 'Payment Received', 'Payment Made', 'Retainage Held', 'Retainage Released');

CREATE TABLE financial_transactions (
    transaction_id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(project_id) ON DELETE SET NULL,
    work_order_id INT REFERENCES work_orders(work_order_id) ON DELETE SET NULL,
    subcontractor_id INT REFERENCES subcontractors(subcontractor_id) ON DELETE SET NULL,
    transaction_type transaction_type NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    transaction_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    related_invoice_id VARCHAR(100), -- Link to external invoice system or internal ID
    recorded_by INT REFERENCES users(user_id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    -- No updated_at needed typically for transaction records
);

-- Convert financial_transactions to hypertable using TimescaleDB for time-series analysis
-- SELECT create_hypertable('financial_transactions', 'transaction_date');

-- Audit Log Table (Example - could use TimescaleDB)
CREATE TABLE audit_log (
    log_id BIGSERIAL PRIMARY KEY,
    log_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL, -- e.g., 'CREATE_PROJECT', 'UPDATE_WORK_ORDER_STATUS'
    target_type VARCHAR(100), -- e.g., 'Project', 'WorkOrder'
    target_id VARCHAR(100), -- e.g., project_id, work_order_id
    details JSONB -- Store changes or relevant info as JSON
);

-- Convert audit_log to hypertable using TimescaleDB
-- SELECT create_hypertable('audit_log', 'log_time');

-- Add Indexes for performance
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_work_orders_project_id ON work_orders(project_id);
CREATE INDEX idx_work_orders_subcontractor_id ON work_orders(assigned_subcontractor_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_line_items_work_order_id ON line_items(work_order_id);
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_work_order_id ON documents(work_order_id);
CREATE INDEX idx_quality_inspections_work_order_id ON quality_inspections(work_order_id);
CREATE INDEX idx_quality_inspections_status ON quality_inspections(status);
CREATE INDEX idx_financial_transactions_project_id ON financial_transactions(project_id);
CREATE INDEX idx_financial_transactions_work_order_id ON financial_transactions(work_order_id);
CREATE INDEX idx_financial_transactions_subcontractor_id ON financial_transactions(subcontractor_id);
CREATE INDEX idx_financial_transactions_type ON financial_transactions(transaction_type);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_target ON audit_log(target_type, target_id);

-- Note: TimescaleDB automatically creates efficient time-based indexes on hypertables.
-- Note: The actual commands to enable TimescaleDB extension and create hypertables (`CREATE EXTENSION`, `create_hypertable`)
-- would typically be run separately by a database administrator or during initial setup,
-- but are included here as comments for completeness.

