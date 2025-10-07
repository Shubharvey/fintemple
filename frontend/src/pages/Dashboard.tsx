import React, { useState } from "react";
import { useLoading } from "../contexts/LoadingContext";
import LoadingSpinner from "../components/Loading/LoadingSpinner";
import KPICards from "../components/Dashboard/KPICards";
import RecentTrades from "../components/Dashboard/RecentTrades";
import HourlySummary from "../components/Dashboard/HourlySummary";
import EquityCurveChart from "../components/Dashboard/EquityCurveChart";
import SetupPerformance from "../components/Dashboard/SetupPerformance";
import InstrumentPerformance from "../components/Dashboard/InstrumentPerformance";
import GoalTracking from "../components/Dashboard/GoalTracking";
import { useDashboardData } from "../hooks/useDashboardData";
import {
  BarChart3,
  TrendingUp,
  Clock,
  ChevronDown,
  ChevronUp,
  LineChart,
  Target,
  DollarSign,
  Filter,
} from "lucide-react";

const Dashboard: React.FC = () => {
  const { data, loading, error } = useDashboardData();
  const [activeTab, setActiveTab] = useState<
    "overview" | "trades" | "analytics" | "performance"
  >("overview");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<"7D" | "1M" | "all">("1M");
  const [showFilters, setShowFilters] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400 text-center p-4">
          <div className="text-lg font-semibold mb-2">Failed to load data</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  // Mobile Bottom Navigation
  const MobileNav = () => (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 backdrop-blur-xl z-50">
      <div className="flex justify-around items-center h-16">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex flex-col items-center p-2 transition-all ${
            activeTab === "overview" ? "text-blue-400" : "text-slate-400"
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-xs mt-1">Overview</span>
        </button>
        <button
          onClick={() => setActiveTab("trades")}
          className={`flex flex-col items-center p-2 transition-all ${
            activeTab === "trades" ? "text-blue-400" : "text-slate-400"
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-xs mt-1">Trades</span>
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex flex-col items-center p-2 transition-all ${
            activeTab === "analytics" ? "text-blue-400" : "text-slate-400"
          }`}
        >
          <LineChart className="w-5 h-5" />
          <span className="text-xs mt-1">Analytics</span>
        </button>
        <button
          onClick={() => setActiveTab("performance")}
          className={`flex flex-col items-center p-2 transition-all ${
            activeTab === "performance" ? "text-blue-400" : "text-slate-400"
          }`}
        >
          <Target className="w-5 h-5" />
          <span className="text-xs mt-1">Performance</span>
        </button>
      </div>
    </div>
  );

  // Mobile Collapsible Section - Enhanced
  const MobileSection = ({
    title,
    icon: Icon,
    children,
    sectionKey,
    defaultExpanded = false,
  }: any) => {
    const isExpanded = expandedSection === sectionKey || defaultExpanded;

    return (
      <div className="glass-card rounded-xl mb-4 overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300">
        <button
          onClick={() => setExpandedSection(isExpanded ? null : sectionKey)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Icon className="w-5 h-5 text-blue-400" />
            </div>
            <span className="font-semibold text-white">{title}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-white/5">{children}</div>
        )}
      </div>
    );
  };

  // Quick Stats Bar - Enhanced
  const QuickStats = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <div className="glass-card p-4 text-center border border-green-500/20 bg-green-500/5">
        <div className="text-green-400 font-bold text-lg">
          +₹{data?.todayPnL || 0}
        </div>
        <div className="text-slate-400 text-xs">Today P&L</div>
      </div>
      <div className="glass-card p-4 text-center border border-blue-500/20 bg-blue-500/5">
        <div className="text-blue-400 font-bold text-lg">
          {data?.totalTrades || 0}
        </div>
        <div className="text-slate-400 text-xs">Total Trades</div>
      </div>
      <div className="glass-card p-4 text-center border border-purple-500/20 bg-purple-500/5">
        <div
          className={`font-bold text-lg ${
            (data?.winRate || 0) > 50 ? "text-green-400" : "text-red-400"
          }`}
        >
          {data?.winRate || 0}%
        </div>
        <div className="text-slate-400 text-xs">Win Rate</div>
      </div>
      <div className="glass-card p-4 text-center border border-orange-500/20 bg-orange-500/5">
        <div className="text-orange-400 font-bold text-lg">
          {data?.profitFactor?.toFixed(2) || "0.00"}
        </div>
        <div className="text-slate-400 text-xs">Profit Factor</div>
      </div>
    </div>
  );

  // Mobile View - ALL METRICS VISIBLE
  const MobileDashboard = () => (
    <div className="pb-20 space-y-4">
      {/* Quick Stats */}
      <QuickStats />

      {/* Overview Tab - All Key Metrics */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* KPI Cards - Always Visible */}
          <MobileSection
            title="Performance Metrics"
            icon={BarChart3}
            sectionKey="kpi-cards"
            defaultExpanded={true}
          >
            <KPICards data={data} />
          </MobileSection>

          {/* Equity Curve - Always Visible */}
          <MobileSection
            title="Equity Curve"
            icon={LineChart}
            sectionKey="equity-curve"
            defaultExpanded={true}
          >
            <EquityCurveChart
              data={data?.equityCurve}
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
            />
          </MobileSection>

          {/* Recent Trades */}
          <MobileSection
            title="Recent Activity"
            icon={Clock}
            sectionKey="recent-trades"
          >
            <RecentTrades data={data} />
          </MobileSection>

          {/* Hourly Summary */}
          <MobileSection
            title="Hourly Performance"
            icon={Clock}
            sectionKey="hourly"
          >
            <HourlySummary data={data} />
          </MobileSection>
        </div>
      )}

      {/* Trades Tab - Focused on Trading Data */}
      {activeTab === "trades" && (
        <div className="space-y-4">
          <MobileSection
            title="All Recent Trades"
            icon={TrendingUp}
            sectionKey="all-trades"
            defaultExpanded={true}
          >
            <RecentTrades data={data} showAll />
          </MobileSection>

          <MobileSection
            title="Instrument Performance"
            icon={DollarSign}
            sectionKey="instruments"
          >
            <InstrumentPerformance data={data?.byInstrument} />
          </MobileSection>

          <MobileSection
            title="Setup Performance"
            icon={Target}
            sectionKey="setups"
          >
            <SetupPerformance data={data?.bySetup} />
          </MobileSection>
        </div>
      )}

      {/* Analytics Tab - Detailed Analysis */}
      {activeTab === "analytics" && (
        <div className="space-y-4">
          <MobileSection
            title="Detailed Analytics"
            icon={LineChart}
            sectionKey="detailed-kpi"
            defaultExpanded={true}
          >
            <KPICards data={data} detailed />
          </MobileSection>

          <MobileSection
            title="Hourly Breakdown"
            icon={Clock}
            sectionKey="hourly-detailed"
          >
            <HourlySummary data={data} />
          </MobileSection>

          <MobileSection title="Goal Tracking" icon={Target} sectionKey="goals">
            <GoalTracking data={data?.goals} />
          </MobileSection>
        </div>
      )}

      {/* Performance Tab - Advanced Metrics */}
      {activeTab === "performance" && (
        <div className="space-y-4">
          {/* Time Frame Selector */}
          <div className="glass-card p-4">
            <div className="flex justify-center">
              <div className="inline-flex rounded-lg bg-slate-800/50 p-1">
                <button
                  onClick={() => setTimeframe("7D")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    timeframe === "7D"
                      ? "bg-blue-500 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setTimeframe("1M")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    timeframe === "1M"
                      ? "bg-blue-500 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  1 Month
                </button>
                <button
                  onClick={() => setTimeframe("all")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    timeframe === "all"
                      ? "bg-blue-500 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  All Time
                </button>
              </div>
            </div>
          </div>

          <MobileSection
            title="Performance Charts"
            icon={LineChart}
            sectionKey="performance-charts"
            defaultExpanded={true}
          >
            <EquityCurveChart
              data={data?.equityCurve}
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
            />
          </MobileSection>

          <MobileSection
            title="Setup Analysis"
            icon={Target}
            sectionKey="setup-analysis"
          >
            <SetupPerformance data={data?.bySetup} />
          </MobileSection>

          <MobileSection
            title="Instrument Analysis"
            icon={DollarSign}
            sectionKey="instrument-analysis"
          >
            <InstrumentPerformance data={data?.byInstrument} />
          </MobileSection>

          <MobileSection
            title="Goals & Targets"
            icon={Target}
            sectionKey="goals-performance"
          >
            <GoalTracking data={data?.goals} />
          </MobileSection>
        </div>
      )}
    </div>
  );

  // Desktop View - Professional Layout
  const DesktopDashboard = () => (
    <div className="space-y-6">
      {/* Quick Stats Bar */}
      <QuickStats />

      {/* Main KPI Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <KPICards data={data} />
        </div>
        <div className="lg:col-span-1">
          <HourlySummary data={data} />
        </div>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <EquityCurveChart
            data={data?.equityCurve}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
          />
        </div>
        <div>
          <RecentTrades data={data} />
        </div>
      </div>

      {/* Performance Analytics Section */}
      <div className="glass-card p-6 border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">
            Performance Analytics
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setTimeframe("7D")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeframe === "7D"
                    ? "bg-blue-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                7D
              </button>
              <button
                onClick={() => setTimeframe("1M")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeframe === "1M"
                    ? "bg-blue-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                1M
              </button>
              <button
                onClick={() => setTimeframe("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeframe === "all"
                    ? "bg-blue-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All Time
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-1">
            <SetupPerformance data={data?.bySetup} />
          </div>
          <div className="lg:col-span-1">
            <InstrumentPerformance data={data?.byInstrument} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="lg:col-span-1">
            <GoalTracking data={data?.goals} />
          </div>
          <div className="lg:col-span-1">
            {/* Additional performance metrics can go here */}
            <div className="glass-card p-4 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">
                Quick Insights
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Best Day</span>
                  <span className="text-sm font-medium text-green-400">
                    +₹{data?.bestDayPnL || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Worst Day</span>
                  <span className="text-sm font-medium text-red-400">
                    -₹{data?.worstDayPnL || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Avg Daily P&L</span>
                  <span className="text-sm font-medium text-blue-400">
                    ₹{data?.avgDailyPnL || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="lg:hidden">
        <MobileDashboard />
        <MobileNav />
      </div>
      <div className="hidden lg:block">
        <DesktopDashboard />
      </div>
    </>
  );
};

export default Dashboard;
