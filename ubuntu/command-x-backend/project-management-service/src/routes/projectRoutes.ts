import { Router } from "express";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController";
import { getProjectBudgetSummary } from "../controllers/locationController";

// TODO: Add authentication middleware to protect routes
// import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// router.use(authenticateToken); // Apply auth middleware to all project routes

router.get("/", getAllProjects);
router.post("/", createProject);
router.get("/:projectId", getProjectById);
router.put("/:projectId", updateProject);
router.delete("/:projectId", deleteProject);

// Budget and analytics routes
router.get("/:projectId/budget-summary", getProjectBudgetSummary);

// Add other project-related routes here later (e.g., milestones, team members)

export default router;
