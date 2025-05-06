import { Request, Response, NextFunction } from 'express'; // Import NextFunction
import { query } from '../db';
import bcrypt from 'bcryptjs';

// Helper to wrap async functions for Express error handling
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next); // Catch promise rejections and pass to next()
    };

// Get all users (excluding password hash)
export const getAllUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // try {
        const result = await query('SELECT user_id, username, email, role, status, created_at FROM users');
        res.status(200).json(result.rows);
    // } catch (err: any) { 
    //     console.error('Error fetching users:', err.message);
    //     next(err); // Pass error to Express error handler
    // }
});

// Get user by ID (excluding password hash)
export const getUserById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
        // Use return to stop execution, no need for next() here for validation errors handled directly
        return res.status(400).json({ message: 'Invalid user ID' }); 
    }
    // try {
        const result = await query('SELECT user_id, username, email, role, status, created_at FROM users WHERE user_id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(result.rows[0]);
    // } catch (err: any) {
    //     console.error('Error fetching user by ID:', err.message);
    //     next(err);
    // }
});

// Create a new user
export const createUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password, role, status } = req.body;

    if (!username || !email || !password || !role) {
        return res.status(400).json({ message: 'Missing required fields (username, email, password, role)' });
    }

    // try {
        // Check if username or email already exists
        const existingUser = await query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
        if (existingUser.rows.length > 0) {
            // Handle specific conflict error
            return res.status(409).json({ message: 'Username or email already exists' }); // Use 409 Conflict
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const result = await query(
            'INSERT INTO users (username, email, password_hash, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING user_id',
            [username, email, hashedPassword, role, status || 'Active'] // Default status if not provided
        );

        res.status(201).json({ message: 'User created successfully', userId: result.rows[0].user_id });
    // } catch (err: any) {
    //     console.error('Error creating user:', err.message);
    //     // Handle potential unique constraint violation if not caught above (though the check above is better)
    //     if (err.code === '23505') { 
    //          return res.status(409).json({ message: 'Username or email already exists' });
    //     }
    //     next(err);
    // }
});

// Update user
export const updateUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = parseInt(req.params.id);
    const { username, email, role, status, password } = req.body;

    if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    // try {
        // Check if user exists
        const userExists = await query('SELECT * FROM users WHERE user_id = $1', [userId]);
        if (userExists.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Build update query dynamically
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (username !== undefined) {
            fields.push(`username = $${paramIndex++}`);
            values.push(username);
        }
        if (email !== undefined) {
            fields.push(`email = $${paramIndex++}`);
            values.push(email);
        }
        if (role !== undefined) {
            fields.push(`role = $${paramIndex++}`);
            values.push(role);
        }
        if (status !== undefined) {
            fields.push(`status = $${paramIndex++}`);
            values.push(status);
        }
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            fields.push(`password_hash = $${paramIndex++}`);
            values.push(hashedPassword);
        }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'No fields provided for update' });
        }

        values.push(userId); // Add user_id for the WHERE clause
        const updateQuery = `UPDATE users SET ${fields.join(', ')} WHERE user_id = $${paramIndex} RETURNING user_id`;

        await query(updateQuery, values);

        res.status(200).json({ message: 'User updated successfully' });
    // } catch (err: any) {
    //     console.error('Error updating user:', err.message);
    //     // Handle potential unique constraint violation for username/email
    //     if (err.code === '23505') { 
    //          return res.status(409).json({ message: 'Username or email already exists' });
    //     }
    //     next(err);
    // }
});

// Delete user
export const deleteUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }
    // try {
        const result = await query('DELETE FROM users WHERE user_id = $1 RETURNING user_id', [userId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    // } catch (err: any) {
    //     console.error('Error deleting user:', err.message);
    //     next(err);
    // }
});

