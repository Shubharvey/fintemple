const db = require("./db");
const { v4: uuidv4 } = require("uuid");

db.init();
const database = db.getDb();

// Seed instruments only (no trades)
const instruments = [
  // Forex pairs
  {
    symbol: "EURUSD",
    name: "Euro/US Dollar",
    instrumentType: "forex",
    pipDecimal: 0.0001,
    pipValuePerLot: 10,
  },
  {
    symbol: "GBPUSD",
    name: "British Pound/US Dollar",
    instrumentType: "forex",
    pipDecimal: 0.0001,
    pipValuePerLot: 10,
  },

  // Stocks
  { symbol: "AAPL", name: "Apple Inc.", instrumentType: "stock" },
  { symbol: "RELIANCE", name: "Reliance Industries", instrumentType: "stock" },
  { symbol: "TCS", name: "Tata Consultancy Services", instrumentType: "stock" },

  // Crypto
  { symbol: "BTCINR", name: "Bitcoin/Indian Rupee", instrumentType: "crypto" },
  { symbol: "ETHINR", name: "Ethereum/Indian Rupee", instrumentType: "crypto" },

  // Commodities
  { symbol: "GOLD", name: "Gold", instrumentType: "commodity" },
  { symbol: "SILVER", name: "Silver", instrumentType: "commodity" },

  // Index
  { symbol: "NIFTY50", name: "Nifty 50 Index", instrumentType: "index-future" },
  {
    symbol: "BANKNIFTY",
    name: "Bank Nifty Index",
    instrumentType: "index-future",
  },
];

// Insert seed data
function seedDatabase() {
  console.log("Seeding database...");

  // Clear existing data
  database.exec("DELETE FROM trades");
  database.exec("DELETE FROM instruments");

  // Insert instruments only
  const instrumentStmt = database.prepare(`
    INSERT INTO instruments (symbol, name, instrumentType, pipDecimal, pipValuePerLot)
    VALUES (?, ?, ?, ?, ?)
  `);

  instruments.forEach((instrument) => {
    instrumentStmt.run(
      instrument.symbol,
      instrument.name,
      instrument.instrumentType,
      instrument.pipDecimal || null,
      instrument.pipValuePerLot || null
    );
  });

  console.log(
    `Seeded ${instruments.length} instruments. Database is ready for your trades.`
  );
}

seedDatabase();
