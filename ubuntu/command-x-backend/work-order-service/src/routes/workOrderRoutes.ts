import { Router } from 'express';
import {
    getAllWorkOrders,
    getWorkOrderById,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    addLineItem,
    updateLineItem,
    deleteLineItem
} from '../controllers/workOrderController';

// TODO: Add authentication middleware

const router = Router();

// Work Order Routes
router.get('/', getAllWorkOrders);
router.post('/', createWorkOrder);
router.get('/:workOrderId', getWorkOrderById);
router.put('/:workOrderId', updateWorkOrder);
router.delete('/:workOrderId', deleteWorkOrder);

// Line Item Routes (nested under work orders)
router.post('/:workOrderId/lineitems', addLineItem);
router.put('/lineitems/:lineItemId', updateLineItem); // Assuming lineItemId is unique globally or handled correctly
router.delete('/lineitems/:lineItemId', deleteLineItem);

export default router;

