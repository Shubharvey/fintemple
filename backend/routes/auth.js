const express = require("express");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { getDb, getQuery, runQuery, allQuery } = require("../database/db");

const router = express.Router();

// Rate limiting storage
const loginAttempts = new Map();

// ✅ Email validation function
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ✅ Password validation function
const validatePassword = (password) => {
  if (password.length < 6) {
    return {
      isValid: false,
      message: "Password must be at least 6 characters",
    };
  }
  if (!/(?=.*[a-zA-Z])/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one letter",
    };
  }
  if (!/(?=.*\d)/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one number",
    };
  }
  return { isValid: true, message: "Password is valid" };
};

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const database = getDb(); // ✅ Get database connection

  console.log("=== REGISTER REQUEST ===");
  console.log("Request body:", req.body);

  try {
    const { email, password, name } = req.body;

    // Enhanced validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ error: "Please enter a valid email address" });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    if (name && name.length > 50) {
      return res
        .status(400)
        .json({ error: "Name must be less than 50 characters" });
    }

    if (name && name.trim().length === 0) {
      return res.status(400).json({ error: "Name cannot be empty" });
    }

    // Check if user already exists
    console.log("Checking if user exists for email:", email);

    const existingUser = await getQuery(
      "SELECT id FROM users WHERE email = ?",
      [email.trim().toLowerCase()]
    );

    console.log("Existing user query result:", existingUser);
    console.log("Type of result:", typeof existingUser);

    if (existingUser) {
      console.log("User already exists, blocking registration");
      return res
        .status(400)
        .json({ error: "User already exists with this email" });
    }

    console.log("No existing user found, proceeding with registration...");

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = uuidv4();

    await runQuery(
      `INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)`,
      [
        userId,
        email.trim().toLowerCase(),
        password_hash,
        name ? name.trim() : null,
      ]
    );

    console.log("User inserted successfully");

    // Return user without password
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: userId,
        email: email.trim().toLowerCase(),
        name: name ? name.trim() : null,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip || req.connection.remoteAddress;

  // Simple rate limiting
  const key = `${ip}-${email}`;
  const attempts = loginAttempts.get(key) || 0;

  if (attempts > 5) {
    return res.status(429).json({
      error: "Too many login attempts. Please try again later.",
    });
  }

  try {
    // Enhanced validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ error: "Please enter a valid email address" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    // Find user (normalize email for case-insensitive search)
    const normalizedEmail = email.trim().toLowerCase();
    const user = await getQuery("SELECT * FROM users WHERE email = ?", [
      normalizedEmail,
    ]);

    if (!user) {
      // Increment on failed attempt
      loginAttempts.set(key, attempts + 1);
      setTimeout(() => loginAttempts.delete(key), 15 * 60 * 1000); // 15 min
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      // Increment on failed attempt
      loginAttempts.set(key, attempts + 1);
      setTimeout(() => loginAttempts.delete(key), 15 * 60 * 1000); // 15 min
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Reset on successful login
    loginAttempts.delete(key);

    // Return user without password
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      message: "Login successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    // Increment on failed attempt (server error)
    loginAttempts.set(key, attempts + 1);
    setTimeout(() => loginAttempts.delete(key), 15 * 60 * 1000); // 15 min

    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/auth/me
router.get("/me", (req, res) => {
  res.json({ message: "Session endpoint - to be implemented" });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.json({ message: "Logout successful" });
});

// TEMPORARY: Get all users (for debugging)
router.get("/debug-users", async (req, res) => {
  try {
    const users = await allQuery("SELECT id, email, name FROM users");
    console.log("Current users in database:", users);
    res.json({ users });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ error: "Failed to get users" });
  }
});

// TEMPORARY: Reset users table
router.get("/reset-users", async (req, res) => {
  const database = getDb();

  try {
    await runQuery("DELETE FROM users");
    console.log("Users table cleared");
    res.json({ message: "All users cleared successfully" });
  } catch (error) {
    console.error("Reset error:", error);
    res.status(500).json({ error: "Failed to reset users" });
  }
});

// TEMPORARY: Debug login attempts (for testing rate limiting)
router.get("/debug-login-attempts", (req, res) => {
  const attempts = {};
  loginAttempts.forEach((value, key) => {
    attempts[key] = value;
  });
  res.json({ loginAttempts: attempts });
});

module.exports = router;
