import React from "react";
import CalendarStrip from "../components/Dashboard/CalendarStrip";
import KPICards from "../components/Dashboard/KPICards";
import RecentTrades from "../components/Dashboard/RecentTrades";
import HourlySummary from "../components/Dashboard/HourlySummary";
import { useDashboardData } from "../hooks/useDashboardData";

const Dashboard: React.FC = () => {
  const { data, loading, error } = useDashboardData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Strip */}
      <CalendarStrip data={data} />

      {/* Recent Trades */}
      <RecentTrades data={data} />

      {/* KPI Grid and Hourly Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <KPICards data={data} />
        </div>
        <div className="lg:col-span-1">
          <HourlySummary data={data} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
