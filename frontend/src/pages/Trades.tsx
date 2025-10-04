import React, { useState, useEffect } from "react";
import { tradesAPI } from "../services/api";
import { Trade } from "../types";

const Trades: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [dateFilter, setDateFilter] = useState<string>("all"); // "all", "today", "custom"
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [symbolFilter, setSymbolFilter] = useState<string>("");
  const [sideFilter, setSideFilter] = useState<string>("all");
  const [tradeTypeFilter, setTradeTypeFilter] = useState<string>("all");

  useEffect(() => {
    fetchTrades();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    trades,
    dateFilter,
    startDate,
    endDate,
    symbolFilter,
    sideFilter,
    tradeTypeFilter,
  ]);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const response = await tradesAPI.getAll();
      console.log("Fetched trades data:", response.data);
      setTrades(response.data);
    } catch (err) {
      setError("Failed to fetch trades");
      console.error("Error fetching trades:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...trades];

    // Date filter
    if (dateFilter === "today") {
      const today = new Date().toDateString();
      filtered = filtered.filter(
        (trade) => new Date(trade.timestamp).toDateString() === today
      );
    } else if (dateFilter === "custom" && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include entire end day

      filtered = filtered.filter((trade) => {
        const tradeDate = new Date(trade.timestamp);
        return tradeDate >= start && tradeDate <= end;
      });
    }

    // Symbol filter
    if (symbolFilter) {
      filtered = filtered.filter((trade) =>
        trade.symbol.toLowerCase().includes(symbolFilter.toLowerCase())
      );
    }

    // Side filter
    if (sideFilter !== "all") {
      filtered = filtered.filter((trade) => trade.side === sideFilter);
    }

    // Trade type filter
    if (tradeTypeFilter !== "all") {
      filtered = filtered.filter(
        (trade) => trade.tradeType === tradeTypeFilter
      );
    }

    setFilteredTrades(filtered);
  };

  const calculateStats = () => {
    const closedTrades = filteredTrades.filter((trade) => trade.exit);

    const grossProfit = closedTrades.reduce((sum, trade) => {
      const localPnL = calculateLocalPnL(trade);
      return sum + (localPnL || 0);
    }, 0);

    const netProfit = closedTrades.reduce((sum, trade) => {
      const localPnL = calculateLocalPnL(trade);
      const fees = trade.fees || 0;
      return sum + (localPnL || 0) - fees;
    }, 0);

    const winningTrades = closedTrades.filter((trade) => {
      const localPnL = calculateLocalPnL(trade);
      return (localPnL || 0) > 0;
    }).length;

    const losingTrades = closedTrades.filter((trade) => {
      const localPnL = calculateLocalPnL(trade);
      return (localPnL || 0) < 0;
    }).length;

    const winRate =
      closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0;

    return {
      totalTrades: filteredTrades.length,
      closedTrades: closedTrades.length,
      openTrades: filteredTrades.length - closedTrades.length,
      grossProfit,
      netProfit,
      winningTrades,
      losingTrades,
      winRate: Math.round(winRate * 100) / 100,
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  // Calculate P&L locally
  const calculateLocalPnL = (trade: Trade) => {
    if (!trade.exit) return null;

    let pnl;
    if (trade.side === "buy") {
      pnl = (trade.exit - trade.entry) * (trade.volume || trade.lot || 1);
    } else {
      pnl = (trade.entry - trade.exit) * (trade.volume || trade.lot || 1);
    }

    return pnl;
  };

  const resetFilters = () => {
    setDateFilter("all");
    setStartDate("");
    setEndDate("");
    setSymbolFilter("");
    setSideFilter("all");
    setTradeTypeFilter("all");
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Trades</h1>
        <div className="glass-card p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-white/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Trades</h1>
        <div className="text-slate-400">
          {stats.totalTrades} trades total ({stats.closedTrades} closed,{" "}
          {stats.openTrades} open)
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Filters Section */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Filters</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Date Range
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full glass border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {dateFilter === "custom" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full glass border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full glass border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}

          {/* Symbol Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Symbol
            </label>
            <input
              type="text"
              value={symbolFilter}
              onChange={(e) => setSymbolFilter(e.target.value)}
              placeholder="Filter by symbol..."
              className="w-full glass border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Side Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Side
            </label>
            <select
              value={sideFilter}
              onChange={(e) => setSideFilter(e.target.value)}
              className="w-full glass border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Sides</option>
              <option value="buy">Buy Only</option>
              <option value="sell">Sell Only</option>
            </select>
          </div>

          {/* Trade Type Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Trade Type
            </label>
            <select
              value={tradeTypeFilter}
              onChange={(e) => setTradeTypeFilter(e.target.value)}
              className="w-full glass border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="intraday">Intraday</option>
              <option value="scalp">Scalp</option>
              <option value="swing">Swing</option>
              <option value="short-term">Short Term</option>
              <option value="long-term">Long Term</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-slate-400 text-sm">
            Showing {filteredTrades.length} of {trades.length} trades
          </div>
          <button
            onClick={resetFilters}
            className="glass border border-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Statistics Section */}
      {stats.closedTrades > 0 && (
        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Performance Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
            <div>
              <div className="text-slate-400 text-sm">Gross P&L</div>
              <div
                className={`text-lg font-semibold ${
                  stats.grossProfit >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {formatCurrency(stats.grossProfit)}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-sm">Net P&L</div>
              <div
                className={`text-lg font-semibold ${
                  stats.netProfit >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {formatCurrency(stats.netProfit)}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-sm">Win Rate</div>
              <div className="text-lg font-semibold text-white">
                {stats.winRate}%
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-sm">Winning Trades</div>
              <div className="text-lg font-semibold text-green-400">
                {stats.winningTrades}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-sm">Losing Trades</div>
              <div className="text-lg font-semibold text-red-400">
                {stats.losingTrades}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-sm">Total Trades</div>
              <div className="text-lg font-semibold text-white">
                {stats.closedTrades}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trades Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-slate-400 font-medium">
                  Date
                </th>
                <th className="text-left p-4 text-slate-400 font-medium">
                  Symbol
                </th>
                <th className="text-left p-4 text-slate-400 font-medium">
                  Side
                </th>
                <th className="text-left p-4 text-slate-400 font-medium">
                  Type
                </th>
                <th className="text-left p-4 text-slate-400 font-medium">
                  Entry
                </th>
                <th className="text-left p-4 text-slate-400 font-medium">
                  Exit
                </th>
                <th className="text-left p-4 text-slate-400 font-medium">
                  Lot Size
                </th>
                <th className="text-left p-4 text-slate-400 font-medium">
                  P&L
                </th>
                <th className="text-left p-4 text-slate-400 font-medium">
                  Strategy
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map((trade) => {
                const localPnL = calculateLocalPnL(trade);
                const displayPnL =
                  localPnL !== null
                    ? localPnL
                    : trade.computedPnL?.profitMoney || 0;
                const fees = trade.fees || 0;
                const netPnL = displayPnL - fees;

                return (
                  <tr
                    key={trade.id}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="p-4 text-slate-300 text-sm">
                      {formatDate(trade.timestamp)}
                    </td>
                    <td className="p-4 text-white font-medium">
                      {trade.symbol}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          trade.side === "buy"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {trade.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300 text-sm capitalize">
                      {trade.tradeType?.replace("-", " ") || "-"}
                    </td>
                    <td className="p-4 text-slate-300">₹{trade.entry}</td>
                    <td className="p-4 text-slate-300">
                      {trade.exit ? `₹${trade.exit}` : "Open"}
                    </td>
                    <td className="p-4 text-slate-300">
                      {trade.volume || trade.lot || 1}
                    </td>
                    <td className="p-4">
                      {trade.exit ? (
                        <div>
                          <div
                            className={`font-medium ${
                              netPnL > 0
                                ? "text-green-400"
                                : netPnL < 0
                                ? "text-red-400"
                                : "text-slate-400"
                            }`}
                          >
                            {formatCurrency(netPnL)}
                          </div>
                          {fees > 0 && (
                            <div className="text-xs text-slate-500">
                              Fees: ₹{fees}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400 text-sm">
                      {trade.strategy || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredTrades.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            No trades found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default Trades;
