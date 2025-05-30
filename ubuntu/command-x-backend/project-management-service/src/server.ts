import express from "express";
import { config } from "./config";
import { testConnection } from "./db";
import projectRoutes from "./routes/projectRoutes";
import paymentItemRoutes from "./routes/paymentItemRoutes";
import locationRoutes from "./routes/locationRoutes";

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies

// Test DB connection on startup
testConnection();

// Routes
app.use("/api/projects", projectRoutes);
app.use("/api/payment-items", paymentItemRoutes);
app.use("/api/locations", locationRoutes);

// Basic health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send("Project Management Service is healthy");
});

// Start server
app.listen(config.port, () => {
  console.log(`Project Management Service listening on port ${config.port}`);
});
