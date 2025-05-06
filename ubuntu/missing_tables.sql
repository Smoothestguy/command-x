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

-- Create indexes for the new tables
CREATE INDEX idx_inspections_project_id ON inspections(project_id);
CREATE INDEX idx_inspections_work_order_id ON inspections(work_order_id);
CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_issues_project_id ON issues(project_id);
CREATE INDEX idx_issues_work_order_id ON issues(work_order_id);
CREATE INDEX idx_issues_inspection_id ON issues(inspection_id);
CREATE INDEX idx_issues_status ON issues(status);
