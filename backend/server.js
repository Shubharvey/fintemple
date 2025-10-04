require("dotenv").config(); // Add at top

const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const db = require("./database/db");
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

// Configure CORS
const corsOptions = {
  origin: isProduction
    ? ["https://your-netlify-app.netlify.app"]
    : "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Initialize database FIRST
db.init();

// Socket.IO for real-time updates
const server = http.createServer(app);
const io = socketIo(server, {
  cors: corsOptions,
});

app.set("io", io);

// Routes - import AFTER database initialization
const tradeRoutes = require("./routes/trades");
const reportRoutes = require("./routes/reports");

app.use("/api/trades", tradeRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Socket connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
