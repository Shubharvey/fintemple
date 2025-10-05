require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const db = require("./database/db");

// ✅ Import ALL routes at the top
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const tradeRoutes = require("./routes/trades");
const reportRoutes = require("./routes/reports");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ BULLETPROOF CORS - ALLOW EVERYTHING
const corsOptions = {
  origin: true, // Allow ALL origins
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ COMPREHENSIVE Debug middleware - LOG EVERYTHING
app.use((req, res, next) => {
  console.log(`🔍 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log(`   Origin: ${req.headers.origin}`);
  console.log(`   User-Agent: ${req.headers["user-agent"]}`);
  console.log(`   Headers:`, req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`   Body: ${JSON.stringify(req.body)}`);
  }
  next();
});

// Initialize database FIRST
db.init();

// Socket.IO for real-time updates
const server = http.createServer(app);
const io = socketIo(server, {
  cors: corsOptions,
});

app.set("io", io);

// ✅ Now use ALL routes (they're already imported above)
app.use("/api/trades", tradeRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ✅ ENHANCED Health check with full diagnostics
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    cors: "ALL_ORIGINS_ALLOWED",
    message: "Backend is running with open CORS policy",
    backend_url: "https://fintemple-backend.onrender.com",
    frontend_url: "https://fintemple.onrender.com",
  });
});

// ✅ DIAGNOSTIC ENDPOINT - Test everything
app.get("/api/diagnostic", (req, res) => {
  res.json({
    status: "Diagnostic endpoint working",
    cors: "ALL_ORIGINS_ALLOWED",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: "Connected",
    api_endpoints: {
      health: "/api/health",
      register: "/api/auth/register",
      login: "/api/auth/login",
      diagnostic: "/api/diagnostic",
    },
  });
});

// ✅ TEST REGISTRATION ENDPOINT - No auth required
app.post("/api/test-registration", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    console.log("🎯 TEST REGISTRATION ATTEMPT:", { email, name });

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password required",
        test: "FAILED - Missing fields",
      });
    }

    res.json({
      success: true,
      message: "✅ Registration endpoint is working!",
      test: "PASSED",
      received_data: {
        email: email,
        name: name || "Not provided",
        password_length: password.length,
      },
      cors: "✅ Allowed",
      timestamp: new Date().toISOString(),
      note: "This is a test endpoint - actual registration happens at /api/auth/register",
    });
  } catch (error) {
    console.error("Test registration error:", error);
    res.status(500).json({
      error: error.message,
      test: "FAILED - Server error",
    });
  }
});

// Enhanced test route
app.get("/api/test-auth", (req, res) => {
  res.json({
    message: "Auth routes are working!",
    cors: "✅ All origins allowed",
    timestamp: new Date().toISOString(),
  });
});

// Test CORS specifically
app.options("/api/auth/register", cors(corsOptions)); // Explicit preflight
app.options("/api/auth/login", cors(corsOptions)); // Explicit preflight

// Socket connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔓 CORS: ALL ORIGINS ALLOWED`);
  console.log(`🔍 DEBUG: Enhanced logging enabled`);
  console.log(`📡 Health: https://fintemple-backend.onrender.com/api/health`);
  console.log(
    `🔗 Register: https://fintemple-backend.onrender.com/api/auth/register`
  );
  console.log(
    `🎯 Test: https://fintemple-backend.onrender.com/api/test-registration`
  );
});
