import React, { useEffect, useState } from "react";
import { dashboardAPI } from "../../services/api";
import { DashboardSummary } from "../../types";

interface CalendarStripProps {
  data?: DashboardSummary | null;
}

interface DailyData {
  date: string;
  pnl: number;
  trades: number;
}

const formatCompactCurrency = (amount: number, currency: string = "INR") => {
  if (Math.abs(amount) >= 100000) {
    const value = amount / 100000;
    return `${value >= 0 ? "+" : ""}₹${value.toFixed(1)}L`;
  } else if (Math.abs(amount) >= 1000) {
    const value = amount / 1000;
    return `${value >= 0 ? "+" : ""}₹${value.toFixed(1)}K`;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const CalendarStrip: React.FC<CalendarStripProps> = ({ data }) => {
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDailyData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching daily data...");

        // Try to use data from parent first
        if (data?.dailySummary && data.dailySummary.length > 0) {
          console.log("Using data from parent:", data.dailySummary);
          setDailyData(data.dailySummary);
        } else {
          // Fallback: fetch directly from API
          console.log("Fetching from API directly...");
          const dashboardData = await dashboardAPI.getSummary();
          console.log("API response:", dashboardData);

          if (
            dashboardData.dailySummary &&
            dashboardData.dailySummary.length > 0
          ) {
            setDailyData(dashboardData.dailySummary);
          } else {
            setDailyData([]);
          }
        }
      } catch (err: any) {
        console.error("Error fetching daily data:", err);
        console.error("Error details:", err.message, err.stack);
        setError(`Failed to load daily performance data: ${err.message}`);
        setDailyData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyData();
  }, [data]);

  // If loading, show simplified loading state
  if (loading) {
    return (
      <div className="glass-card p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="text-center p-4 rounded-xl glass border border-white/10 animate-pulse"
            >
              <div className="h-4 bg-white/10 rounded mb-2"></div>
              <div className="h-6 bg-white/10 rounded mb-1"></div>
              <div className="h-4 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If error, don't show anything or show minimal error state
  if (error) {
    return null; // Or you can return a minimal error indicator if preferred
    // return (
    //   <div className="glass-card p-3 mb-6">
    //     <div className="text-red-400 text-sm text-center">
    //       Daily data unavailable
    //     </div>
    //   </div>
    // );
  }

  // If no data, don't show anything
  if (dailyData.length === 0) {
    return null;
  }

  return (
    <div className="glass-card p-6 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {dailyData.map((day, index) => (
          <div
            key={index}
            className="text-center p-4 rounded-xl glass border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
          >
            <div className="text-sm text-slate-400 mb-1">{day.date}</div>
            <div
              className={`text-lg font-bold mb-1 ${
                day.pnl > 0
                  ? "text-green-400"
                  : day.pnl < 0
                  ? "text-red-400"
                  : "text-slate-300"
              }`}
            >
              {formatCompactCurrency(day.pnl, "INR")}
            </div>
            <div className="text-xs text-slate-500">{day.trades} trades</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarStrip;
