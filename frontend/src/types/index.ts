export interface Trade {
  id: string;
  timestamp: string;
  exitTimestamp?: string;
  symbol: string;
  instrumentType: "forex" | "stock" | "crypto";
  side: "buy" | "sell";
  entry: number;
  exit?: number;
  sl?: number;
  tp?: number;
  lot?: number;
  volume?: number;
  contractSize?: number;
  pipDecimal?: number;
  pipValuePerLot?: number;
  fees?: number;
  tags?: string[];
  strategy?: string;
  marketCondition?: string;
  notes?: string;
  screenshotUrl?: string;
  computedPnL?: {
    profitPips: number;
    profitMoney: number;
  };
}

export interface DashboardSummary {
  equityCurve: Array<{ time: string; balance: number }>;
  drawdownSeries: Array<{ time: string; drawdown: number }>;
  maxDrawdown: number;
  profitFactor: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  avgRR: number;
  sharpe: number;
  sortino: number;
  streaks: { longestWin: number; longestLoss: number };
  heatmap: { byWeekdayHour: number[][]; counts: number[][] };
  hourlySummary: Array<{ hour: number; pnl: number; percentOfTotal: number }>;
  strategyBreakdown: Array<{
    strategy: string;
    trades: number;
    profit: number;
    winRate: number;
    equitySeries: Array<{ time: string; balance: number }>;
  }>;
  monteCarlo: {
    simulations: number;
    percentiles: { p10: number; p50: number; p90: number };
    ruinProbability: number;
  };
}
