import React, { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { tradesAPI } from "../services/api";
import { Trade, DashboardSummary } from "../types";
import { useLoading } from "../contexts/LoadingContext";
import LoadingSpinner from "../components/Loading/LoadingSpinner";
import { ChevronDown, X } from "lucide-react";

const Reports: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<string>("today");
  const [timeFrame, setTimeFrame] = useState<string>("day");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showTimeFrameDropdown, setShowTimeFrameDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Refs for dropdown containers
  const dateDropdownRef = useRef<HTMLDivElement>(null);
  const timeFrameDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchReportsData();
    fetchTradesData();
    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Add click outside listener
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", checkMobile);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dateRange]);

  // Function to handle clicks outside the dropdowns
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dateDropdownRef.current &&
      !dateDropdownRef.current.contains(event.target as Node)
    ) {
      setShowDateDropdown(false);
    }
    if (
      timeFrameDropdownRef.current &&
      !timeFrameDropdownRef.current.contains(event.target as Node)
    ) {
      setShowTimeFrameDropdown(false);
    }
  };

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get reports summary, but handle the case where the endpoint might not exist
      try {
        const response = await tradesAPI.getReportsSummary({
          from: getDateRangeFilter(dateRange),
          to: new Date().toISOString(),
        });
        setSummary(response.data);
      } catch (apiError) {
        console.warn(
          "Reports API endpoint not available, using calculated data:",
          apiError
        );
        // If the API endpoint doesn't exist, we'll just use the calculated data from trades
        setSummary(null);
      }
    } catch (err) {
      // Only show error if it's not related to the API endpoint
      if (!(err instanceof Error) || !err.message.includes("404")) {
        setError("Failed to load reports data");
        console.error("Error fetching reports:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTradesData = async () => {
    try {
      const response = await tradesAPI.getAll();
      setTrades(response.data);
    } catch (err) {
      console.error("Error fetching trades:", err);
      setError("Failed to load trades data");
    }
  };

  const getDateRangeFilter = (range: string): string => {
    const now = new Date();
    switch (range) {
      case "today":
        return new Date(now.setHours(0, 0, 0, 0)).toISOString();
      case "week":
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case "month":
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      default:
        return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
    }
  };

  // Calculate real statistics from trades data
  const calculateRealStats = () => {
    const closedTrades = trades.filter((trade) => trade.exit);
    const totalTrades = trades.length;
    const openTrades = trades.length - closedTrades.length;

    // Calculate P&L for each trade
    const tradesWithPnL = closedTrades.map((trade) => {
      const lotSize = trade.volume || trade.lot || 1;
      let pnl;

      if (trade.side === "buy") {
        pnl = (trade.exit! - trade.entry) * lotSize;
      } else {
        pnl = (trade.entry - trade.exit!) * lotSize;
      }

      const netPnl = pnl - (trade.fees || 0);

      return {
        ...trade,
        calculatedPnL: netPnl,
      };
    });

    const winningTrades = tradesWithPnL.filter(
      (trade) => trade.calculatedPnL > 0
    );
    const losingTrades = tradesWithPnL.filter(
      (trade) => trade.calculatedPnL < 0
    );
    const breakEvenTrades = tradesWithPnL.filter(
      (trade) => trade.calculatedPnL === 0
    );

    const grossProfit = tradesWithPnL.reduce(
      (sum, trade) => sum + trade.calculatedPnL,
      0
    );
    const totalFees = tradesWithPnL.reduce(
      (sum, trade) => sum + (trade.fees || 0),
      0
    );
    const netProfit = grossProfit - totalFees;

    const winRate =
      closedTrades.length > 0
        ? (winningTrades.length / closedTrades.length) * 100
        : 0;

    const avgTradePnL =
      closedTrades.length > 0 ? netProfit / closedTrades.length : 0;

    const largestProfit =
      winningTrades.length > 0
        ? Math.max(...winningTrades.map((t) => t.calculatedPnL))
        : 0;

    const largestLoss =
      losingTrades.length > 0
        ? Math.min(...losingTrades.map((t) => t.calculatedPnL))
        : 0;

    // Calculate consecutive wins/losses
    const streaks = calculateStreaks(tradesWithPnL);

    // Calculate trading days and volume
    const tradingDays = calculateTradingDays(trades);
    const avgDailyVolume = tradingDays > 0 ? totalTrades / tradingDays : 0;

    // Calculate profit factor
    const totalWins = winningTrades.reduce(
      (sum, trade) => sum + trade.calculatedPnL,
      0
    );
    const totalLosses = Math.abs(
      losingTrades.reduce((sum, trade) => sum + trade.calculatedPnL, 0)
    );
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : 0;

    // Calculate average win and loss
    const avgWin =
      winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
    const avgLoss =
      losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;

    return {
      totalTrades,
      closedTrades: closedTrades.length,
      openTrades,
      grossProfit,
      netProfit,
      totalFees,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      breakEvenTrades: breakEvenTrades.length,
      winRate,
      avgTradePnL,
      largestProfit,
      largestLoss,
      streaks,
      tradingDays,
      avgDailyVolume,
      profitFactor,
      avgWin,
      avgLoss,
    };
  };

  const calculateStreaks = (tradesWithPnL: any[]) => {
    let currentStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let currentType: "win" | "loss" | null = null;

    tradesWithPnL.forEach((trade) => {
      const isWin = trade.calculatedPnL > 0;
      const isLoss = trade.calculatedPnL < 0;

      if (isWin) {
        if (currentType === "win") {
          currentStreak++;
        } else {
          currentStreak = 1;
          currentType = "win";
        }
        maxWinStreak = Math.max(maxWinStreak, currentStreak);
      } else if (isLoss) {
        if (currentType === "loss") {
          currentStreak++;
        } else {
          currentStreak = 1;
          currentType = "loss";
        }
        maxLossStreak = Math.max(maxLossStreak, currentStreak);
      } else {
        // Break even resets streak
        currentStreak = 0;
        currentType = null;
      }
    });

    return {
      longestWin: maxWinStreak,
      longestLoss: maxLossStreak,
    };
  };

  const calculateTradingDays = (trades: Trade[]) => {
    const uniqueDays = new Set(
      trades.map((trade) => new Date(trade.timestamp).toDateString())
    );
    return uniqueDays.size;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Prepare chart data from real equity curve or calculate from trades
  const getChartData = () => {
    if (summary?.equityCurve && summary.equityCurve.length > 0) {
      return summary.equityCurve.map((item) => ({
        date: formatDate(item.time),
        pnl: item.balance,
      }));
    }

    // Fallback: Calculate cumulative P&L from trades by date
    const tradesByDate = trades
      .filter((trade) => trade.exit)
      .reduce((acc, trade) => {
        const date = new Date(trade.timestamp).toDateString();
        const lotSize = trade.volume || trade.lot || 1;
        let pnl;

        if (trade.side === "buy") {
          pnl = (trade.exit! - trade.entry) * lotSize;
        } else {
          pnl = (trade.entry - trade.exit!) * lotSize;
        }

        const netPnl = pnl - (trade.fees || 0);

        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += netPnl;
        return acc;
      }, {} as { [key: string]: number });

    // Convert to cumulative data
    const dates = Object.keys(tradesByDate).sort();
    let cumulativePnl = 0;

    return dates.map((date) => {
      cumulativePnl += tradesByDate[date];
      return {
        date: formatDate(date),
        pnl: cumulativePnl,
      };
    });
  };

  const stats = calculateRealStats();
  const chartData = getChartData();

  const tradeOutcomesData = [
    { name: "Winning", value: stats.winRate, color: "#10b981" },
    { name: "Losing", value: 100 - stats.winRate, color: "#ef4444" },
    {
      name: "Break Even",
      value: (stats.breakEvenTrades / stats.closedTrades) * 100 || 0,
      color: "#6b7280",
    },
  ].filter((item) => item.value > 0);

  const dateOptions = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "all", label: "All Time" },
  ];

  const timeFrameOptions = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
  ];

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-bold text-white mb-6">
          Reports
        </h1>
        <div className="glass-card p-6">
          <LoadingSpinner size="lg" text="Loading reports data..." />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-xl md:text-2xl font-bold text-white">Reports</h1>
        <div className="text-slate-400 text-sm md:text-base">
          Report for{" "}
          {dateOptions.find((opt) => opt.value === dateRange)?.label || "Today"}{" "}
          ({new Date().toLocaleDateString()})
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Left Column - Chart */}
        <div className="glass-card p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-lg font-semibold text-white">Net P&L</h2>
              <p className="text-slate-400 text-sm">vs Win Rate %</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleDateRangeChange("today")}
                className="text-slate-400 hover:text-white text-sm"
              >
                Clear
              </button>
              <div className="relative" ref={dateDropdownRef}>
                <button
                  onClick={() => setShowDateDropdown(!showDateDropdown)}
                  className="glass border border-white/10 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-blue-500 flex items-center space-x-2 hover:bg-white/5 transition-colors"
                >
                  <span>
                    {dateOptions.find((opt) => opt.value === dateRange)
                      ?.label || "Today"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showDateDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showDateDropdown && (
                  <div className="absolute top-full right-0 mt-1 bg-slate-800 border border-white/10 rounded-lg shadow-lg z-50 backdrop-blur-md">
                    <div className="p-2">
                      {dateOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            handleDateRangeChange(option.value);
                            setShowDateDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                            dateRange === option.value
                              ? "bg-blue-500/20 text-blue-400"
                              : "text-slate-300 hover:bg-white/5"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Time Frame Selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {timeFrameOptions.map((period) => (
              <button
                key={period.value}
                onClick={() => setTimeFrame(period.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeFrame === period.value
                    ? "bg-blue-500 text-white"
                    : "glass border border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={12}
                    tickFormatter={(value) => {
                      if (value >= 1000)
                        return `₹${(value / 1000).toFixed(0)}k`;
                      if (value <= -1000)
                        return `-₹${Math.abs(value / 1000).toFixed(0)}k`;
                      return `₹${value}`;
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [
                      formatCurrency(Number(value)),
                      "P&L",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="pnl"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "#1d4ed8" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                No trade data available for the selected period
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Overall Performance */}
        <div className="glass-card p-4 md:p-6">
          <h2 className="text-lg font-semibold text-white mb-6">
            Overall Performance
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-slate-400 text-sm">Total P&L</span>
              <span
                className={`font-semibold ${
                  stats.netProfit >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {formatCurrency(stats.netProfit)}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-slate-400 text-sm">
                Total Number of Trades
              </span>
              <span className="text-white font-semibold">
                {stats.totalTrades}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-slate-400 text-sm">Average Trade P&L</span>
              <span
                className={`font-semibold ${
                  stats.avgTradePnL >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {formatCurrency(stats.avgTradePnL)}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-slate-400 text-sm">Trade Expectancy</span>
              <span className="text-white font-semibold">
                {formatCurrency(
                  stats.avgWin * (stats.winRate / 100) +
                    stats.avgLoss * ((100 - stats.winRate) / 100)
                )}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-slate-400 text-sm">Profit Factor</span>
              <span className="text-white font-semibold">
                {stats.profitFactor ? stats.profitFactor.toFixed(2) : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Trade Outcomes */}
        <div className="glass-card p-4 md:p-6">
          <h2 className="text-lg font-semibold text-white mb-6">
            Trade Outcomes
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-slate-400 text-sm">
                Number of Winning Trades
              </span>
              <span className="text-green-400 font-semibold">
                {stats.winningTrades}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-slate-400 text-sm">
                Number of Losing Trades
              </span>
              <span className="text-red-400 font-semibold">
                {stats.losingTrades}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-slate-400 text-sm">
                Number of Break Even Trades
              </span>
              <span className="text-slate-400 font-semibold">
                {stats.breakEvenTrades}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-slate-400 text-sm">Largest Profit</span>
              <span className="text-green-400 font-semibold">
                {stats.largestProfit > 0
                  ? formatCurrency(stats.largestProfit)
                  : "N/A"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-slate-400 text-sm">Largest Loss</span>
              <span className="text-red-400 font-semibold">
                {stats.largestLoss < 0
                  ? formatCurrency(stats.largestLoss)
                  : "N/A"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-slate-400 text-sm">
                Max Consecutive Wins
              </span>
              <span className="text-green-400 font-semibold">
                {stats.streaks.longestWin}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-slate-400 text-sm">
                Max Consecutive Losses
              </span>
              <span className="text-red-400 font-semibold">
                {stats.streaks.longestLoss}
              </span>
            </div>
          </div>
        </div>

        {/* Trading Activity - Fixed Layout */}
        <div className="glass-card p-4 md:p-6">
          <h2 className="text-lg font-semibold text-white mb-6">
            Trading Activity
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Stats */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">
                  Average Daily Volume
                </span>
                <span className="text-white font-semibold">
                  {stats.avgDailyVolume.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">
                  Total Trading Days
                </span>
                <span className="text-white font-semibold">
                  {stats.tradingDays}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Logged Days</span>
                <span className="text-white font-semibold">
                  {stats.tradingDays}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Open Trades</span>
                <span className="text-white font-semibold">
                  {stats.openTrades}
                </span>
              </div>
            </div>

            {/* Right Column - Win Rate Chart */}
            {stats.closedTrades > 0 && (
              <div className="flex flex-col">
                <h3 className="text-slate-400 text-sm mb-3 text-center">
                  Win Rate Distribution
                </h3>
                <div className="h-32 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tradeOutcomesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {tradeOutcomesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [
                          `${Number(value).toFixed(1)}%`,
                          "Percentage",
                        ]}
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Summary Text - Always at bottom */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="text-slate-400 text-sm">
              {stats.totalTrades > 0
                ? `You've been actively trading with a daily average volume of ${stats.avgDailyVolume.toFixed(
                    2
                  )} over ${stats.tradingDays} trading days, with ${
                    stats.openTrades
                  } trades currently open.`
                : "No trading data available. Start adding trades to see your performance analytics."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
