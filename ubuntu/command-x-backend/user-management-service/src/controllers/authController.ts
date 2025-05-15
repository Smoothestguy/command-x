import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../db";
import { config } from "../config";

const SALT_ROUNDS = 10;

// Helper to wrap async functions for Express error handling
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    console.log(`[${fn.name}] Handling ${req.method} ${req.path}`); // Log handler entry
    Promise.resolve(fn(req, res, next)).catch((err) => {
      // Catch promise rejections
      console.error(`[${fn.name}] Error caught:`, err); // Log the caught error
      next(err); // Pass error to Express error handler
    });
  };

export const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, password, email, firstName, lastName, role } = req.body;
    console.log("[registerUser] Request body:", req.body);

    if (!username || !password || !email) {
      console.log("[registerUser] Validation failed: Missing required fields.");
      return res
        .status(400)
        .json({ message: "Username, password, and email are required." });
    }

    console.log(
      `[registerUser] Checking existence for username: ${username}, email: ${email}`
    );
    const existingUser = await query(
      "SELECT * FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );
    if (existingUser.rows.length > 0) {
      console.log("[registerUser] Conflict: Username or email already exists.");
      return res
        .status(409)
        .json({ message: "Username or email already exists." });
    }

    console.log("[registerUser] Hashing password...");
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    console.log("[registerUser] Inserting new user into database...");
    const newUserResult = await query(
      "INSERT INTO users (username, password_hash, email, first_name, last_name, role, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING user_id",
      [
        username,
        passwordHash,
        email,
        firstName,
        lastName,
        role || "FieldStaff",
        "Active",
      ]
    );
    const userId = newUserResult.rows[0].user_id;
    console.log(`[registerUser] User inserted successfully with ID: ${userId}`);

    res
      .status(201)
      .json({ message: "User registered successfully", userId: userId });
  }
);

export const loginUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;
    console.log("[loginUser] Request body:", req.body);

    if (!username || !password) {
      console.log(
        "[loginUser] Validation failed: Missing username or password."
      );
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }

    console.log(`[loginUser] Finding user by username: ${username}`);
    const userResult = await query(
      "SELECT user_id, username, password_hash, email, role, status, first_name, last_name, created_at FROM users WHERE username = $1",
      [username]
    );
    if (userResult.rows.length === 0) {
      console.log(`[loginUser] User not found: ${username}`);
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = userResult.rows[0];
    console.log(
      `[loginUser] User found: ${user.username}. Comparing password...`
    );

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      console.log(`[loginUser] Password mismatch for user: ${username}`);
      return res.status(401).json({ message: "Invalid credentials." });
    }
    console.log(
      `[loginUser] Password matched for user: ${username}. Generating JWT...`
    );

    // *** FIX: Use 'id' instead of 'userId' in payload to match middleware expectation ***
    const payload = {
      id: user.user_id, // Changed from userId to id
      username: user.username,
      role: user.role,
      // Add issued at and expiration timestamps
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
    };

    if (!config.jwtSecret) {
      console.error("[loginUser] FATAL: JWT Secret is not defined!");
      // Throw an error to be caught by asyncHandler and passed to central error handler
      throw new Error("Internal server error: JWT configuration missing.");
    }
    console.log("[loginUser] JWT Secret found. Signing token...");

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: "24h" });
    console.log(`[loginUser] Token generated for user: ${username}`);

    const { password_hash, ...userWithoutPassword } = user;
    res.status(200).json({ token, user: userWithoutPassword });
  }
);
