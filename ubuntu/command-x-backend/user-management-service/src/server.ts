import express, { Request, Response, NextFunction } from "express"; // Import NextFunction
import { config } from "./config";
import { testConnection } from "./db";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import subcontractorRoutes from "./routes/subcontractorRoutes";

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies

// Simple request logger middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Test DB connection on startup
testConnection();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); // Mount user routes
app.use("/api/subcontractors", subcontractorRoutes); // Mount subcontractor routes

// Basic health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).send("User Management Service is healthy");
});

// Centralized Error Handling Middleware
// This should be defined AFTER all other app.use() and routes calls
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[ERROR] ${req.method} ${req.url} - ${err.stack}`); // Log the full error stack
  // Avoid sending stack trace in production
  const statusCode =
    res.statusCode && res.statusCode >= 400 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    // Optionally include stack in development
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Export the app instance for testing
export { app };

// Start server only if not in test environment
if (process.env.NODE_ENV !== "test") {
  app.listen(config.port, () => {
    console.log(`User Management Service listening on port ${config.port}`);
  });
}
