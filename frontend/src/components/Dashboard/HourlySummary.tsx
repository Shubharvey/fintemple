import React from "react";
import { DashboardSummary } from "../../types";

interface HourlySummaryProps {
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

const HourlySummary: React.FC<HourlySummaryProps> = ({ data }) => {
  // Use real data from backend only - no demo data
  const hourlyData = data?.hourlySummary || [];

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, "0")}:00`;
  };

  // Don't render anything if no hourly data is available
  if (!hourlyData || hourlyData.length === 0) {
    return (
      <div className="glass-card p-6 h-fit">
        <h3 className="text-lg font-semibold text-white mb-4">Hourly P&L</h3>
        <div className="text-center py-8">
          <div className="text-slate-400 mb-2">No hourly data available</div>
          <div className="text-slate-500 text-sm">
            Trades will appear here by hour
          </div>
        </div>
      </div>
    );
  }

  // Calculate total P&L for percentage calculations
  const totalPnL = hourlyData.reduce(
    (sum, hour) => sum + Math.abs(hour.pnl),
    0
  );

  return (
    <div className="glass-card p-6 h-fit">
      <h3 className="text-lg font-semibold text-white mb-4">Hourly P&L</h3>
      <div className="space-y-4">
        {hourlyData.slice(0, 6).map((hour, index) => {
          // Calculate percentage of total for the progress bar
          const percentOfTotal =
            totalPnL > 0 ? (Math.abs(hour.pnl) / totalPnL) * 100 : 0;

          return (
            <div
              key={index}
              className="flex items-center justify-between group"
            >
              <div className="text-sm text-slate-300 w-12 font-medium">
                {formatHour(hour.hour)}
              </div>
              <div className="flex-1 mx-4">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden group-hover:bg-white/20 transition-colors">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentOfTotal}%` }}
                  />
                </div>
              </div>
              <div
                className={`text-sm font-semibold w-20 text-right ${
                  hour.pnl > 0
                    ? "text-green-400"
                    : hour.pnl < 0
                    ? "text-red-400"
                    : "text-slate-400"
                }`}
              >
                {formatINR(hour.pnl)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HourlySummary;
