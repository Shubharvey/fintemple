const express = require("express");
const db = require("../database/db");
const TradingAnalytics = require("../analytics/analytics");

const router = express.Router();
const database = db.getDb();

// Helper function to calculate changes (you might want to compare with previous period)
const calculateChanges = (currentData, previousData = {}) => {
  return {
    profitFactorChange:
      currentData.profitFactor - (previousData.profitFactor || 0),
    winRateChange: currentData.winRate - (previousData.winRate || 0),
    totalPnLChange: previousData.totalPnL
      ? ((currentData.totalPnL - previousData.totalPnL) /
          Math.abs(previousData.totalPnL)) *
        100
      : 0,
    maxDrawdownChange:
      currentData.maxDrawdown - (previousData.maxDrawdown || 0),
    totalTradesChange:
      currentData.totalTrades - (previousData.totalTrades || 0),
    avgWinLossRatioChange:
      currentData.avgWinLossRatio - (previousData.avgWinLossRatio || 0),
  };
};

// GET /api/dashboard/summary
router.get("/summary", (req, res) => {
  try {
    const trades = database
      .prepare("SELECT * FROM trades ORDER BY timestamp DESC")
      .all();

    // Calculate all dashboard metrics
    const equitySeries = TradingAnalytics.equityCurve(trades);
    const { maxDrawdown } = TradingAnalytics.drawdowns(equitySeries);
    const profitFactor = TradingAnalytics.profitFactor(trades);
    const winRate = TradingAnalytics.winRate(trades) * 100;
    const { avgWin, avgLoss } = TradingAnalytics.averageWinLoss(trades);

    // Calculate total P&L (current balance minus starting balance)
    const totalPnL =
      equitySeries.length > 0
        ? equitySeries[equitySeries.length - 1].balance - 10000
        : 0;
    const totalTrades = trades.length;
    const closedTrades = trades.filter((t) => t.exit).length;
    const avgWinLossRatio = avgLoss !== 0 ? avgWin / Math.abs(avgLoss) : 0;

    // For now, use zeros for changes since we don't have historical data
    // In a real app, you'd compare with previous period data
    const changes = {
      profitFactorChange: 0,
      winRateChange: 0,
      totalPnLChange: 0,
      maxDrawdownChange: 0,
      totalTradesChange: 0,
      avgWinLossRatioChange: 0,
    };

    res.json({
      // Main metrics
      profitFactor: profitFactor || 0,
      winRate: winRate || 0,
      avgWin: avgWin || 0,
      avgLoss: avgLoss || 0,
      maxDrawdown: maxDrawdown || 0,
      totalPnL: totalPnL || 0,
      totalTrades,
      closedTrades,
      avgWinLossRatio,

      // Change metrics (required by frontend)
      ...changes,

      // Additional data for other components
      hourlySummary: [],
      recentTrades: [],
      dailySummary: [],
    });
  } catch (error) {
    console.error("Error in dashboard summary:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dashboard/kpis
router.get("/kpis", (req, res) => {
  try {
    const trades = database.prepare("SELECT * FROM trades").all();

    const equitySeries = TradingAnalytics.equityCurve(trades);
    const { maxDrawdown } = TradingAnalytics.drawdowns(equitySeries);
    const profitFactor = TradingAnalytics.profitFactor(trades);
    const winRate = TradingAnalytics.winRate(trades) * 100;
    const { avgWin, avgLoss } = TradingAnalytics.averageWinLoss(trades);

    const totalPnL =
      equitySeries.length > 0
        ? equitySeries[equitySeries.length - 1].balance - 10000
        : 0;
    const totalTrades = trades.length;
    const closedTrades = trades.filter((t) => t.exit).length;
    const avgWinLossRatio = avgLoss !== 0 ? avgWin / Math.abs(avgLoss) : 0;

    // For now, use zeros for changes
    const changes = {
      profitFactorChange: 0,
      winRateChange: 0,
      totalPnLChange: 0,
      maxDrawdownChange: 0,
      totalTradesChange: 0,
      avgWinLossRatioChange: 0,
    };

    res.json({
      // Main metrics
      profitFactor: profitFactor || 0,
      winRate: winRate || 0,
      avgWin: avgWin || 0,
      avgLoss: avgLoss || 0,
      maxDrawdown: maxDrawdown || 0,
      totalPnL: totalPnL || 0,
      totalTrades,
      closedTrades,
      avgWinLossRatio,

      // Change metrics (required by frontend)
      ...changes,
    });
  } catch (error) {
    console.error("Error in dashboard KPIs:", error);
    res.status(500).json({ error: error.message });
  }
});

// Other routes remain the same...
router.get("/hourly-summary", (req, res) => {
  try {
    const trades = database.prepare("SELECT * FROM trades").all();
    const hourlySummary = TradingAnalytics.hourlySummary(trades);
    res.json(hourlySummary.slice(0, 6));
  } catch (error) {
    console.error("Error in hourly summary:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/recent-trades", (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const trades = database
      .prepare("SELECT * FROM trades ORDER BY timestamp DESC LIMIT ?")
      .all(limit);

    const enhancedTrades = trades.map((trade) => ({
      ...trade,
      computedPnL: TradingAnalytics.computeTradePnL(trade),
    }));

    res.json(enhancedTrades);
  } catch (error) {
    console.error("Error in recent trades:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/daily-summary", (req, res) => {
  try {
    const trades = database.prepare("SELECT * FROM trades").all();
    let dailySummary = [];
    if (TradingAnalytics.dailySummary) {
      dailySummary = TradingAnalytics.dailySummary(trades).slice(0, 6);
    }
    res.json(dailySummary);
  } catch (error) {
    console.error("Error in daily summary:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
