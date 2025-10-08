const sqlite3 = require("sqlite3").verbose();
const path = require("path");

let db;
let isInitialized = false;

function init() {
  if (isInitialized) return db;

  db = new sqlite3.Database(
    path.join(__dirname, "trading_journal.db"),
    (err) => {
      if (err) {
        console.error("❌ Database connection error:", err);
        return;
      }
      console.log("✅ Connected to SQLite database");
    }
  );

  // Create tables
  db.serialize(() => {
    // Users table
    db.run(
      `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `,
      (err) => {
        if (err) console.error("❌ Error creating users table:", err);
        else console.log("✅ Users table ready");
      }
    );

    // Trades table
    db.run(
      `
      CREATE TABLE IF NOT EXISTS trades (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        exitTimestamp TEXT,
        symbol TEXT NOT NULL,
        instrumentType TEXT NOT NULL,
        side TEXT NOT NULL,
        entry REAL NOT NULL,
        exit REAL,
        sl REAL,
        tp REAL,
        lot REAL,
        volume REAL,
        contractSize REAL,
        pipDecimal REAL,
        pipValuePerLot REAL,
        fees REAL DEFAULT 0,
        tags TEXT,
        strategy TEXT,
        marketCondition TEXT,
        notes TEXT,
        screenshotUrl TEXT,
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now'))
      )
    `,
      (err) => {
        if (err) console.error("❌ Error creating trades table:", err);
        else console.log("✅ Trades table ready");
      }
    );

    // Instruments table
    db.run(
      `
      CREATE TABLE IF NOT EXISTS instruments (
        symbol TEXT PRIMARY KEY,
        name TEXT,
        instrumentType TEXT NOT NULL,
        contractSize REAL DEFAULT 100000,
        pipDecimal REAL,
        pipValuePerLot REAL,
        quoteToAccountRate REAL DEFAULT 1,
        createdAt TEXT DEFAULT (datetime('now'))
      )
    `,
      (err) => {
        if (err) console.error("❌ Error creating instruments table:", err);
        else console.log("✅ Instruments table ready");
      }
    );
  });

  isInitialized = true;
  console.log("✅ Database initialized successfully");
  return db;
}

function getDb() {
  if (!isInitialized) {
    console.log("⚠️ Database not initialized, initializing now...");
    return init();
  }
  return db;
}

// Helper function for async queries
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) {
        console.error("❌ Database runQuery error:", err);
        reject(err);
      } else resolve(this);
    });
  });
}

function getQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        console.error("❌ Database getQuery error:", err);
        reject(err);
      } else resolve(row);
    });
  });
}

function allQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error("❌ Database allQuery error:", err);
        reject(err);
      } else resolve(rows);
    });
  });
}

module.exports = { init, getDb, runQuery, getQuery, allQuery };
