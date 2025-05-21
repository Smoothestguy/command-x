-- Purchase Order System Schema
-- This schema adds support for purchase orders, vendors, and partial fulfillments

-- Vendors Table
CREATE TABLE vendors (
    vendor_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    contact_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    payment_terms VARCHAR(50),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for vendors table
CREATE TRIGGER set_timestamp_vendors
BEFORE UPDATE ON vendors
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Purchase Order Status Type
CREATE TYPE purchase_order_status AS ENUM ('Draft', 'Sent', 'Partially Fulfilled', 'Fulfilled', 'Cancelled');

-- Purchase Orders Table
CREATE TABLE purchase_orders (
    purchase_order_id SERIAL PRIMARY KEY,
    work_order_id INT NOT NULL REFERENCES work_orders(work_order_id) ON DELETE CASCADE,
    vendor_id INT NOT NULL REFERENCES vendors(vendor_id),
    po_number VARCHAR(50),
    status purchase_order_status DEFAULT 'Draft',
    issue_date DATE,
    expected_delivery_date DATE,
    total_amount NUMERIC(12, 2) NOT NULL,
    notes TEXT,
    created_by INT REFERENCES users(user_id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for purchase_orders table
CREATE TRIGGER set_timestamp_purchase_orders
BEFORE UPDATE ON purchase_orders
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Purchase Order Items Table
CREATE TABLE purchase_order_items (
    po_item_id SERIAL PRIMARY KEY,
    purchase_order_id INT NOT NULL REFERENCES purchase_orders(purchase_order_id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    unit_of_measure VARCHAR(50),
    quantity_fulfilled NUMERIC(10, 2) DEFAULT 0,
    quantity_remaining NUMERIC(10, 2) GENERATED ALWAYS AS (quantity - quantity_fulfilled) STORED,
    status VARCHAR(50) DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for purchase_order_items table
CREATE TRIGGER set_timestamp_po_items
BEFORE UPDATE ON purchase_order_items
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Fulfillments Table
CREATE TABLE fulfillments (
    fulfillment_id SERIAL PRIMARY KEY,
    purchase_order_id INT NOT NULL REFERENCES purchase_orders(purchase_order_id) ON DELETE CASCADE,
    vendor_id INT NOT NULL REFERENCES vendors(vendor_id),
    receipt_date DATE NOT NULL,
    receipt_number VARCHAR(50),
    notes TEXT,
    total_amount NUMERIC(12, 2),
    created_by INT REFERENCES users(user_id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Fulfillment Items Table
CREATE TABLE fulfillment_items (
    fulfillment_item_id SERIAL PRIMARY KEY,
    fulfillment_id INT NOT NULL REFERENCES fulfillments(fulfillment_id) ON DELETE CASCADE,
    po_item_id INT NOT NULL REFERENCES purchase_order_items(po_item_id),
    quantity_received NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(12, 2) GENERATED ALWAYS AS (quantity_received * unit_price) STORED,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Function to update purchase order status based on fulfillments
CREATE OR REPLACE FUNCTION update_po_status()
RETURNS TRIGGER AS $$
DECLARE
    total_items INT;
    fulfilled_items INT;
    partially_fulfilled_items INT;
BEGIN
    -- Count total items in the purchase order
    SELECT COUNT(*) INTO total_items
    FROM purchase_order_items
    WHERE purchase_order_id = NEW.purchase_order_id;
    
    -- Count fully fulfilled items
    SELECT COUNT(*) INTO fulfilled_items
    FROM purchase_order_items
    WHERE purchase_order_id = NEW.purchase_order_id
    AND quantity_fulfilled >= quantity;
    
    -- Count partially fulfilled items
    SELECT COUNT(*) INTO partially_fulfilled_items
    FROM purchase_order_items
    WHERE purchase_order_id = NEW.purchase_order_id
    AND quantity_fulfilled > 0
    AND quantity_fulfilled < quantity;
    
    -- Update purchase order status
    IF fulfilled_items = total_items THEN
        UPDATE purchase_orders
        SET status = 'Fulfilled'
        WHERE purchase_order_id = NEW.purchase_order_id;
    ELSIF fulfilled_items > 0 OR partially_fulfilled_items > 0 THEN
        UPDATE purchase_orders
        SET status = 'Partially Fulfilled'
        WHERE purchase_order_id = NEW.purchase_order_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update purchase order status after fulfillment
CREATE TRIGGER update_po_status_trigger
AFTER INSERT OR UPDATE ON fulfillment_items
FOR EACH ROW
EXECUTE PROCEDURE update_po_status();

-- Function to update purchase order item quantity_fulfilled
CREATE OR REPLACE FUNCTION update_po_item_fulfillment()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the quantity_fulfilled in the purchase_order_items table
    UPDATE purchase_order_items
    SET quantity_fulfilled = (
        SELECT COALESCE(SUM(quantity_received), 0)
        FROM fulfillment_items
        WHERE po_item_id = NEW.po_item_id
    )
    WHERE po_item_id = NEW.po_item_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update purchase order item fulfillment after fulfillment item changes
CREATE TRIGGER update_po_item_fulfillment_trigger
AFTER INSERT OR UPDATE OR DELETE ON fulfillment_items
FOR EACH ROW
EXECUTE PROCEDURE update_po_item_fulfillment();

-- Add indexes for performance
CREATE INDEX idx_purchase_orders_work_order_id ON purchase_orders(work_order_id);
CREATE INDEX idx_purchase_orders_vendor_id ON purchase_orders(vendor_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_order_items_purchase_order_id ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_fulfillments_purchase_order_id ON fulfillments(purchase_order_id);
CREATE INDEX idx_fulfillments_vendor_id ON fulfillments(vendor_id);
CREATE INDEX idx_fulfillment_items_fulfillment_id ON fulfillment_items(fulfillment_id);
CREATE INDEX idx_fulfillment_items_po_item_id ON fulfillment_items(po_item_id);
