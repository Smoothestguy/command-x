import { Router } from 'express';
import {
    createInspection,
    getInspections,
    updateInspection,
    createIssue,
    getIssues,
    updateIssue
} from '../controllers/qualityControlController';

// TODO: Add authentication middleware

const router = Router();

// Inspection Routes
router.post('/inspections', createInspection);
router.get('/inspections', getInspections);
router.put('/inspections/:inspectionId', updateInspection);

// Issue Routes
router.post('/issues', createIssue);
router.get('/issues', getIssues);
router.put('/issues/:issueId', updateIssue);

export default router;

