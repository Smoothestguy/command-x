import { Request, Response } from 'express';
import { query } from '../db';

// Get all work orders (potentially filtered by project)
export const getAllWorkOrders = async (req: Request, res: Response): Promise<void> => {
    const { projectId } = req.query; // Optional filter by project_id
    try {
        let queryString = 'SELECT * FROM work_orders';
        const queryParams = [];
        if (projectId) {
            queryString += ' WHERE project_id = $1';
            queryParams.push(projectId);
        }
        queryString += ' ORDER BY created_at DESC';

        const result = await query(queryString, queryParams);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching work orders:', error);
        res.status(500).json({ message: 'Internal server error while fetching work orders.' });
    }
};

// Get a single work order by ID
export const getWorkOrderById = async (req: Request, res: Response): Promise<void> => {
    const { workOrderId } = req.params;
    try {
        const result = await query('SELECT * FROM work_orders WHERE work_order_id = $1', [workOrderId]);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Work order not found.' });
            return;
        }
        // Optionally fetch line items as well
        const lineItemsResult = await query('SELECT * FROM line_items WHERE work_order_id = $1 ORDER BY line_item_id', [workOrderId]);
        const workOrder = result.rows[0];
        workOrder.line_items = lineItemsResult.rows;

        res.status(200).json(workOrder);
    } catch (error) {
        console.error(`Error fetching work order ${workOrderId}:`, error);
        res.status(500).json({ message: 'Internal server error while fetching work order.' });
    }
};

// Create a new work order
export const createWorkOrder = async (req: Request, res: Response): Promise<void> => {
    const { project_id, assigned_subcontractor_id, description, status, scheduled_date, estimated_cost, retainage_percentage } = req.body;
    // TODO: Get created_by from authenticated user context
    const created_by = 1; // Placeholder user ID

    if (!project_id || !description) {
        res.status(400).json({ message: 'Project ID and description are required.' });
        return;
    }

    try {
        const result = await query(
            'INSERT INTO work_orders (project_id, assigned_subcontractor_id, description, status, scheduled_date, estimated_cost, retainage_percentage, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [project_id, assigned_subcontractor_id, description, status || 'Pending', scheduled_date, estimated_cost, retainage_percentage || 0, created_by]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating work order:', error);
        res.status(500).json({ message: 'Internal server error while creating work order.' });
    }
};

// Update an existing work order
export const updateWorkOrder = async (req: Request, res: Response): Promise<void> => {
    const { workOrderId } = req.params;
    const { assigned_subcontractor_id, description, status, scheduled_date, completion_date, estimated_cost, actual_cost, retainage_percentage, amount_billed, amount_paid } = req.body;

    // Add more validation as needed
    if (!description) {
        res.status(400).json({ message: 'Description is required.' });
        return;
    }

    try {
        const result = await query(
            'UPDATE work_orders SET assigned_subcontractor_id = $1, description = $2, status = $3, scheduled_date = $4, completion_date = $5, estimated_cost = $6, actual_cost = $7, retainage_percentage = $8, amount_billed = $9, amount_paid = $10, updated_at = CURRENT_TIMESTAMP WHERE work_order_id = $11 RETURNING *',
            [assigned_subcontractor_id, description, status, scheduled_date, completion_date, estimated_cost, actual_cost, retainage_percentage, amount_billed, amount_paid, workOrderId]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Work order not found.' });
            return;
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(`Error updating work order ${workOrderId}:`, error);
        res.status(500).json({ message: 'Internal server error while updating work order.' });
    }
};

// Delete a work order
export const deleteWorkOrder = async (req: Request, res: Response): Promise<void> => {
    const { workOrderId } = req.params;
    try {
        // Consider implications: deleting a work order might require deleting related line items, inspections etc., or setting them to a specific status.
        // For simplicity, we just delete the work order here. Use ON DELETE CASCADE in schema carefully.
        const result = await query('DELETE FROM work_orders WHERE work_order_id = $1 RETURNING work_order_id', [workOrderId]);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Work order not found.' });
            return;
        }
        res.status(204).send(); // No content on successful deletion
    } catch (error) {
        console.error(`Error deleting work order ${workOrderId}:`, error);
        res.status(500).json({ message: 'Internal server error while deleting work order.' });
    }
};

// --- Line Item Controllers --- (Can be in a separate controller file)

export const addLineItem = async (req: Request, res: Response): Promise<void> => {
    const { workOrderId } = req.params;
    const { description, quantity, unit_cost, status } = req.body;

    if (!description) {
        res.status(400).json({ message: 'Line item description is required.' });
        return;
    }

    try {
        const result = await query(
            'INSERT INTO line_items (work_order_id, description, quantity, unit_cost, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [workOrderId, description, quantity, unit_cost, status || 'Not Started']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(`Error adding line item to work order ${workOrderId}:`, error);
        res.status(500).json({ message: 'Internal server error while adding line item.' });
    }
};

export const updateLineItem = async (req: Request, res: Response): Promise<void> => {
    const { lineItemId } = req.params;
    const { description, quantity, unit_cost, status } = req.body;

    if (!description) {
        res.status(400).json({ message: 'Line item description is required.' });
        return;
    }

    try {
        const result = await query(
            'UPDATE line_items SET description = $1, quantity = $2, unit_cost = $3, status = $4, updated_at = CURRENT_TIMESTAMP WHERE line_item_id = $5 RETURNING *',
            [description, quantity, unit_cost, status, lineItemId]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Line item not found.' });
            return;
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(`Error updating line item ${lineItemId}:`, error);
        res.status(500).json({ message: 'Internal server error while updating line item.' });
    }
};

export const deleteLineItem = async (req: Request, res: Response): Promise<void> => {
    const { lineItemId } = req.params;
    try {
        const result = await query('DELETE FROM line_items WHERE line_item_id = $1 RETURNING line_item_id', [lineItemId]);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Line item not found.' });
            return;
        }
        res.status(204).send();
    } catch (error) {
        console.error(`Error deleting line item ${lineItemId}:`, error);
        res.status(500).json({ message: 'Internal server error while deleting line item.' });
    }
};

