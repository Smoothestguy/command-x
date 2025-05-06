import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/authController';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Add other user-related routes here later (e.g., get profile, update profile)

export default router;

