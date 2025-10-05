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
const isProduction = process.env.NODE_ENV === "production";

// ✅ PRODUCTION-READY CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or server-to-server calls)
    if (!origin) return callback(null, true);

    // List of allowed origins
    const allowedOrigins = [
      process.env.FRONTEND_URL, // Your production frontend URL
      "http://localhost:5173", // Vite dev server
      "http://127.0.0.1:5173", // Vite alternative
      "http://localhost:3000", // Create React App
      "http://127.0.0.1:3000", // CRA alternative
    ].filter(Boolean); // Remove any undefined values

    // Check if the origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked request from origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browser support
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ Remove or keep debug middleware based on your needs
app.use((req, res, next) => {
  if (!isProduction) {
    console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
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

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// Test route to verify auth routes are working
app.get("/api/test-auth", (req, res) => {
  res.json({ message: "Auth routes are mounted correctly!" });
});

// Socket connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔧 CORS configured for production and development`);
  if (!isProduction) {
    console.log(
      `📡 Allowed origins: Localhost ports 3000, 5173 + Production URL`
    );
  }
});
