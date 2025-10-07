import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatDate } from "../../utils/formatters";

interface EquityCurveChartProps {
  data?: any[];
  timeframe?: "7D" | "1M" | "all";
  onTimeframeChange?: (timeframe: "7D" | "1M" | "all") => void;
}

const EquityCurveChart: React.FC<EquityCurveChartProps> = ({
  data = [],
  timeframe = "1M",
  onTimeframeChange,
}) => {
  // Filter data based on timeframe
  const getFilteredData = () => {
    if (!data || data.length === 0) return [];

    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case "7D":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "1M":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return data; // Return all data for "all" timeframe
    }

    return data.filter((item: any) => new Date(item.date) >= startDate);
  };

  const chartData = getFilteredData();

  const formatXAxisTick = (tickItem: string) => {
    const date = new Date(tickItem);
    // Mobile: Show shorter format
    return window.innerWidth < 768
      ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
  };

  return (
    <div className="glass-card p-3 md:p-6">
      <h3 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-4">
        Equity Curve
      </h3>

      {/* Time Frame Selector - Mobile Friendly */}
      {onTimeframeChange && (
        <div className="flex justify-center mb-4">
          <div className="inline-flex rounded-lg bg-slate-800/50 p-1">
            <button
              onClick={() => onTimeframeChange("7D")}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                timeframe === "7D"
                  ? "bg-blue-500 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              7D
            </button>
            <button
              onClick={() => onTimeframeChange("1M")}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                timeframe === "1M"
                  ? "bg-blue-500 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              1M
            </button>
            <button
              onClick={() => onTimeframeChange("all")}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                timeframe === "all"
                  ? "bg-blue-500 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All
            </button>
          </div>
        </div>
      )}

      <div className="h-48 md:h-64 lg:h-80">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                strokeDasharray={window.innerWidth < 768 ? "1 1" : "3 3"}
              />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                fontSize={window.innerWidth < 768 ? 10 : 12}
                tickFormatter={formatXAxisTick}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={window.innerWidth < 768 ? 10 : 12}
                tickFormatter={(value) => {
                  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
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
                formatter={(value) => [formatCurrency(Number(value)), "P&L"]}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return formatDate(label);
                }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#3b82f6"
                strokeWidth={window.innerWidth < 768 ? 1 : 2}
                dot={window.innerWidth < 768 ? false : true}
                activeDot={
                  window.innerWidth < 768
                    ? { r: 4, fill: "#1d4ed8" }
                    : { r: 6, fill: "#1d4ed8" }
                }
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm px-4">
            No data available for the selected period
          </div>
        )}
      </div>
    </div>
  );
};

export default EquityCurveChart;
