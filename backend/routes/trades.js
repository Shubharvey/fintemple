const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getDb, getQuery, runQuery, allQuery } = require("../database/db");
const TradingAnalytics = require("../analytics/analytics");

const router = express.Router();

// GET /api/trades
router.get("/", async (req, res) => {
  try {
    let query = `SELECT * FROM trades WHERE 1=1`;
    const params = [];

    // Filter by date range
    if (req.query.from) {
      query += ` AND timestamp >= ?`;
      params.push(req.query.from);
    }
    if (req.query.to) {
      query += ` AND timestamp <= ?`;
      params.push(req.query.to);
    }

    // Filter by symbol
    if (req.query.symbol) {
      query += ` AND symbol = ?`;
      params.push(req.query.symbol);
    }

    // Filter by strategy
    if (req.query.strategy) {
      query += ` AND strategy = ?`;
      params.push(req.query.strategy);
    }

    // Filter by tags
    if (req.query.tag) {
      query += ` AND tags LIKE ?`;
      params.push(`%${req.query.tag}%`);
    }

    query += ` ORDER BY timestamp DESC`;

    const trades = await allQuery(query, params);

    // Enhance trades with computed PnL
    const enhancedTrades = trades.map((trade) => ({
      ...trade,
      computedPnL: TradingAnalytics.computeTradePnL(trade),
      tags: trade.tags ? JSON.parse(trade.tags) : [],
    }));

    res.json(enhancedTrades);
  } catch (error) {
    console.error("Error fetching trades:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/trades
router.post("/", async (req, res) => {
  try {
    const trade = req.body;
    console.log("Received trade data:", trade); // Debug log

    // Validate required fields
    if (!trade.symbol || trade.entry === undefined || trade.lot === undefined) {
      return res.status(400).json({
        error: "Missing required fields: symbol, entry, lot",
      });
    }

    const tradeId = uuidv4();

    // Handle undefined values properly
    const result = await runQuery(
      `INSERT INTO trades (
        id, timestamp, exitTimestamp, symbol, instrumentType, side, 
        entry, exit, sl, tp, lot, volume, contractSize, pipDecimal, 
        pipValuePerLot, fees, tags, strategy, marketCondition, notes, screenshotUrl
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tradeId,
        trade.timestamp || new Date().toISOString(),
        trade.exitTimestamp || null,
        trade.symbol,
        trade.instrumentType || "stock", // Default to stock if not provided
        trade.side || "buy", // Default to buy if not provided
        trade.entry,
        trade.exit || null,
        trade.sl || null,
        trade.tp || null,
        trade.lot || 1,
        trade.volume || trade.lot || 1, // Use lot as volume if volume not provided
        trade.contractSize || null,
        trade.pipDecimal || null,
        trade.pipValuePerLot || null,
        trade.fees || 0,
        trade.tags ? JSON.stringify(trade.tags) : null,
        trade.strategy || null,
        trade.marketCondition || null,
        trade.notes || null,
        trade.screenshotUrl || null,
      ]
    );

    console.log("Trade created successfully with ID:", tradeId); // Debug log

    // Emit real-time update
    if (req.app.get("io")) {
      req.app.get("io").emit("trade:created", { id: tradeId });
    }

    res.status(201).json({
      id: tradeId,
      message: "Trade created successfully",
      computedPnL: TradingAnalytics.computeTradePnL({ ...trade, id: tradeId }),
    });
  } catch (error) {
    console.error("Error creating trade:", error);
    res.status(500).json({
      error: "Failed to create trade: " + error.message,
    });
  }
});

// PUT /api/trades/:id
router.put("/:id", async (req, res) => {
  try {
    const trade = req.body;

    const result = await runQuery(
      `UPDATE trades SET
        timestamp = ?, exitTimestamp = ?, symbol = ?, instrumentType = ?, side = ?,
        entry = ?, exit = ?, sl = ?, tp = ?, lot = ?, volume = ?, contractSize = ?,
        pipDecimal = ?, pipValuePerLot = ?, fees = ?, tags = ?, strategy = ?,
        marketCondition = ?, notes = ?, screenshotUrl = ?, updatedAt = datetime('now')
      WHERE id = ?`,
      [
        trade.timestamp,
        trade.exitTimestamp || null,
        trade.symbol,
        trade.instrumentType,
        trade.side,
        trade.entry,
        trade.exit || null,
        trade.sl || null,
        trade.tp || null,
        trade.lot || null,
        trade.volume || trade.lot || null,
        trade.contractSize || null,
        trade.pipDecimal || null,
        trade.pipValuePerLot || null,
        trade.fees || 0,
        trade.tags ? JSON.stringify(trade.tags) : null,
        trade.strategy || null,
        trade.marketCondition || null,
        trade.notes || null,
        trade.screenshotUrl || null,
        req.params.id,
      ]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Trade not found" });
    }

    // Emit real-time update
    if (req.app.get("io")) {
      req.app.get("io").emit("trade:updated", { id: req.params.id });
    }

    res.json({ message: "Trade updated successfully" });
  } catch (error) {
    console.error("Error updating trade:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/trades/bulk
router.post("/bulk", async (req, res) => {
  try {
    const trades = req.body;
    const results = {
      imported: [],
      failed: [],
      total: trades.length,
    };

    for (let index = 0; index < trades.length; index++) {
      const trade = trades[index];
      try {
        // Validate required fields
        if (!trade.timestamp || !trade.symbol || !trade.entry || !trade.lot) {
          throw new Error(
            "Missing required fields: timestamp, symbol, entry, lot"
          );
        }

        const tradeId = uuidv4();

        await runQuery(
          `INSERT INTO trades (
            id, timestamp, exitTimestamp, symbol, instrumentType, side, 
            entry, exit, sl, tp, lot, volume, contractSize, pipDecimal, 
            pipValuePerLot, fees, tags, strategy, marketCondition, notes, screenshotUrl
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            tradeId,
            trade.timestamp,
            trade.exitTimestamp || null,
            trade.symbol,
            trade.instrumentType || "stock",
            trade.side || "buy",
            trade.entry,
            trade.exit || null,
            trade.sl || null,
            trade.tp || null,
            trade.lot,
            trade.volume || trade.lot,
            trade.contractSize || null,
            trade.pipDecimal || null,
            trade.pipValuePerLot || null,
            trade.fees || 0,
            trade.tags ? JSON.stringify(trade.tags) : null,
            trade.strategy || null,
            trade.marketCondition || null,
            trade.notes || null,
            trade.screenshotUrl || null,
          ]
        );

        results.imported.push({ id: tradeId, originalIndex: index });
      } catch (error) {
        results.failed.push({
          originalIndex: index,
          error: error.message,
          data: trade,
        });
      }
    }

    // Emit real-time update for bulk import
    if (req.app.get("io")) {
      req.app
        .get("io")
        .emit("trade:bulkImported", { count: results.imported.length });
    }

    res.json(results);
  } catch (error) {
    console.error("Error in bulk import:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
