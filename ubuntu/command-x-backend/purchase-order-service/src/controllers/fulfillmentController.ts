import { Request, Response } from 'express';
import { query } from '../db';

// Get all fulfillments for a purchase order
export const getFulfillments = async (req: Request, res: Response): Promise<void> => {
    const { purchaseOrderId } = req.params;
    try {
        const result = await query(
            `SELECT f.*, v.name as vendor_name
            FROM fulfillments f
            LEFT JOIN vendors v ON f.vendor_id = v.vendor_id
            WHERE f.purchase_order_id = $1
            ORDER BY f.receipt_date DESC`,
            [purchaseOrderId]
        );
        
        // For each fulfillment, get its items
        const fulfillments = result.rows;
        for (const fulfillment of fulfillments) {
            const itemsResult = await query(
                `SELECT fi.*, poi.description, poi.unit_of_measure
                FROM fulfillment_items fi
                LEFT JOIN purchase_order_items poi ON fi.po_item_id = poi.po_item_id
                WHERE fi.fulfillment_id = $1`,
                [fulfillment.fulfillment_id]
            );
            fulfillment.items = itemsResult.rows;
        }
        
        res.status(200).json(fulfillments);
    } catch (error) {
        console.error(`Error fetching fulfillments for purchase order ${purchaseOrderId}:`, error);
        res.status(500).json({ message: 'Internal server error while fetching fulfillments.' });
    }
};

// Get a single fulfillment by ID
export const getFulfillmentById = async (req: Request, res: Response): Promise<void> => {
    const { fulfillmentId } = req.params;
    try {
        const result = await query(
            `SELECT f.*, v.name as vendor_name
            FROM fulfillments f
            LEFT JOIN vendors v ON f.vendor_id = v.vendor_id
            WHERE f.fulfillment_id = $1`,
            [fulfillmentId]
        );
        
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Fulfillment not found.' });
            return;
        }
        
        const fulfillment = result.rows[0];
        
        // Get fulfillment items
        const itemsResult = await query(
            `SELECT fi.*, poi.description, poi.unit_of_measure
            FROM fulfillment_items fi
            LEFT JOIN purchase_order_items poi ON fi.po_item_id = poi.po_item_id
            WHERE fi.fulfillment_id = $1`,
            [fulfillmentId]
        );
        fulfillment.items = itemsResult.rows;
        
        res.status(200).json(fulfillment);
    } catch (error) {
        console.error(`Error fetching fulfillment ${fulfillmentId}:`, error);
        res.status(500).json({ message: 'Internal server error while fetching fulfillment.' });
    }
};

// Create a new fulfillment
export const createFulfillment = async (req: Request, res: Response): Promise<void> => {
    const { 
        purchase_order_id, 
        vendor_id, 
        receipt_date, 
        receipt_number, 
        notes,
        items 
    } = req.body;
    
    // TODO: Get created_by from authenticated user context
    const created_by = 1; // Placeholder user ID

    if (!purchase_order_id || !vendor_id || !receipt_date) {
        res.status(400).json({ message: 'Purchase order ID, vendor ID, and receipt date are required.' });
        return;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({ message: 'At least one item is required.' });
        return;
    }

    try {
        // Start a transaction
        await query('BEGIN', []);
        
        // Calculate total amount from items
        let totalAmount = 0;
        for (const item of items) {
            totalAmount += item.quantity_received * item.unit_price;
        }
        
        // Create fulfillment
        const fulfillmentResult = await query(
            `INSERT INTO fulfillments 
            (purchase_order_id, vendor_id, receipt_date, receipt_number, notes, total_amount, created_by) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`,
            [
                purchase_order_id, 
                vendor_id, 
                receipt_date, 
                receipt_number, 
                notes, 
                totalAmount, 
                created_by
            ]
        );
        
        const fulfillment = fulfillmentResult.rows[0];
        const fulfillmentId = fulfillment.fulfillment_id;
        
        // Create fulfillment items
        for (const item of items) {
            if (item.quantity_received <= 0) continue;
            
            await query(
                `INSERT INTO fulfillment_items 
                (fulfillment_id, po_item_id, quantity_received, unit_price, notes) 
                VALUES ($1, $2, $3, $4, $5)`,
                [
                    fulfillmentId, 
                    item.po_item_id, 
                    item.quantity_received, 
                    item.unit_price, 
                    item.notes
                ]
            );
        }
        
        // Commit the transaction
        await query('COMMIT', []);
        
        // Return the created fulfillment with items
        const result = await getFulfillmentById({ params: { fulfillmentId } } as Request, res as Response);
    } catch (error) {
        // Rollback the transaction in case of error
        await query('ROLLBACK', []);
        console.error('Error creating fulfillment:', error);
        res.status(500).json({ message: 'Internal server error while creating fulfillment.' });
    }
};

