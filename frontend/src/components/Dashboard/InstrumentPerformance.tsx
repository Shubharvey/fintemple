import React, { useState } from "react";
import { formatCurrency } from "../../utils/formatters";
import { ArrowUp, ArrowDown } from "lucide-react";

interface InstrumentPerformanceProps {
  data?: any[];
  compact?: boolean;
}

const InstrumentPerformance: React.FC<InstrumentPerformanceProps> = ({
  data = [],
}) => {
  const [sortBy, setSortBy] = useState<"winRate" | "avgRR" | "totalPnL">(
    "winRate"
  );

  const getSortedData = () => {
    if (!data || data.length === 0) return [];

    return [...data].sort((a, b) => {
      switch (sortBy) {
        case "winRate":
          return b.winRate - a.winRate;
        case "avgRR":
          return b.avgRR - a.avgRR;
        case "totalPnL":
          return b.totalPnL - a.totalPnL;
        default:
          return 0;
      }
    });
  };

  const sortedData = getSortedData();

  const getSortIcon = (field: string) => {
    return sortBy === field ? (
      <ArrowUp className="w-4 h-4 text-blue-400" />
    ) : (
      <ArrowDown className="w-4 h-4 text-slate-400" />
    );
  };

  const handleSort = (field: "winRate" | "avgRR" | "totalPnL") => {
    if (sortBy === field) {
      setSortBy("winRate"); // Reset to default if already sorted by this field
    } else {
      setSortBy(field);
    }
  };

  // Format currency for mobile (compact display)
  const formatCompactCurrency = (amount: number) => {
    if (Math.abs(amount) >= 100000) {
      const value = amount / 100000;
      return `${value >= 0 ? "+" : ""}₹${value.toFixed(1)}L`;
    } else if (Math.abs(amount) >= 1000) {
      const value = amount / 1000;
      return `${value >= 0 ? "+" : ""}₹${value.toFixed(1)}K`;
    }
    return formatCurrency(amount);
  };

  return (
    <div className="glass-card p-3 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-4">
        <h3 className="text-base md:text-lg font-semibold text-white">
          Instrument Performance
        </h3>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          <button
            onClick={() => handleSort("winRate")}
            className={`flex items-center space-x-1 text-xs font-medium transition-colors ${
              sortBy === "winRate"
                ? "text-blue-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="hidden sm:inline">Win Rate</span>
            <span className="sm:hidden">WR</span>
            {getSortIcon("winRate")}
          </button>
          <button
            onClick={() => handleSort("avgRR")}
            className={`flex items-center space-x-1 text-xs font-medium transition-colors ${
              sortBy === "avgRR"
                ? "text-blue-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="hidden sm:inline">Avg R:R</span>
            <span className="sm:hidden">RR</span>
            {getSortIcon("avgRR")}
          </button>
          <button
            onClick={() => handleSort("totalPnL")}
            className={`flex items-center space-x-1 text-xs font-medium transition-colors ${
              sortBy === "totalPnL"
                ? "text-blue-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="hidden sm:inline">Net P&L</span>
            <span className="sm:hidden">P&L</span>
            {getSortIcon("totalPnL")}
          </button>
        </div>
      </div>

      {/* Mobile Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-1 md:p-2 text-slate-400 font-medium text-xs">
                <span className="hidden sm:inline">Instrument</span>
                <span className="sm:hidden">Instrument</span>
              </th>
              <th className="text-right p-1 md:p-2 text-slate-400 font-medium text-xs">
                <span className="hidden sm:inline">Trades</span>
                <span className="sm:hidden">Trades</span>
              </th>
              <th className="text-right p-1 md:p-2 text-slate-400 font-medium text-xs">
                <span className="hidden sm:inline">Win Rate</span>
                <span className="sm:hidden">WR%</span>
              </th>
              <th className="text-right p-1 md:p-2 text-slate-400 font-medium text-xs">
                <span className="hidden sm:inline">Avg R:R</span>
                <span className="sm:hidden">R:R</span>
              </th>
              <th className="text-right p-1 md:p-2 text-slate-400 font-medium text-xs">
                <span className="hidden sm:inline">Net P&L</span>
                <span className="sm:hidden">P&L</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((instrument, index) => (
              <tr key={index} className="border-b border-white/5">
                <td className="p-1 md:p-2 text-white text-xs">
                  <div className="sm:hidden lg:block">{instrument.symbol}</div>
                  <div className="block sm:hidden lg:hidden">
                    {instrument.symbol.length > 10
                      ? `${instrument.symbol.substring(0, 8)}...`
                      : instrument.symbol}
                  </div>
                </td>
                <td className="p-1 md:p-2 text-slate-300 text-xs text-right">
                  {instrument.totalTrades}
                </td>
                <td className="p-1 md:p-2 text-slate-300 text-xs text-right">
                  <span
                    className={
                      instrument.winRate >= 60
                        ? "text-green-400"
                        : "text-yellow-400"
                    }
                  >
                    {(instrument.winRate * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="p-1 md:p-2 text-slate-300 text-xs text-right">
                  {instrument.avgRR?.toFixed(2) || "0.00"}
                </td>
                <td className="p-1 md:p-2 text-sm text-right">
                  <span
                    className={`font-medium ${
                      instrument.totalPnL >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    <span className="hidden sm:inline">
                      {formatCurrency(instrument.totalPnL)}
                    </span>
                    <span className="sm:hidden">
                      {formatCompactCurrency(instrument.totalPnL)}
                    </span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedData.length === 0 && (
        <div className="text-center py-8 text-slate-400 text-sm px-4">
          No instrument data available
        </div>
      )}
    </div>
  );
};

export default InstrumentPerformance;
