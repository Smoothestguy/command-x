import { Request, Response } from 'express';
import { query } from '../db';

// Get all purchase orders (optionally filtered by work order)
export const getAllPurchaseOrders = async (req: Request, res: Response): Promise<void> => {
    const { workOrderId } = req.query;
    try {
        let queryString = `
            SELECT po.*, v.name as vendor_name 
            FROM purchase_orders po
            LEFT JOIN vendors v ON po.vendor_id = v.vendor_id
        `;
        const queryParams = [];
        
        if (workOrderId) {
            queryString += ' WHERE po.work_order_id = $1';
            queryParams.push(workOrderId);
        }
        
        queryString += ' ORDER BY po.created_at DESC';

        const result = await query(queryString, queryParams);
        
        // For each purchase order, get its items
        const purchaseOrders = result.rows;
        for (const po of purchaseOrders) {
            const itemsResult = await query(
                'SELECT * FROM purchase_order_items WHERE purchase_order_id = $1 ORDER BY po_item_id',
                [po.purchase_order_id]
            );
            po.items = itemsResult.rows;
        }
        
        res.status(200).json(purchaseOrders);
    } catch (error) {
        console.error('Error fetching purchase orders:', error);
        res.status(500).json({ message: 'Internal server error while fetching purchase orders.' });
    }
};

// Get a single purchase order by ID
export const getPurchaseOrderById = async (req: Request, res: Response): Promise<void> => {
    const { purchaseOrderId } = req.params;
    try {
        // Get purchase order
        const poResult = await query(
            `SELECT po.*, v.name as vendor_name, v.* as vendor
            FROM purchase_orders po
            LEFT JOIN vendors v ON po.vendor_id = v.vendor_id
            WHERE po.purchase_order_id = $1`,
            [purchaseOrderId]
        );
        
        if (poResult.rows.length === 0) {
            res.status(404).json({ message: 'Purchase order not found.' });
            return;
        }
        
        const purchaseOrder = poResult.rows[0];
        
        // Get purchase order items
        const itemsResult = await query(
            'SELECT * FROM purchase_order_items WHERE purchase_order_id = $1 ORDER BY po_item_id',
            [purchaseOrderId]
        );
        purchaseOrder.items = itemsResult.rows;
        
        // Get fulfillments
        const fulfillmentsResult = await query(
            `SELECT f.*, v.name as vendor_name
            FROM fulfillments f
            LEFT JOIN vendors v ON f.vendor_id = v.vendor_id
            WHERE f.purchase_order_id = $1
            ORDER BY f.receipt_date DESC`,
            [purchaseOrderId]
        );
        
        // For each fulfillment, get its items
        const fulfillments = fulfillmentsResult.rows;
        for (const fulfillment of fulfillments) {
            const fulfillmentItemsResult = await query(
                `SELECT fi.*, poi.description, poi.unit_of_measure
                FROM fulfillment_items fi
                LEFT JOIN purchase_order_items poi ON fi.po_item_id = poi.po_item_id
                WHERE fi.fulfillment_id = $1`,
                [fulfillment.fulfillment_id]
            );
            fulfillment.items = fulfillmentItemsResult.rows;
        }
        
        purchaseOrder.fulfillments = fulfillments;
        
        res.status(200).json(purchaseOrder);
    } catch (error) {
        console.error(`Error fetching purchase order ${purchaseOrderId}:`, error);
        res.status(500).json({ message: 'Internal server error while fetching purchase order.' });
    }
};

