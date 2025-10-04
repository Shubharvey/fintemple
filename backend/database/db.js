const Database = require("better-sqlite3");
const path = require("path");

let db;
let isInitialized = false;

function init() {
  if (isInitialized) return db;

  db = new Database(path.join(__dirname, "trading_journal.db"));

  // Drop and recreate the trades table with updated CHECK constraint
  db.exec(`
    DROP TABLE IF EXISTS trades;
  `);

  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Create trades table with updated instrument types
  db.exec(`
    CREATE TABLE IF NOT EXISTS trades (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      exitTimestamp TEXT,
      symbol TEXT NOT NULL,
      instrumentType TEXT NOT NULL CHECK(instrumentType IN (
        'forex', 'commodity', 'stock', 'stock-options', 'futures', 
        'index-option', 'index-future', 'crypto'
      )),
      side TEXT NOT NULL CHECK(side IN ('buy', 'sell')),
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
  `);

  // Create instruments table
  db.exec(`
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
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_trades_timestamp ON trades(timestamp);
    CREATE INDEX IF NOT EXISTS idx_trades_exitTimestamp ON trades(exitTimestamp);
    CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
    CREATE INDEX IF NOT EXISTS idx_trades_strategy ON trades(strategy);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    
    -- Add to your existing indexes
    CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
    CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
  `);

  isInitialized = true;
  console.log(
    "Database initialized successfully with users table and updated instrument types"
  );
  return db;
}

function getDb() {
  if (!isInitialized) {
    console.log("Database not initialized, initializing now...");
    return init();
  }
  return db;
}

module.exports = { init, getDb };
