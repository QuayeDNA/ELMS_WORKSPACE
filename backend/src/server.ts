import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma Client
const prisma = new PrismaClient();

// Import routes
import authRoutes from "./routes/authRoutes";
import publicRoutes from "./routes/publicRoutes";
import studentIdConfigRoutes from "./routes/studentIdConfigRoutes";
import { institutionRoutes } from "./routes/institutionRoutes";
import { facultyRoutes } from "./routes/facultyRoutes";
import { userRoutes } from "./routes/userRoutes";
import { departmentRoutes } from "./routes/departmentRoutes";
import { programRoutes } from "./routes/programRoutes";
import courseRoutes from "./routes/courseRoutes";
import studentRoutes from "./routes/studentRoutes";
import instructorRoutes from "./routes/instructorRoutes";
import academicPeriodRoutes from "./routes/academicPeriodRoutes";
import incidentRoutes from "./routes/incidentRoutes";
import venueRoutes from "./routes/venueRoutes";
import examRoutes from "./routes/examRoutes";
import programPrefixRoutes from "./routes/programPrefixRoutes";
import registrationRoutes from "./routes/registrationRoutes";
import prerequisiteRoutes from "./routes/prerequisiteRoutes";
import semesterRecordRoutes from "./routes/semesterRecordRoutes";
import academicHistoryRoutes from "./routes/academicHistoryRoutes";
import examTimetableRoutes from "./routes/examTimetableRoutes";
import timetableEntryRoutes from "./routes/timetableEntryRoutes";
import timetableConflictRoutes from "./routes/timetableConflictRoutes";
import examRegistrationRoutes from "./routes/examRegistrationRoutes";
import batchScriptRoutes from "./routes/batchScriptRoutes";
import scriptSubmissionRoutes from "./routes/scriptSubmissionRoutes";

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
app.get("/health", async (req, res) => {
  const healthCheck = {
    status: "OK",
    message: "ELMS Server is running",
    timestamp: new Date().toLocaleString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
    database: {
      status: "Unknown",
      connection: false,
      message: ""
    }
  };

  // Test database connection
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;

    healthCheck.database.status = "Connected";
    healthCheck.database.connection = true;
    healthCheck.database.message = "Database connection successful";

    res.json(healthCheck);
  } catch (error) {
    console.error("❌ Database health check failed:", error);

    healthCheck.status = "Degraded";
    healthCheck.database.status = "Disconnected";
    healthCheck.database.connection = false;
    healthCheck.database.message = "Database connection failed";

    res.status(503).json(healthCheck);
  }
});

// API routes
app.get("/api", (req, res) => {
  res.json({
    message: "ELMS API v1.0",
    documentation: "/api/docs",
    health: "/health",
    database: "/api/database/status",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      institutions: "/api/institutions",
      faculties: "/api/faculties",
      departments: "/api/departments",
      programs: "/api/programs",
      "program-prefixes": "/api/program-prefixes",
      courses: "/api/courses",
      students: "/api/students",
      instructors: "/api/instructors",
      "academic-periods": "/api/academic-periods",
      registrations: "/api/registrations",
      prerequisites: "/api/prerequisites",
      "semester-records": "/api/semester-records",
      "academic-history": "/api/academic-history",
      exams: "/api/exams",
      timetables: "/api/timetables",
      "timetable-entries": "/api/timetable-entries",
      "timetable-conflicts": "/api/timetable-conflicts",
      "exam-registrations": "/api/exam-registrations",
      "batch-scripts": "/api/batch-scripts",
      "script-submissions": "/api/script-submissions",
      incidents: "/api/incidents",
      venues: "/api/venues"
    },
    timestamp: new Date().toISOString(),
  });
});

// Database status endpoint
app.get("/api/database/status", async (req, res) => {
  try {
    // Test basic connection
    await prisma.$connect();

    // Get database metrics
    const [
      userCount,
      institutionCount,
      facultyCount,
      departmentCount,
      courseCount,
      examCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.institution.count(),
      prisma.faculty.count(),
      prisma.department.count(),
      prisma.course.count(),
      prisma.exam.count()
    ]);

    res.json({
      status: "Connected",
      connection: true,
      database_url: process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@'),
      statistics: {
        users: userCount,
        institutions: institutionCount,
        faculties: facultyCount,
        departments: departmentCount,
        courses: courseCount,
        exams: examCount
      },
      last_checked: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Database status check failed:", error);
    res.status(503).json({
      status: "Disconnected",
      connection: false,
      error: "Database connection failed",
      last_checked: new Date().toISOString()
    });
  }
});

// Public routes (NO AUTH REQUIRED)
app.use("/api/public", publicRoutes);

// Student ID Configuration routes
app.use("/api/student-id-config", studentIdConfigRoutes);

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

// Program prefix routes
app.use("/api/program-prefixes", programPrefixRoutes);

// Course routes
app.use("/api/courses", courseRoutes);

// Student routes
app.use("/api/students", studentRoutes);

// Instructor routes
app.use("/api/instructors", instructorRoutes);

// Academic Period routes
app.use("/api/academic-periods", academicPeriodRoutes);

// Registration routes (Phase 2)
app.use("/api/registrations", registrationRoutes);

// Prerequisite routes (Phase 2)
app.use("/api/prerequisites", prerequisiteRoutes);

// Semester Record routes (Phase 2)
app.use("/api/semester-records", semesterRecordRoutes);

// Academic History routes (Phase 2)
app.use("/api/academic-history", academicHistoryRoutes);

// Exam routes
app.use("/api/exams", examRoutes);

// Exam timetable routes (Phase 3 - Advanced)
app.use("/api/timetables", examTimetableRoutes);
app.use("/api/timetable-entries", timetableEntryRoutes);
app.use("/api/timetable-conflicts", timetableConflictRoutes);

// Script submission routes (Phase 4 - Script Management)
app.use("/api/exam-registrations", examRegistrationRoutes);
app.use("/api/batch-scripts", batchScriptRoutes);
app.use("/api/script-submissions", scriptSubmissionRoutes);

// Incident routes
app.use("/api/incidents", incidentRoutes);

// Venue routes
app.use("/api/venues", venueRoutes);

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
// DATABASE CONNECTION & SERVER STARTUP
// ========================================

async function initializeDatabase() {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    return false;
  }
}

async function startServer() {
  // Load environment variables
  dotenv.config();

  // Initialize database connection
  const dbConnected = await initializeDatabase();

  if (!dbConnected) {
    console.error('🚫 Server startup aborted due to database connection failure');
    process.exit(1);
  }

  // Start the server
  const server = app.listen(PORT, () => {
    console.log('\n🎉 ELMS Backend Server Started Successfully!');
    console.log('================================================');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
    console.log('================================================\n');
  });

  // Initialize WebSocket server
  import('./services/realtimeService').then(({ realtimeService }) => {
    realtimeService.initialize(server);
  });

  return server;
}

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  console.log(`\n${signal} received, shutting down gracefully...`);

  try {
    console.log('🔌 Disconnecting from database...');
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');

    console.log('🛑 Server shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Start the server
startServer().catch((error) => {
  console.error('💥 Failed to start server:', error);
  process.exit(1);
});

// Export prisma client for use in other modules
export { prisma };

export default app;
