const express = require("express");
const { allQuery } = require("../database/db");
const TradingAnalytics = require("../analytics/analytics");

const router = express.Router();

// GET /api/reports/summary
router.get("/summary", async (req, res) => {
  try {
    // Get all trades for the date range
    let query = `SELECT * FROM trades WHERE 1=1`;
    const params = [];

    if (req.query.from) {
      query += ` AND timestamp >= ?`;
      params.push(req.query.from);
    }
    if (req.query.to) {
      query += ` AND timestamp <= ?`;
      params.push(req.query.to);
    }

    const trades = await allQuery(query, params);

    // Compute analytics with INR as default currency
    const equitySeries = TradingAnalytics.equityCurve(trades);
    const { drawdownSeries, maxDrawdown } =
      TradingAnalytics.drawdowns(equitySeries);
    const profitFactor = TradingAnalytics.profitFactor(trades);
    const winRate = TradingAnalytics.winRate(trades);
    const { avgWin, avgLoss } = TradingAnalytics.averageWinLoss(trades);
    const avgRR = TradingAnalytics.averageRR(trades);
    const sharpe = TradingAnalytics.sharpeRatio(equitySeries);
    const sortino = TradingAnalytics.sortinoRatio(equitySeries);
    const streaks = TradingAnalytics.computeStreaks(trades);
    const heatmap = TradingAnalytics.heatmap(trades);
    const hourlySummary = TradingAnalytics.hourlySummary(trades);
    const strategyBreakdown = TradingAnalytics.strategyBreakdown(trades);
    const monteCarlo = TradingAnalytics.monteCarloSimulation(trades);

    res.json({
      equityCurve: equitySeries,
      drawdownSeries,
      maxDrawdown,
      profitFactor,
      winRate: winRate * 100, // Convert to percentage
      avgWin,
      avgLoss,
      avgRR,
      sharpe,
      sortino,
      streaks,
      heatmap,
      hourlySummary,
      strategyBreakdown,
      monteCarlo,
      currency: "INR", // Add currency info
    });
  } catch (error) {
    console.error("Error in reports summary:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
