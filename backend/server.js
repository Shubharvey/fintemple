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

// ✅ ENHANCED Debug middleware - LOG ALL REQUESTS
app.use((req, res, next) => {
  console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log(`   Origin: ${req.headers.origin}`);
  console.log(
    `   User-Agent: ${req.headers["user-agent"]?.substring(0, 50)}...`
  );
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

// Enhanced Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    cors: "ALL_ORIGINS_ALLOWED",
    message: "Backend is running with open CORS policy",
  });
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
  console.log(`📡 Health: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Register: http://localhost:${PORT}/api/auth/register`);
});
