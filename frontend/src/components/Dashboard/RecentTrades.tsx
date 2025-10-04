import React, { useEffect, useState } from "react";
import { tradesAPI } from "../../services/api";
import { Trade } from "../../types";

interface RecentTradesProps {
  data?: any;
}

const RecentTrades: React.FC<RecentTradesProps> = () => {
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentTrades = async () => {
      try {
        const response = await tradesAPI.getAll({
          limit: 3,
          sort: "timestamp",
          order: "desc",
        });
        setRecentTrades(response.data.slice(0, 3));
      } catch (error) {
        console.error("Error fetching recent trades:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentTrades();
  }, []);

  // Simple sparkline data
  const generateSparkline = () => {
    return Array.from({ length: 20 }, () => Math.random() * 30 + 10);
  };

  if (loading) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Your recent shared trades
        </h2>
        <div className="flex space-x-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-4 min-w-48 h-32 animate-pulse">
              <div className="h-4 bg-white/10 rounded mb-2"></div>
              <div className="h-6 bg-white/10 rounded mb-3"></div>
              <div className="h-12 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-white mb-4">
        Your recent shared trades
      </h2>
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {recentTrades.map((trade, index) => {
          const sparklineData = generateSparkline();
          const maxVal = Math.max(...sparklineData);
          const minVal = Math.min(...sparklineData);
          const date = new Date(trade.timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={trade.id}
              className="glass-card p-4 min-w-48 flex-shrink-0 hover:transform hover:scale-105 transition-all duration-200"
            >
              <div className="text-xs text-slate-400 mb-2">{date}</div>
              <div className="text-lg font-semibold text-white mb-3">
                {trade.symbol}
              </div>

              {/* Sparkline */}
              <div className="h-12 flex items-end space-x-0.5">
                {sparklineData.map((value, i) => {
                  const height = ((value - minVal) / (maxVal - minVal)) * 100;
                  const color =
                    i === sparklineData.length - 1
                      ? value > sparklineData[sparklineData.length - 2]
                        ? "#10b981"
                        : "#ef4444"
                      : "#6b7280";

                  return (
                    <div
                      key={i}
                      className="flex-1 bg-gray-500 rounded-t"
                      style={{
                        height: `${height}%`,
                        backgroundColor: color,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentTrades;
