import { Router } from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/userController';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware'; // Uncommented

const router = Router();

// Apply authentication middleware to all user routes
router.use(authenticateToken); // Uncommented and applied

// Define CRUD routes
// Assuming only Admins can manage users - apply role authorization
router.get('/', authorizeRole(['Admin']), getAllUsers); // Added role check
router.get('/:id', authorizeRole(['Admin']), getUserById); // Added role check
router.post('/', authorizeRole(['Admin']), createUser); // Added role check
router.put('/:id', authorizeRole(['Admin']), updateUser); // Added role check
router.delete('/:id', authorizeRole(['Admin']), deleteUser); // Added role check

export default router;

