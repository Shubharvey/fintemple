import React from "react";
import { DashboardSummary } from "../../types";

interface KPICardsProps {
  data?: DashboardSummary | null;
}

// INR formatter
const formatINR = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatCompactINR = (amount: number): string => {
  if (Math.abs(amount) >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (Math.abs(amount) >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (Math.abs(amount) >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return formatINR(amount);
};

const KPICards: React.FC<KPICardsProps> = ({ data }) => {
  // ✅ FIXED: Use backend-calculated values instead of recalculating
  const totalPnL = data?.totalPnL || 0;
  const totalTrades = data?.totalTrades || 0;
  const closedTrades = data?.closedTrades || 0;

  const kpis = [
    {
      title: "Profit Factor",
      value: data?.profitFactor?.toFixed(2) || "0.00",
      change: data?.profitFactorChange?.toFixed(2) || "0.00",
      gradient: "from-green-400 to-blue-500",
      showLiveData: true,
    },
    {
      title: "Win Rate",
      value: data?.winRate ? `${data.winRate.toFixed(1)}%` : "0.0%",
      change: data?.winRateChange?.toFixed(1) || "0.0%",
      gradient: "from-purple-400 to-pink-500",
      showLiveData: false,
    },
    {
      title: "Avg Win vs Avg Loss",
      value:
        data?.avgWin && data?.avgLoss
          ? `${formatCompactINR(data.avgWin)} / ${formatCompactINR(
              data.avgLoss
            )}`
          : "₹0 / ₹0",
      change: data?.avgWinLossRatioChange?.toFixed(2) || "0.00",
      gradient: "from-orange-400 to-red-500",
      showLiveData: true,
    },
    {
      title: "Total P&L",
      value: totalPnL ? formatCompactINR(totalPnL) : "₹0",
      change: data?.totalPnLChange?.toFixed(1) || "0.0%",
      gradient: "from-blue-400 to-cyan-500",
      showLiveData: true,
    },
    {
      title: "Max Drawdown",
      value: data?.maxDrawdown ? `${data.maxDrawdown.toFixed(1)}%` : "0.0%",
      change: data?.maxDrawdownChange?.toFixed(1) || "0.0%",
      gradient: "from-indigo-400 to-purple-500",
      showLiveData: false,
    },
    {
      title: "Total Trades",
      value: totalTrades.toString() || "0",
      change: data?.totalTradesChange?.toString() || "0",
      gradient: "from-yellow-400 to-orange-500",
      showLiveData: false,
    },
  ];

  // Don't render anything if no data is available
  if (!data) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="text-slate-400">No trading data available</div>
        <div className="text-slate-500 text-sm mt-2">
          Start adding trades to see your performance metrics
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {kpis.map((kpi, index) => (
        <div
          key={index}
          className="glass-card p-6 hover:transform hover:scale-105 transition-all duration-200"
        >
          <h3 className="text-sm font-medium text-slate-400 mb-2">
            {kpi.title}
          </h3>
          <div className="flex items-baseline justify-between mb-4">
            <div className="text-2xl font-bold text-white">{kpi.value}</div>
            <div
              className={`text-sm px-2 py-1 rounded-lg ${
                kpi.change?.startsWith("+")
                  ? "text-green-400 bg-green-400/20"
                  : kpi.change?.startsWith("-")
                  ? "text-red-400 bg-red-400/20"
                  : "text-slate-400 bg-slate-400/20"
              }`}
            >
              {kpi.change}
            </div>
          </div>
          <div
            className={`h-2 bg-gradient-to-r ${kpi.gradient} rounded-full mb-2`}
          ></div>
          {kpi.showLiveData && (
            <div className="text-xs text-slate-500 text-right">Live Data</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default KPICards;
