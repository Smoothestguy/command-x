import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

// Extend Express Request interface to include user property
interface AuthenticatedRequest extends Request {
  user?: { id: number; role: string; username: string }; // Added username for logging
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    console.log('[AuthMiddleware] No token provided');
    res.status(401).json({ message: 'Authentication token required.' });
    return; // Explicitly return after sending response
  }

  jwt.verify(token, config.jwtSecret, (err: any, user: any) => {
    if (err) {
      console.error('[AuthMiddleware] Token verification failed:', err.message);
      res.status(403).json({ message: 'Invalid or expired token.' });
      return; // Explicitly return after sending response
    }
    // Ensure user payload has expected structure before assigning
    if (user && typeof user === 'object' && user.id && user.role && user.username) {
        console.log('[AuthMiddleware] Token verified successfully for user:', user.username);
        req.user = user as { id: number; role: string; username: string }; // Add decoded user payload to request object
        next(); // pass the execution to the next handler/middleware
    } else {
        console.error('[AuthMiddleware] Invalid token payload structure:', user);
        res.status(403).json({ message: 'Invalid token payload.' });
        return; // Explicitly return after sending response
    }
  });
};

// Optional: Middleware to check for specific roles
export const authorizeRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => { // Ensure return type is void
    if (!req.user || !req.user.role) {
        console.log('[AuthMiddleware] User role not found on request');
        res.status(403).json({ message: 'Forbidden: User role not available.' });
        return; // Explicitly return after sending response
    }

    if (!allowedRoles.includes(req.user.role)) {
        console.log(`[AuthMiddleware] Forbidden: Role '${req.user.role}' not authorized for this route.`);
        res.status(403).json({ message: 'Forbidden: You do not have permission to perform this action.' });
        return; // Explicitly return after sending response
    }
    
    console.log(`[AuthMiddleware] Authorized: Role '${req.user.role}' allowed.`);
    next(); // Role is allowed, proceed to the next handler
  };
};