// Create a new purchase order
export const createPurchaseOrder = async (req: Request, res: Response): Promise<void> => {
    const { 
        work_order_id, 
        vendor_id, 
        po_number, 
        status, 
        issue_date, 
        expected_delivery_date, 
        total_amount, 
        notes,
        items 
    } = req.body;
    
    // TODO: Get created_by from authenticated user context
    const created_by = 1; // Placeholder user ID

    if (!work_order_id || !vendor_id || !total_amount) {
        res.status(400).json({ message: 'Work order ID, vendor ID, and total amount are required.' });
        return;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({ message: 'At least one item is required.' });
        return;
    }

    try {
        // Start a transaction
        await query('BEGIN', []);
        
        // Create purchase order
        const poResult = await query(
            `INSERT INTO purchase_orders 
            (work_order_id, vendor_id, po_number, status, issue_date, expected_delivery_date, total_amount, notes, created_by) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING *`,
            [
                work_order_id, 
                vendor_id, 
                po_number, 
                status || 'Draft', 
                issue_date, 
                expected_delivery_date, 
                total_amount, 
                notes, 
                created_by
            ]
        );
        
        const purchaseOrder = poResult.rows[0];
        const purchaseOrderId = purchaseOrder.purchase_order_id;
        
        // Create purchase order items
        for (const item of items) {
            await query(
                `INSERT INTO purchase_order_items 
                (purchase_order_id, description, quantity, unit_price, unit_of_measure, notes) 
                VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    purchaseOrderId, 
                    item.description, 
                    item.quantity, 
                    item.unit_price, 
                    item.unit_of_measure, 
                    item.notes
                ]
            );
        }
        
        // Commit the transaction
        await query('COMMIT', []);
        
        // Return the created purchase order with items
        const result = await getPurchaseOrderById({ params: { purchaseOrderId } } as Request, res as Response);
    } catch (error) {
        // Rollback the transaction in case of error
        await query('ROLLBACK', []);
        console.error('Error creating purchase order:', error);
        res.status(500).json({ message: 'Internal server error while creating purchase order.' });
    }
};

// Update an existing purchase order
export const updatePurchaseOrder = async (req: Request, res: Response): Promise<void> => {
    const { purchaseOrderId } = req.params;
    const { 
        vendor_id, 
        po_number, 
        status, 
        issue_date, 
        expected_delivery_date, 
        total_amount, 
        notes,
        items 
    } = req.body;

    if (!vendor_id || !total_amount) {
        res.status(400).json({ message: 'Vendor ID and total amount are required.' });
        return;
    }

    try {
        // Start a transaction
        await query('BEGIN', []);
        
        // Update purchase order
        const poResult = await query(
            `UPDATE purchase_orders 
            SET vendor_id = $1, po_number = $2, status = $3, issue_date = $4, 
                expected_delivery_date = $5, total_amount = $6, notes = $7, 
                updated_at = CURRENT_TIMESTAMP 
            WHERE purchase_order_id = $8 
            RETURNING *`,
            [
                vendor_id, 
                po_number, 
                status, 
                issue_date, 
                expected_delivery_date, 
                total_amount, 
                notes, 
                purchaseOrderId
            ]
        );
        
        if (poResult.rows.length === 0) {
            await query('ROLLBACK', []);
            res.status(404).json({ message: 'Purchase order not found.' });
            return;
        }
        
        // If items are provided, update them
        if (items && Array.isArray(items)) {
            // First, get existing items to determine which to update, add, or remove
            const existingItemsResult = await query(
                'SELECT po_item_id FROM purchase_order_items WHERE purchase_order_id = $1',
                [purchaseOrderId]
            );
            
            const existingItemIds = existingItemsResult.rows.map(item => item.po_item_id);
            const updatedItemIds = items.filter(item => item.po_item_id).map(item => item.po_item_id);
            
            // Items to delete (existing but not in updated list)
            const itemsToDelete = existingItemIds.filter(id => !updatedItemIds.includes(id));
            
            // Delete items that are no longer in the list
            for (const itemId of itemsToDelete) {
                await query(
                    'DELETE FROM purchase_order_items WHERE po_item_id = $1',
                    [itemId]
                );
            }
            
            // Update or insert items
            for (const item of items) {
                if (item.po_item_id) {
                    // Update existing item
                    await query(
                        `UPDATE purchase_order_items 
                        SET description = $1, quantity = $2, unit_price = $3, 
                            unit_of_measure = $4, notes = $5, updated_at = CURRENT_TIMESTAMP 
                        WHERE po_item_id = $6`,
                        [
                            item.description, 
                            item.quantity, 
                            item.unit_price, 
                            item.unit_of_measure, 
                            item.notes, 
                            item.po_item_id
                        ]
                    );
                } else {
                    // Insert new item
                    await query(
                        `INSERT INTO purchase_order_items 
                        (purchase_order_id, description, quantity, unit_price, unit_of_measure, notes) 
                        VALUES ($1, $2, $3, $4, $5, $6)`,
                        [
                            purchaseOrderId, 
                            item.description, 
                            item.quantity, 
                            item.unit_price, 
                            item.unit_of_measure, 
                            item.notes
                        ]
                    );
                }
            }
        }
        
        // Commit the transaction
        await query('COMMIT', []);
        
        // Return the updated purchase order with items
        const result = await getPurchaseOrderById({ params: { purchaseOrderId } } as Request, res as Response);
    } catch (error) {
        // Rollback the transaction in case of error
        await query('ROLLBACK', []);
        console.error(`Error updating purchase order ${purchaseOrderId}:`, error);
        res.status(500).json({ message: 'Internal server error while updating purchase order.' });
    }
};

// Delete a purchase order
export const deletePurchaseOrder = async (req: Request, res: Response): Promise<void> => {
    const { purchaseOrderId } = req.params;
    try {
        // Check if the purchase order has any fulfillments
        const fulfillmentsResult = await query(
            'SELECT COUNT(*) FROM fulfillments WHERE purchase_order_id = $1',
            [purchaseOrderId]
        );
        
        if (parseInt(fulfillmentsResult.rows[0].count) > 0) {
            res.status(400).json({ 
                message: 'Cannot delete purchase order with fulfillments. Cancel it instead.' 
            });
            return;
        }
        
        // Start a transaction
        await query('BEGIN', []);
        
        // Delete purchase order items first (should cascade, but being explicit)
        await query(
            'DELETE FROM purchase_order_items WHERE purchase_order_id = $1',
            [purchaseOrderId]
        );
        
        // Delete the purchase order
        const result = await query(
            'DELETE FROM purchase_orders WHERE purchase_order_id = $1 RETURNING purchase_order_id',
            [purchaseOrderId]
        );
        
        if (result.rows.length === 0) {
            await query('ROLLBACK', []);
            res.status(404).json({ message: 'Purchase order not found.' });
            return;
        }
        
        // Commit the transaction
        await query('COMMIT', []);
        
        res.status(200).json({ message: 'Purchase order deleted successfully.' });
    } catch (error) {
        // Rollback the transaction in case of error
        await query('ROLLBACK', []);
        console.error(`Error deleting purchase order ${purchaseOrderId}:`, error);
        res.status(500).json({ message: 'Internal server error while deleting purchase order.' });
    }
};
