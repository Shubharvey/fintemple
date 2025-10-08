// Enhanced Trading Knowledge Base
export interface TradingConcept {
  category:
    | "psychology"
    | "risk_management"
    | "technical_analysis"
    | "strategy"
    | "mindset";
  topic: string;
  subtopics: string[];
  commonQuestions: string[];
  expertAdvice: string[];
  warningSigns: string[];
  actionableSteps: string[];
  keyPhrases: string[]; // For better pattern matching
  severity: "low" | "medium" | "high";
}

export const tradingKnowledge: TradingConcept[] = [
  {
    category: "psychology",
    topic: "Fear of Missing Out (FOMO)",
    subtopics: ["entry FOMO", "exit FOMO", "overtrading"],
    commonQuestions: [
      "How do I avoid chasing trades?",
      "I keep entering late and getting stopped out",
      "How to control the urge to trade every setup?",
      "I feel anxious when I see others making money",
    ],
    expertAdvice: [
      "FOMO comes from scarcity mindset - remember there are always new opportunities",
      "Create a trading plan with specific entry criteria and stick to it",
      "If you miss a trade, analyze why it met your criteria for learning, not for regret",
      "The market will always provide another opportunity - patience is your edge",
    ],
    warningSigns: [
      "Entering trades without proper setup",
      "Increasing position size to 'make up' for missed trades",
      "Trading outside market hours",
      "Feeling rushed or panicked during market hours",
    ],
    actionableSteps: [
      "Wait for price to come back to your predefined entry zone",
      "Practice patience with demo trading",
      "Keep a journal of missed trades and review weekly",
      "Set a rule: Wait 15 minutes before entering any FOMO trade",
    ],
    keyPhrases: [
      "fomo",
      "chasing",
      "missed",
      "late entry",
      "rushed",
      "panic buy",
    ],
    severity: "high",
  },
  {
    category: "psychology",
    topic: "Revenge Trading",
    subtopics: ["emotional trading", "loss recovery", "overtrading after loss"],
    commonQuestions: [
      "How do I stop revenge trading?",
      "I keep trying to recover losses immediately",
      "Why do I make my worst trades after a loss?",
    ],
    expertAdvice: [
      "Revenge trading is emotional, not strategic - recognize the emotional trigger",
      "Losses are part of trading - accept them as business expenses",
      "The goal is long-term profitability, not winning every single trade",
      "Professional traders focus on process, not individual trade outcomes",
    ],
    warningSigns: [
      "Trading immediately after a loss",
      "Increasing position size after losses",
      "Ignoring your trading rules",
      "Feeling angry or frustrated at the market",
    ],
    actionableSteps: [
      "Take a mandatory 2-hour break after any significant loss",
      "Close your trading platform and walk away",
      "Review what went wrong objectively, without emotion",
      "Return with 50% normal position size for next 3 trades",
    ],
    keyPhrases: [
      "revenge",
      "recover loss",
      "angry trading",
      "frustrated",
      "after loss",
    ],
    severity: "high",
  },
  {
    category: "risk_management",
    topic: "Position Sizing",
    subtopics: ["risk per trade", "account management", "kelly criterion"],
    commonQuestions: [
      "How much should I risk per trade?",
      "What's the proper position size?",
      "How to calculate lot size?",
      "Should I risk more when I'm winning?",
    ],
    expertAdvice: [
      "Never risk more than 1-2% of your account on any single trade",
      "Position size should be determined by your stop loss distance, not by how confident you feel",
      "Use the formula: Position Size = (Account Risk) / (Entry - Stop Loss)",
      "Consistent position sizing is more important than optimal position sizing",
    ],
    warningSigns: [
      "Risking more than 2% per trade",
      "Varying position sizes based on gut feeling",
      "No clear calculation for position size",
      "Increasing risk after wins (overconfidence)",
    ],
    actionableSteps: [
      "Create a position sizing calculator spreadsheet",
      "Always calculate position size before entering any trade",
      "Set hard limits and use trading platform controls to enforce them",
      "Review position sizing in your trade journal weekly",
    ],
    keyPhrases: [
      "position size",
      "risk per trade",
      "lot size",
      "how much to risk",
      "account risk",
    ],
    severity: "high",
  },
  {
    category: "risk_management",
    topic: "Stop Loss Strategies",
    subtopics: ["technical stops", "volatility stops", "time-based stops"],
    commonQuestions: [
      "Where should I place my stop loss?",
      "How to avoid getting stopped out too early?",
      "Should I move my stop loss?",
      "What's the best stop loss strategy?",
    ],
    expertAdvice: [
      "Place stops at logical technical levels, not arbitrary percentages",
      "Use ATR (Average True Range) to set stops based on market volatility",
      "Once placed, never move your stop loss away from the price",
      "Your stop loss should be placed where your trade thesis is invalidated",
    ],
    warningSigns: [
      "Moving stop loss further away when trade goes against you",
      "No clear reasoning for stop placement",
      "Stops too tight for the market volatility",
      "Removing stops because 'it will come back'",
    ],
    actionableSteps: [
      "Always determine stop loss BEFORE entering trade",
      "Use 2x ATR for volatile markets, 1x ATR for calm markets",
      "Place stops below support (long) or above resistance (short)",
      "Make stop placement part of your trade checklist",
    ],
    keyPhrases: [
      "stop loss",
      "stop out",
      "where to place stop",
      "moving stop",
      "tight stop",
    ],
    severity: "high",
  },
  {
    category: "psychology",
    topic: "Trading Discipline",
    subtopics: ["rule following", "consistency", "execution quality"],
    commonQuestions: [
      "How to stick to my trading plan?",
      "I know what to do but I don't do it",
      "How to build trading discipline?",
      "Why do I break my own rules?",
    ],
    expertAdvice: [
      "Discipline is a muscle - build it with small, consistent actions",
      "Focus on process excellence, not profit outcomes",
      "Create accountability systems - trade journals, mentors, or peer groups",
      "The pain of discipline is less than the pain of regret",
    ],
    warningSigns: [
      "Making exceptions 'just this once'",
      "Not following predefined entry/exit rules",
      "Trading without completing pre-market routine",
      "Justifying rule breaks after the fact",
    ],
    actionableSteps: [
      "Grade your discipline (A-F) for every trade in your journal",
      "Create a mandatory pre-trade checklist and never skip it",
      "Find a trading accountability partner",
      "Start with small position sizes to reduce emotional pressure",
    ],
    keyPhrases: [
      "discipline",
      "stick to plan",
      "follow rules",
      "breaking rules",
      "self control",
    ],
    severity: "medium",
  },
  {
    category: "strategy",
    topic: "Backtesting and Strategy Development",
    subtopics: [
      "historical testing",
      "edge identification",
      "strategy optimization",
    ],
    commonQuestions: [
      "How do I know if my strategy works?",
      "What should I backtest?",
      "How many trades to prove a strategy?",
      "Why does my strategy stop working?",
    ],
    expertAdvice: [
      "Backtest at least 100-200 trades to have statistical significance",
      "Focus on robustness, not optimization - a simple strategy that works in different conditions is better",
      "Include transaction costs and slippage in your backtests",
      "Markets change - regularly review and adapt your strategies",
    ],
    warningSigns: [
      "Over-optimizing based on past data (curve fitting)",
      "Changing strategies too frequently",
      "No clear edge or rationale for the strategy",
      "Ignoring drawdowns because 'it will work long-term'",
    ],
    actionableSteps: [
      "Backtest on out-of-sample data (data not used in development)",
      "Document your strategy's edge and under what conditions it works best",
      "Set clear metrics for success: win rate, profit factor, max drawdown",
      "Review strategy performance monthly and make small adjustments",
    ],
    keyPhrases: [
      "backtest",
      "strategy development",
      "edge",
      "system",
      "prove strategy",
    ],
    severity: "medium",
  },
  {
    category: "mindset",
    topic: "Process Over Outcome",
    subtopics: [
      "long-term thinking",
      "probabilistic mindset",
      "detachment from results",
    ],
    commonQuestions: [
      "How to not get emotional about wins and losses?",
      "Why do I feel like a failure after losses?",
      "How to think like a professional trader?",
      "Should I focus on profits or process?",
    ],
    expertAdvice: [
      "Focus on executing your process perfectly - results will follow over time",
      "Treat trading as a business, not gambling - focus on risk-adjusted returns",
      "Detach your self-worth from trading performance",
      "Professional traders care about making good decisions, not about being right",
    ],
    warningSigns: [
      "Basing self-worth on daily P&L",
      "Getting overconfident after wins",
      "Hiding losses or not journaling them properly",
      "Making emotional decisions based on recent results",
    ],
    actionableSteps: [
      "Keep a decision journal separate from your trade journal",
      "Review trades based on quality of decision, not outcome",
      "Set process goals (follow checklist, proper position sizing) instead of profit goals",
      "Practice meditation or mindfulness to build emotional detachment",
    ],
    keyPhrases: [
      "process vs outcome",
      "emotional trading",
      "probabilistic",
      "detachment",
      "professional mindset",
    ],
    severity: "medium",
  },
  {
    category: "risk_management",
    topic: "Drawdown Management",
    subtopics: ["loss recovery", "risk reduction", "psychological impact"],
    commonQuestions: [
      "How to recover from a drawdown?",
      "When should I stop trading after losses?",
      "How much drawdown is normal?",
      "Should I increase risk to recover faster?",
    ],
    expertAdvice: [
      "Never increase risk to recover losses - this leads to ruin",
      "A 10-20% drawdown is normal, beyond 20% requires strategy review",
      "The first loss is the best loss - cut it quickly",
      "Focus on preserving capital first, making profits second",
    ],
    warningSigns: [
      "Drawdown exceeding 20% of account",
      "Increasing risk after losses",
      "Trying new, untested strategies during drawdown",
      "Ignoring risk management because 'I need to recover'",
    ],
    actionableSteps: [
      "Reduce position size by 50% after 10% drawdown",
      "Take a trading break after 15% drawdown to review strategy",
      "Implement daily loss limits and weekly loss limits",
      "Focus on consistent small wins rather than home runs",
    ],
    keyPhrases: [
      "drawdown",
      "recover losses",
      "down too much",
      "loss streak",
      "account down",
    ],
    severity: "high",
  },
  {
    category: "psychology",
    topic: "Overconfidence",
    subtopics: ["winning streaks", "attribution error", "risk complacency"],
    commonQuestions: [
      "Why do I lose money after winning streaks?",
      "How to stay humble in trading?",
      "I feel invincible after wins - is this dangerous?",
      "How to manage success in trading?",
    ],
    expertAdvice: [
      "Overconfidence is more dangerous than fear - it leads to reckless risk-taking",
      "Attribute wins to your process, not your brilliance",
      "The market humbles everyone eventually - stay grounded",
      "Success in trading requires constant vigilance, not celebration",
    ],
    warningSigns: [
      "Increasing position size without justification",
      "Taking lower probability trades",
      "Reducing preparation and research",
      "Feeling like you 'can't lose'",
    ],
    actionableSteps: [
      "Maintain consistent position sizing regardless of recent performance",
      "Review losses and mistakes even during winning streaks",
      "Keep a gratitude journal for the market opportunities",
      "Have a mentor or peer who can give you honest feedback",
    ],
    keyPhrases: [
      "overconfident",
      "winning streak",
      "invincible",
      "too confident",
      "after wins",
    ],
    severity: "high",
  },
  // We can keep adding more topics - this structure makes it scalable
];

// Helper function to find relevant trading concepts based on user message
export const findRelevantConcepts = (userMessage: string): TradingConcept[] => {
  const lowerMessage = userMessage.toLowerCase();

  return tradingKnowledge.filter(
    (concept) =>
      concept.keyPhrases.some((phrase) => lowerMessage.includes(phrase)) ||
      concept.commonQuestions.some(
        (question) =>
          question.toLowerCase().includes(lowerMessage) ||
          lowerMessage.includes(question.toLowerCase())
      )
  );
};

// Get concepts by category
export const getConceptsByCategory = (
  category: TradingConcept["category"]
): TradingConcept[] => {
  return tradingKnowledge.filter((concept) => concept.category === category);
};

// Get concepts by severity
export const getConceptsBySeverity = (
  severity: TradingConcept["severity"]
): TradingConcept[] => {
  return tradingKnowledge.filter((concept) => concept.severity === severity);
};
