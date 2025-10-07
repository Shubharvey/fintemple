import React, { useState, useEffect, useRef } from "react";
import { tradesAPI } from "../services/api";
import { Trade } from "../types";
import { useLoading } from "../contexts/LoadingContext";
import LoadingSpinner from "../components/Loading/LoadingSpinner";
import EnhancedSearch from "../components/Search/EnhancedSearch";
import { Calendar, X, ChevronDown } from "lucide-react";

const Trades: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setLoading: setGlobalLoading } = useLoading();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilters, setSearchFilters] = useState({
    instrumentType: "",
    tradeType: "",
    side: "",
  });

  // Enhanced date filter states
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Ref for the date filter dropdown
  const dateFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTrades();
    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Add click outside listener
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", checkMobile);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [trades, searchQuery, searchFilters, dateFilter, startDate, endDate]);

  // Function to handle clicks outside the dropdown
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dateFilterRef.current &&
      !dateFilterRef.current.contains(event.target as Node)
    ) {
      setShowCustomDatePicker(false);
    }
  };

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };

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

    // Enhanced search filters
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((trade) => {
        if (trade.symbol.toLowerCase().includes(query)) return true;
        if (trade.strategy?.toLowerCase().includes(query)) return true;
        if (trade.tags?.some((tag) => tag.toLowerCase().includes(query)))
          return true;
        if (trade.notes?.toLowerCase().includes(query)) return true;
        return false;
      });
    }

    // Instrument type filter
    if (searchFilters.instrumentType) {
      filtered = filtered.filter(
        (trade) => trade.instrumentType === searchFilters.instrumentType
      );
    }

    // Trade type filter
    if (searchFilters.tradeType) {
      filtered = filtered.filter(
        (trade) => trade.tradeType === searchFilters.tradeType
      );
    }

    // Side filter
    if (searchFilters.side) {
      filtered = filtered.filter((trade) => trade.side === searchFilters.side);
    }

    // Enhanced date filters
    if (dateFilter === "today") {
      const today = new Date().toDateString();
      filtered = filtered.filter(
        (trade) => new Date(trade.timestamp).toDateString() === today
      );
    } else if (dateFilter === "yesterday") {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      filtered = filtered.filter(
        (trade) =>
          new Date(trade.timestamp).toDateString() === yesterday.toDateString()
      );
    } else if (dateFilter === "tomorrow") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      filtered = filtered.filter(
        (trade) =>
          new Date(trade.timestamp).toDateString() === tomorrow.toDateString()
      );
    } else if (dateFilter === "thisWeek") {
      const today = new Date();
      const weekStart = new Date(
        today.setDate(today.getDate() - today.getDay())
      );
      const weekEnd = new Date(
        today.setDate(today.getDate() - today.getDay() + 6)
      );
      filtered = filtered.filter((trade) => {
        const tradeDate = new Date(trade.timestamp);
        return tradeDate >= weekStart && tradeDate <= weekEnd;
      });
    } else if (dateFilter === "thisMonth") {
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      filtered = filtered.filter((trade) => {
        const tradeDate = new Date(trade.timestamp);
        return tradeDate >= monthStart && tradeDate <= monthEnd;
      });
    } else if (dateFilter === "custom" && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      filtered = filtered.filter((trade) => {
        const tradeDate = new Date(trade.timestamp);
        return tradeDate >= start && tradeDate <= end;
      });
    }

    setFilteredTrades(filtered);
  };

  const handleSearch = (query: string, filters: typeof searchFilters) => {
    setSearchQuery(query);
    setSearchFilters(filters);
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
    setSearchQuery("");
    setSearchFilters({ instrumentType: "", tradeType: "", side: "" });
    setDateFilter("all");
    setStartDate("");
    setEndDate("");
    setShowCustomDatePicker(false);
  };

  const stats = calculateStats();

  const dateOptions = [
    { value: "all", label: "All Dates" },
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "tomorrow", label: "Tomorrow" },
    { value: "thisWeek", label: "This Week" },
    { value: "thisMonth", label: "This Month" },
    { value: "custom", label: "Custom Range" },
  ];

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-bold text-white mb-6">
          Trades
        </h1>
        <div className="glass-card p-6">
          <LoadingSpinner size="lg" text="Loading trades data..." />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-xl md:text-2xl font-bold text-white">Trades</h1>
        <div className="text-slate-400 text-sm md:text-base">
          {stats.totalTrades} trades total ({stats.closedTrades} closed,{" "}
          {stats.openTrades} open)
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Enhanced Search Section */}
      <div className="glass-card p-4 md:p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Smart Search</h2>
        <EnhancedSearch
          trades={trades}
          onSearch={handleSearch}
          placeholder="Search by symbol, strategy, tags, or notes..."
        />
      </div>

      {/* Enhanced Date Filters Section */}
      <div className="glass-card p-4 md:p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Date Filters</h2>
          <button
            onClick={resetFilters}
            className="glass border border-white/10 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm"
          >
            Reset All Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Enhanced Date Filter */}
          <div className="relative" ref={dateFilterRef}>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Date Range
            </label>
            <div className="relative">
              <button
                onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
                className="w-full glass border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <span>
                  {dateOptions.find((opt) => opt.value === dateFilter)?.label ||
                    "Select Date Range"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showCustomDatePicker ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Custom Dropdown */}
              {showCustomDatePicker && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-white/10 rounded-lg shadow-lg z-50 backdrop-blur-md">
                  <div className="p-2 max-h-60 overflow-y-auto">
                    {dateOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setDateFilter(option.value);
                          setShowCustomDatePicker(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          dateFilter === option.value
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
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-slate-400 text-sm">
            Showing {filteredTrades.length} of {trades.length} trades
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      {stats.closedTrades > 0 && (
        <div className="glass-card p-4 md:p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Performance Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            <div>
              <div className="text-slate-400 text-xs md:text-sm">Gross P&L</div>
              <div
                className={`text-base md:text-lg font-semibold ${
                  stats.grossProfit >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {formatCurrency(stats.grossProfit)}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-xs md:text-sm">Net P&L</div>
              <div
                className={`text-base md:text-lg font-semibold ${
                  stats.netProfit >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {formatCurrency(stats.netProfit)}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-xs md:text-sm">Win Rate</div>
              <div className="text-base md:text-lg font-semibold text-white">
                {stats.winRate}%
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-xs md:text-sm">
                Winning Trades
              </div>
              <div className="text-base md:text-lg font-semibold text-green-400">
                {stats.winningTrades}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-xs md:text-sm">
                Losing Trades
              </div>
              <div className="text-base md:text-lg font-semibold text-red-400">
                {stats.losingTrades}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-xs md:text-sm">
                Total Trades
              </div>
              <div className="text-base md:text-lg font-semibold text-white">
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
                <th className="text-left p-2 md:p-4 text-slate-400 font-medium text-xs md:text-sm">
                  Date
                </th>
                <th className="text-left p-2 md:p-4 text-slate-400 font-medium text-xs md:text-sm">
                  Symbol
                </th>
                <th className="text-left p-2 md:p-4 text-slate-400 font-medium text-xs md:text-sm">
                  Instrument
                </th>
                <th className="text-left p-2 md:p-4 text-slate-400 font-medium text-xs md:text-sm">
                  Side
                </th>
                <th className="text-left p-2 md:p-4 text-slate-400 font-medium text-xs md:text-sm">
                  Type
                </th>
                <th className="text-left p-2 md:p-4 text-slate-400 font-medium text-xs md:text-sm">
                  Entry
                </th>
                <th className="text-left p-2 md:p-4 text-slate-400 font-medium text-xs md:text-sm">
                  Exit
                </th>
                <th className="text-left p-2 md:p-4 text-slate-400 font-medium text-xs md:text-sm">
                  Lot Size
                </th>
                <th className="text-left p-2 md:p-4 text-slate-400 font-medium text-xs md:text-sm">
                  P&L
                </th>
                <th className="text-left p-2 md:p-4 text-slate-400 font-medium text-xs md:text-sm">
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
                    <td className="p-2 md:p-4 text-slate-300 text-xs md:text-sm">
                      {formatDate(trade.timestamp)}
                    </td>
                    <td className="p-2 md:p-4 text-white font-medium text-sm">
                      {trade.symbol}
                    </td>
                    <td className="p-2 md:p-4 text-slate-300 text-xs md:text-sm capitalize">
                      {trade.instrumentType}
                    </td>
                    <td className="p-2 md:p-4">
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
                    <td className="p-2 md:p-4 text-slate-300 text-xs md:text-sm capitalize">
                      {trade.tradeType?.replace("-", " ") || "-"}
                    </td>
                    <td className="p-2 md:p-4 text-slate-300 text-xs md:text-sm">
                      ₹{trade.entry}
                    </td>
                    <td className="p-2 md:p-4 text-slate-300 text-xs md:text-sm">
                      {trade.exit ? `₹${trade.exit}` : "Open"}
                    </td>
                    <td className="p-2 md:p-4 text-slate-300 text-xs md:text-sm">
                      {trade.volume || trade.lot || 1}
                    </td>
                    <td className="p-2 md:p-4">
                      {trade.exit ? (
                        <div>
                          <div
                            className={`font-medium text-xs md:text-sm ${
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
                        <span className="text-slate-500 text-xs">-</span>
                      )}
                    </td>
                    <td className="p-2 md:p-4 text-slate-400 text-xs md:text-sm">
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
