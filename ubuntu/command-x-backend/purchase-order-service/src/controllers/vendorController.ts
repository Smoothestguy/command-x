import { Request, Response } from 'express';
import { query } from '../db';

// Get all vendors
export const getAllVendors = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await query(
            'SELECT * FROM vendors WHERE is_active = TRUE ORDER BY name',
            []
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching vendors:', error);
        res.status(500).json({ message: 'Internal server error while fetching vendors.' });
    }
};

// Get a single vendor by ID
export const getVendorById = async (req: Request, res: Response): Promise<void> => {
    const { vendorId } = req.params;
    try {
        const result = await query(
            'SELECT * FROM vendors WHERE vendor_id = $1',
            [vendorId]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Vendor not found.' });
            return;
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(`Error fetching vendor ${vendorId}:`, error);
        res.status(500).json({ message: 'Internal server error while fetching vendor.' });
    }
};

// Create a new vendor
export const createVendor = async (req: Request, res: Response): Promise<void> => {
    const { name, contact_name, email, phone, address, payment_terms, notes, is_active } = req.body;

    if (!name) {
        res.status(400).json({ message: 'Vendor name is required.' });
        return;
    }

    try {
        const result = await query(
            `INSERT INTO vendors 
            (name, contact_name, email, phone, address, payment_terms, notes, is_active) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *`,
            [name, contact_name, email, phone, address, payment_terms, notes, is_active !== undefined ? is_active : true]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating vendor:', error);
        res.status(500).json({ message: 'Internal server error while creating vendor.' });
    }
};

// Update an existing vendor
export const updateVendor = async (req: Request, res: Response): Promise<void> => {
    const { vendorId } = req.params;
    const { name, contact_name, email, phone, address, payment_terms, notes, is_active } = req.body;

    if (!name) {
        res.status(400).json({ message: 'Vendor name is required.' });
        return;
    }

    try {
        const result = await query(
            `UPDATE vendors 
            SET name = $1, contact_name = $2, email = $3, phone = $4, 
                address = $5, payment_terms = $6, notes = $7, is_active = $8, 
                updated_at = CURRENT_TIMESTAMP 
            WHERE vendor_id = $9 
            RETURNING *`,
            [name, contact_name, email, phone, address, payment_terms, notes, is_active, vendorId]
        );
        
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Vendor not found.' });
            return;
        }
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(`Error updating vendor ${vendorId}:`, error);
        res.status(500).json({ message: 'Internal server error while updating vendor.' });
    }
};

// Delete a vendor (soft delete by setting is_active to false)
export const deleteVendor = async (req: Request, res: Response): Promise<void> => {
    const { vendorId } = req.params;
    try {
        const result = await query(
            'UPDATE vendors SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE vendor_id = $1 RETURNING vendor_id',
            [vendorId]
        );
        
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Vendor not found.' });
            return;
        }
        
        res.status(200).json({ message: 'Vendor deleted successfully.' });
    } catch (error) {
        console.error(`Error deleting vendor ${vendorId}:`, error);
        res.status(500).json({ message: 'Internal server error while deleting vendor.' });
    }
};
