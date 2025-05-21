import express from 'express';
import * as vendorController from '../controllers/vendorController';
import * as purchaseOrderController from '../controllers/purchaseOrderController';
import * as fulfillmentController from '../controllers/fulfillmentController';

const router = express.Router();

// Vendor routes
router.get('/vendors', vendorController.getAllVendors);
router.get('/vendors/:vendorId', vendorController.getVendorById);
router.post('/vendors', vendorController.createVendor);
router.put('/vendors/:vendorId', vendorController.updateVendor);
router.delete('/vendors/:vendorId', vendorController.deleteVendor);

// Purchase Order routes
router.get('/purchase-orders', purchaseOrderController.getAllPurchaseOrders);
router.get('/purchase-orders/:purchaseOrderId', purchaseOrderController.getPurchaseOrderById);
router.post('/purchase-orders', purchaseOrderController.createPurchaseOrder);
router.put('/purchase-orders/:purchaseOrderId', purchaseOrderController.updatePurchaseOrder);
router.delete('/purchase-orders/:purchaseOrderId', purchaseOrderController.deletePurchaseOrder);

// Fulfillment routes
router.get('/purchase-orders/:purchaseOrderId/fulfillments', fulfillmentController.getFulfillments);
router.get('/fulfillments/:fulfillmentId', fulfillmentController.getFulfillmentById);
router.post('/fulfillments', fulfillmentController.createFulfillment);
router.delete('/fulfillments/:fulfillmentId', fulfillmentController.deleteFulfillment);

// Split Purchase Order route
router.post('/purchase-orders/split', fulfillmentController.splitPurchaseOrder);

export default router;
