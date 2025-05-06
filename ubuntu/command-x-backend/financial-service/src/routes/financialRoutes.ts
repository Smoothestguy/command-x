import { Router } from 'express';
import {
    recordTransaction,
    getTransactions,
    getProjectFinancialSummary
} from '../controllers/financialController';

// TODO: Add authentication middleware

const router = Router();

router.post('/transactions', recordTransaction);
router.get('/transactions', getTransactions);
router.get('/projects/:projectId/summary', getProjectFinancialSummary);

// Add more financial routes later (e.g., work order summary, subcontractor payments)

export default router;

