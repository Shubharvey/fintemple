const express = require("express");
const { allQuery } = require("../database/db");
const TradingAnalytics = require("../analytics/analytics");

const router = express.Router();

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
router.get("/summary", async (req, res) => {
  try {
    const trades = await allQuery(
      "SELECT * FROM trades ORDER BY timestamp DESC"
    );

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
router.get("/kpis", async (req, res) => {
  try {
    const trades = await allQuery("SELECT * FROM trades");

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

// GET /api/dashboard/hourly-summary
router.get("/hourly-summary", async (req, res) => {
  try {
    const trades = await allQuery("SELECT * FROM trades");
    const hourlySummary = TradingAnalytics.hourlySummary(trades);
    res.json(hourlySummary.slice(0, 6));
  } catch (error) {
    console.error("Error in hourly summary:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dashboard/recent-trades
router.get("/recent-trades", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const trades = await allQuery(
      "SELECT * FROM trades ORDER BY timestamp DESC LIMIT ?",
      [limit]
    );

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

// GET /api/dashboard/daily-summary
router.get("/daily-summary", async (req, res) => {
  try {
    const trades = await allQuery("SELECT * FROM trades");
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

// ✅ NEW ENDPOINTS FOR PERFORMANCE ANALYTICS

// GET /api/dashboard/by-instrument
router.get("/by-instrument", async (req, res) => {
  try {
    const trades = await allQuery("SELECT * FROM trades");
    const instrumentPerformance = TradingAnalytics.instrumentBreakdown(trades);
    res.json(instrumentPerformance);
  } catch (error) {
    console.error("Error in instrument breakdown:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dashboard/by-setup
router.get("/by-setup", async (req, res) => {
  try {
    const trades = await allQuery("SELECT * FROM trades");
    const setupPerformance = TradingAnalytics.strategyBreakdown(trades);
    res.json(setupPerformance);
  } catch (error) {
    console.error("Error in setup breakdown:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dashboard/goals
router.get("/goals", async (req, res) => {
  try {
    const trades = await allQuery("SELECT * FROM trades");

    // Calculate current metrics
    const winRate = TradingAnalytics.winRate(trades) * 100;
    const equitySeries = TradingAnalytics.equityCurve(trades);
    const currentMonthPnL = TradingAnalytics.currentMonthPnL(trades);
    const { maxDrawdown } = TradingAnalytics.drawdowns(equitySeries);

    res.json({
      winRateGoal: 60,
      monthlyPnLGoal: 10000,
      maxDrawdownGoal: 5000,
      winRate: winRate,
      monthlyPnL: currentMonthPnL,
      maxDrawdown: maxDrawdown,
    });
  } catch (error) {
    console.error("Error in goals:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dashboard/equity-curve
router.get("/equity-curve", async (req, res) => {
  try {
    const trades = await allQuery("SELECT * FROM trades");
    const equityCurve = TradingAnalytics.equityCurve(trades);
    res.json(equityCurve);
  } catch (error) {
    console.error("Error in equity curve:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
