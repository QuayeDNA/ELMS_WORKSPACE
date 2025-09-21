import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

// Import routes
import authRoutes from "./routes/authRoutes";
import { institutionRoutes } from "./routes/institutionRoutes";
import { facultyRoutes } from "./routes/facultyRoutes";
import { userRoutes } from "./routes/userRoutes";
import { departmentRoutes } from "./routes/departmentRoutes";
import { programRoutes } from "./routes/programRoutes";
import courseRoutes from "./routes/courseRoutes";
import studentRoutes from "./routes/studentRoutes";
import instructorRoutes from "./routes/instructorRoutes";
import academicPeriodRoutes from "./routes/academicPeriodRoutes";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARE SETUP
// ========================================

// Manual CORS headers - MUST BE FIRST
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// Security middleware (moved after CORS)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // Disable some headers that might interfere with CORS
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging (skip /_next/image requests to reduce noise)
app.use(
  morgan("combined", {
    skip: (req) => req.path.startsWith("/_next/image"),
  })
);

// ========================================
// ROUTES
// ========================================

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "ELMS Server is running",
    timestamp: new Date().toLocaleString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});

// API routes
app.get("/api", (req, res) => {
  res.json({
    message: "ELMS API v1.0",
    documentation: "/api/docs",
    health: "/health",
    auth: "/api/auth",
    timestamp: new Date().toISOString(),
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Institution routes
app.use("/api/institutions", institutionRoutes);

// Faculty routes
app.use("/api/faculties", facultyRoutes);

// Department routes
app.use("/api/departments", departmentRoutes);

// Program routes
app.use("/api/programs", programRoutes);

// Course routes
app.use("/api/courses", courseRoutes);

// Student routes
app.use("/api/students", studentRoutes);

// Instructor routes
app.use("/api/instructors", instructorRoutes);

// Academic Period routes
app.use("/api/academic-periods", academicPeriodRoutes);

// User routes
app.use("/api/users", userRoutes);

// Handle Next.js image requests (for compatibility with frontend)
app.get("/_next/image", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== "string") {
      return res
        .status(400)
        .json({ error: "Missing or invalid url parameter" });
    }

    // Fetch the image from the external URL
    const response = await fetch(url);

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Failed to fetch image" });
    }

    // Get the content type
    const contentType = response.headers.get("content-type") || "image/jpeg";

    // Set appropriate headers
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year

    // Get the buffer and send it
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 404 handler for API routes
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
    method: req.method,
  });
});

// ========================================
// ERROR HANDLING
// ========================================

// Global error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);

    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ========================================
// SERVER STARTUP
// ========================================

app.listen(PORT, () => {
  console.log(`🚀 ELMS Server running on port ${PORT}`);
  console.log(`� Health check: http://localhost:${PORT}/health`);
  console.log(`� Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

export default app;
