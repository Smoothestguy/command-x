import { Router } from "express";
import {
  getAllWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  addLineItem,
  updateLineItem,
  deleteLineItem,
  createEnhancedWorkOrder,
  getWorkOrderContractors,
  updateWorkOrderContractor,
  getAllSubcontractors,
} from "../controllers/workOrderController";

// TODO: Add authentication middleware

const router = Router();

// Subcontractor Routes (must come before parameterized routes)
router.get("/subcontractors", getAllSubcontractors);

// Work Order Routes
router.get("/", getAllWorkOrders);
router.post("/", createWorkOrder);
router.post("/enhanced", createEnhancedWorkOrder);
router.get("/:workOrderId", getWorkOrderById);
router.put("/:workOrderId", updateWorkOrder);
router.delete("/:workOrderId", deleteWorkOrder);

// Line Item Routes (nested under work orders)
router.post("/:workOrderId/lineitems", addLineItem);
router.put("/lineitems/:lineItemId", updateLineItem); // Assuming lineItemId is unique globally or handled correctly
router.delete("/lineitems/:lineItemId", deleteLineItem);

// Contractor Assignment Routes
router.get("/:workOrderId/contractors", getWorkOrderContractors);
router.put("/contractors/:assignmentId", updateWorkOrderContractor);

export default router;
