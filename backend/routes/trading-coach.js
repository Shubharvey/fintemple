const express = require("express");
const router = express.Router();

// Generate insights based on trade data
router.post("/insights", async (req, res) => {
  try {
    const { trades } = req.body;

    if (!trades || trades.length === 0) {
      return res.json({
        insights: [
          {
            category: "general",
            message:
              "👋 Welcome! I'm your AI Trading Coach. Start adding trades to receive personalized insights and suggestions to improve your trading performance.",
            priority: "medium",
            actionable: true,
          },
        ],
      });
    }

    // Calculate basic metrics
    const closedTrades = trades.filter((t) => t.status === "closed");

    if (closedTrades.length === 0) {
      return res.json({
        insights: [
          {
            category: "general",
            message:
              "You have open trades. Close some positions to get detailed performance analysis!",
            priority: "medium",
            actionable: true,
          },
        ],
      });
    }

    const metrics = calculateBasicMetrics(closedTrades);
    const insights = generateAIInsights(closedTrades, metrics);

    res.json({ insights });
  } catch (error) {
    console.error("Error generating insights:", error);
    res.status(500).json({
      error: "Failed to generate insights",
      insights: generateFallbackInsights(),
    });
  }
});

// Chat endpoint for interactive conversations
router.post("/chat", async (req, res) => {
  try {
    const { message, trades, insights } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await generateAIResponse(message, trades, insights);

    res.json(response);
  } catch (error) {
    console.error("Error processing chat message:", error);
    res.status(500).json({
      response:
        "I'm having trouble processing your request right now. Please try again later.",
      category: "insight",
    });
  }
});

// Helper functions
function calculateBasicMetrics(trades) {
  const winningTrades = trades.filter((t) => (t.pnl || 0) > 0);
  const losingTrades = trades.filter((t) => (t.pnl || 0) < 0);

  const totalWins = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalLosses = Math.abs(
    losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  );

  return {
    winRate:
      trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
    profitFactor: totalLosses > 0 ? totalWins / totalLosses : 0,
    totalPnL: trades.reduce((sum, t) => sum + (t.pnl || 0), 0),
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
  };
}

function generateAIInsights(trades, metrics) {
  const insights = [];

  // Win rate insights
  if (metrics.winRate < 40) {
    insights.push({
      category: "win_rate",
      message: `🎯 Your win rate is ${metrics.winRate.toFixed(
        1
      )}%, which needs improvement. Focus on better entry timing and trade selection.`,
      priority: "high",
      actionable: true,
      metrics: { winRate: metrics.winRate },
    });
  } else if (metrics.winRate > 60) {
    insights.push({
      category: "win_rate",
      message: `🎉 Excellent! Your win rate is ${metrics.winRate.toFixed(
        1
      )}%. You're doing great with trade selection.`,
      priority: "low",
      actionable: false,
      metrics: { winRate: metrics.winRate },
    });
  }

  // Profitability insights
  if (metrics.totalPnL < 0) {
    insights.push({
      category: "profitability",
      message: `📉 Currently down ₹${Math.abs(
        metrics.totalPnL
      ).toLocaleString()}. Let's focus on risk management and position sizing.`,
      priority: "high",
      actionable: true,
      metrics: { totalPnL: metrics.totalPnL },
    });
  } else if (metrics.totalPnL > 10000) {
    insights.push({
      category: "profitability",
      message: `🚀 Amazing! You're up ₹${metrics.totalPnL.toLocaleString()}. Great work on managing your trades!`,
      priority: "low",
      actionable: false,
      metrics: { totalPnL: metrics.totalPnL },
    });
  }

  // Profit factor insights
  if (metrics.profitFactor < 1 && metrics.totalTrades > 5) {
    insights.push({
      category: "profitability",
      message: `💰 Your profit factor is ${metrics.profitFactor.toFixed(
        2
      )}. Work on making your winners bigger than your losers.`,
      priority: "high",
      actionable: true,
      metrics: { profitFactor: metrics.profitFactor },
    });
  }

  return insights.length > 0
    ? insights
    : [
        {
          category: "general",
          message:
            "Your trading looks good! Keep focusing on consistency and risk management.",
          priority: "low",
          actionable: false,
        },
      ];
}

function generateFallbackInsights() {
  return [
    {
      category: "general",
      message:
        "I'm here to help analyze your trading performance. Add some trades to get started!",
      priority: "medium",
      actionable: true,
    },
  ];
}

async function generateAIResponse(message, trades, insights) {
  const lowerMessage = message.toLowerCase();

  // Simple AI response logic - you can enhance this with real AI later
  if (lowerMessage.includes("win rate") || lowerMessage.includes("winning")) {
    const closedTrades = trades.filter((t) => t.status === "closed");
    const metrics = calculateBasicMetrics(closedTrades);
    return {
      response: `Your current win rate is ${metrics.winRate.toFixed(
        1
      )}% based on ${closedTrades.length} closed trades. ${
        metrics.winRate < 50
          ? "Focus on improving your trade selection and entry timing."
          : "Great job on maintaining a solid win rate!"
      }`,
      category: "insight",
    };
  }

  if (lowerMessage.includes("risk") || lowerMessage.includes("stop loss")) {
    return {
      response:
        "💰 **Risk Management Tips:**\n• Risk 1-2% of account per trade\n• Use stop losses always\n• Aim for 1.5:1 risk-reward ratio\n• Never chase losses\n• Keep position sizes consistent",
      category: "suggestion",
    };
  }

  if (lowerMessage.includes("improve") || lowerMessage.includes("better")) {
    const topInsight = insights && insights.length > 0 ? insights[0] : null;
    return {
      response: topInsight
        ? `Based on your trading: ${topInsight.message}`
        : "📈 **To Improve:**\n1. Keep a detailed trading journal\n2. Review trades weekly\n3. Focus on risk management\n4. Be patient with setups\n5. Learn from both wins and losses",
      category: "suggestion",
    };
  }

  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return {
      response:
        "👋 Hello! I'm your AI Trading Coach. I can analyze your trades, suggest improvements, and help with trading strategies. What would you like to know?",
      category: "insight",
    };
  }

  // Default response
  return {
    response:
      "I can help you analyze your trading performance, suggest improvements, and discuss trading strategies. Ask me about your win rate, risk management, or any trading questions!",
    category: "insight",
  };
}

module.exports = router;
