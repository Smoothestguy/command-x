import express from "express";
import { config } from "./config";
import { testConnection } from "./db";
import workOrderRoutes from "./routes/workOrderRoutes";

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Test DB connection on startup
testConnection();

// Routes
app.use("/api/workorders", workOrderRoutes);

// Basic health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send("Work Order Service is healthy");
});

// Start server
app.listen(config.port, () => {
  console.log(`Work Order Service listening on port ${config.port}`);
});
