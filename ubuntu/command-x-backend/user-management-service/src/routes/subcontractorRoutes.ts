import { Router } from "express";
import {
  getAllSubcontractors,
  getSubcontractorById,
  createSubcontractor,
  updateSubcontractor,
  deleteSubcontractor,
  testSubcontractorEndpoint,
} from "../controllers/subcontractorController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// Temporarily disable authentication for testing
// router.use(authenticateToken);

// Test endpoint
router.get("/test", testSubcontractorEndpoint);

// Define CRUD routes
router.get("/", getAllSubcontractors);
router.get("/:subcontractorId", getSubcontractorById);
router.post("/", createSubcontractor);
router.put("/:subcontractorId", updateSubcontractor);
router.delete("/:subcontractorId", deleteSubcontractor);

export default router;
