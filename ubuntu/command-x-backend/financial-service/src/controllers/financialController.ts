import { Request, Response } from 'express';
import { query } from '../db';

// Record a financial transaction
export const recordTransaction = async (req: Request, res: Response): Promise<void> => {
    const {
        project_id,
        work_order_id,
        subcontractor_id,
        transaction_type,
        amount,
        transaction_date,
        description,
        related_invoice_id
    } = req.body;
    // TODO: Get recorded_by from authenticated user context
    const recorded_by = 1; // Placeholder user ID

    if (!transaction_type || amount === undefined) {
        res.status(400).json({ message: 'Transaction type and amount are required.' });
        return;
    }

    try {
        const result = await query(
            'INSERT INTO financial_transactions (project_id, work_order_id, subcontractor_id, transaction_type, amount, transaction_date, description, related_invoice_id, recorded_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [project_id, work_order_id, subcontractor_id, transaction_type, amount, transaction_date || new Date(), description, related_invoice_id, recorded_by]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error recording transaction:', error);
        res.status(500).json({ message: 'Internal server error while recording transaction.' });
    }
};

// Get transactions (filtered)
export const getTransactions = async (req: Request, res: Response): Promise<void> => {
    const { projectId, workOrderId, subcontractorId, transactionType } = req.query;
    let queryString = 'SELECT * FROM financial_transactions WHERE 1=1';
    const queryParams = [];
    let paramIndex = 1;

    if (projectId) {
        queryString += ` AND project_id = $${paramIndex++}`;
        queryParams.push(projectId);
    }
    if (workOrderId) {
        queryString += ` AND work_order_id = $${paramIndex++}`;
        queryParams.push(workOrderId);
    }
    if (subcontractorId) {
        queryString += ` AND subcontractor_id = $${paramIndex++}`;
        queryParams.push(subcontractorId);
    }
    if (transactionType) {
        queryString += ` AND transaction_type = $${paramIndex++}`;
        queryParams.push(transactionType);
    }

    queryString += ' ORDER BY transaction_date DESC';

    try {
        const result = await query(queryString, queryParams);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Internal server error while fetching transactions.' });
    }
};

// Get financial summary for a project
export const getProjectFinancialSummary = async (req: Request, res: Response): Promise<void> => {
    const { projectId } = req.params;
    try {
        // Example summary query (can be much more complex)
        const budgetResult = await query('SELECT budget FROM projects WHERE project_id = $1', [projectId]);
        const costsResult = await query('SELECT SUM(actual_cost) as total_actual_cost FROM work_orders WHERE project_id = $1', [projectId]);
        const billedResult = await query('SELECT SUM(amount_billed) as total_billed FROM work_orders WHERE project_id = $1', [projectId]);
        const paidResult = await query('SELECT SUM(amount_paid) as total_paid FROM work_orders WHERE project_id = $1', [projectId]);

        if (budgetResult.rows.length === 0) {
             res.status(404).json({ message: 'Project not found.' });
             return;
        }

        const summary = {
            budget: budgetResult.rows[0]?.budget || 0,
            total_actual_cost: costsResult.rows[0]?.total_actual_cost || 0,
            total_billed: billedResult.rows[0]?.total_billed || 0,
            total_paid: paidResult.rows[0]?.total_paid || 0,
        };
        res.status(200).json(summary);
    } catch (error) {
        console.error(`Error fetching financial summary for project ${projectId}:`, error);
        res.status(500).json({ message: 'Internal server error while fetching financial summary.' });
    }
};

// Add more controllers for retainage, specific reports, etc.