// Delete a fulfillment
export const deleteFulfillment = async (req: Request, res: Response): Promise<void> => {
    const { fulfillmentId } = req.params;
    try {
        // Start a transaction
        await query('BEGIN', []);
        
        // Delete fulfillment items first (should cascade, but being explicit)
        await query(
            'DELETE FROM fulfillment_items WHERE fulfillment_id = $1',
            [fulfillmentId]
        );
        
        // Delete the fulfillment
        const result = await query(
            'DELETE FROM fulfillments WHERE fulfillment_id = $1 RETURNING fulfillment_id',
            [fulfillmentId]
        );
        
        if (result.rows.length === 0) {
            await query('ROLLBACK', []);
            res.status(404).json({ message: 'Fulfillment not found.' });
            return;
        }
        
        // Commit the transaction
        await query('COMMIT', []);
        
        res.status(200).json({ message: 'Fulfillment deleted successfully.' });
    } catch (error) {
        // Rollback the transaction in case of error
        await query('ROLLBACK', []);
        console.error(`Error deleting fulfillment ${fulfillmentId}:`, error);
        res.status(500).json({ message: 'Internal server error while deleting fulfillment.' });
    }
};

// Split a purchase order
export const splitPurchaseOrder = async (req: Request, res: Response): Promise<void> => {
    const { 
        original_po_id, 
        new_vendor_id, 
        items,
        notes 
    } = req.body;
    
    // TODO: Get created_by from authenticated user context
    const created_by = 1; // Placeholder user ID

    if (!original_po_id || !new_vendor_id || !items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({ 
            message: 'Original purchase order ID, new vendor ID, and items to split are required.' 
        });
        return;
    }

    try {
        // Start a transaction
        await query('BEGIN', []);
        
        // Get original purchase order
        const originalPoResult = await query(
            'SELECT * FROM purchase_orders WHERE purchase_order_id = $1',
            [original_po_id]
        );
        
        if (originalPoResult.rows.length === 0) {
            await query('ROLLBACK', []);
            res.status(404).json({ message: 'Original purchase order not found.' });
            return;
        }
        
        const originalPo = originalPoResult.rows[0];
        
        // Calculate total amount for new purchase order
        let totalAmount = 0;
        for (const item of items) {
            // Get original item details
            const originalItemResult = await query(
                'SELECT * FROM purchase_order_items WHERE po_item_id = $1',
                [item.po_item_id]
            );
            
            if (originalItemResult.rows.length === 0) {
                await query('ROLLBACK', []);
                res.status(404).json({ message: `Item ${item.po_item_id} not found.` });
                return;
            }
            
            const originalItem = originalItemResult.rows[0];
            
            // Ensure quantity to split doesn't exceed remaining quantity
            const remainingQuantity = originalItem.quantity_remaining;
            if (item.quantity_to_split > remainingQuantity) {
                await query('ROLLBACK', []);
                res.status(400).json({ 
                    message: `Cannot split more than the remaining quantity (${remainingQuantity}) for item ${item.po_item_id}.` 
                });
                return;
            }
            
            totalAmount += item.quantity_to_split * originalItem.unit_price;
        }
        
        // Create new purchase order
        const newPoResult = await query(
            `INSERT INTO purchase_orders 
            (work_order_id, vendor_id, po_number, status, issue_date, expected_delivery_date, total_amount, notes, created_by) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING *`,
            [
                originalPo.work_order_id,
                new_vendor_id,
                `${originalPo.po_number}-SPLIT`,
                'Draft',
                new Date().toISOString().split('T')[0], // Today
                originalPo.expected_delivery_date,
                totalAmount,
                notes || `Split from PO #${originalPo.po_number}`,
                created_by
            ]
        );
        
        const newPo = newPoResult.rows[0];
        
        // Create new items for the split purchase order
        for (const item of items) {
            // Get original item details
            const originalItemResult = await query(
                'SELECT * FROM purchase_order_items WHERE po_item_id = $1',
                [item.po_item_id]
            );
            
            const originalItem = originalItemResult.rows[0];
            
            // Create new item
            await query(
                `INSERT INTO purchase_order_items 
                (purchase_order_id, description, quantity, unit_price, unit_of_measure, notes) 
                VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    newPo.purchase_order_id,
                    originalItem.description,
                    item.quantity_to_split,
                    originalItem.unit_price,
                    originalItem.unit_of_measure,
                    originalItem.notes
                ]
            );
            
            // Update original item quantity
            await query(
                'UPDATE purchase_order_items SET quantity = quantity - $1 WHERE po_item_id = $2',
                [item.quantity_to_split, item.po_item_id]
            );
        }
        
        // Update original purchase order total amount
        await query(
            'UPDATE purchase_orders SET total_amount = total_amount - $1 WHERE purchase_order_id = $2',
            [totalAmount, original_po_id]
        );
        
        // Commit the transaction
        await query('COMMIT', []);
        
        // Return the new purchase order
        const result = await getPurchaseOrderById({ params: { purchaseOrderId: newPo.purchase_order_id } } as Request, res as Response);
    } catch (error) {
        // Rollback the transaction in case of error
        await query('ROLLBACK', []);
        console.error('Error splitting purchase order:', error);
        res.status(500).json({ message: 'Internal server error while splitting purchase order.' });
    }
};

// Helper function to get a purchase order by ID (used internally)
const getPurchaseOrderById = async (req: Request, res: Response): Promise<void> => {
    const { purchaseOrderId } = req.params;
    try {
        // Get purchase order
        const poResult = await query(
            `SELECT po.*, v.name as vendor_name
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
        
        res.status(200).json(purchaseOrder);
    } catch (error) {
        console.error(`Error fetching purchase order ${purchaseOrderId}:`, error);
        res.status(500).json({ message: 'Internal server error while fetching purchase order.' });
    }
};
