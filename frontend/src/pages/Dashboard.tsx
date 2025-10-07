import React, { useState } from "react";
import CalendarStrip from "../components/Dashboard/CalendarStrip";
import KPICards from "../components/Dashboard/KPICards";
import RecentTrades from "../components/Dashboard/RecentTrades";
import HourlySummary from "../components/Dashboard/HourlySummary";
import { useDashboardData } from "../hooks/useDashboardData";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const Dashboard: React.FC = () => {
  const { data, loading, error } = useDashboardData();
  const [activeTab, setActiveTab] = useState<
    "overview" | "trades" | "analytics"
  >("overview");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
          <Calendar className="w-5 h-5" />
          <span className="text-xs mt-1">Analytics</span>
        </button>
      </div>
    </div>
  );

  // Mobile Collapsible Section
  const MobileSection = ({ title, icon: Icon, children, sectionKey }: any) => (
    <div className="glass-card rounded-xl mb-4 overflow-hidden">
      <button
        onClick={() =>
          setExpandedSection(expandedSection === sectionKey ? null : sectionKey)
        }
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center space-x-3">
          <Icon className="w-5 h-5 text-blue-400" />
          <span className="font-semibold text-white">{title}</span>
        </div>
        {expandedSection === sectionKey ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {expandedSection === sectionKey && (
        <div className="px-4 pb-4">{children}</div>
      )}
    </div>
  );

  // Mobile View
  const MobileDashboard = () => (
    <div className="pb-20">
      {" "}
      {/* Padding for bottom nav */}
      {/* Quick Stats Bar */}
      <div className="flex justify-between items-center p-4 mb-4 bg-slate-800/50 rounded-lg">
        <div className="text-center">
          <div className="text-green-400 font-bold text-sm">
            +₹{data?.todayPnL || 0}
          </div>
          <div className="text-slate-400 text-xs">Today</div>
        </div>
        <div className="text-center">
          <div className="text-white font-bold text-sm">
            {data?.totalTrades || 0}
          </div>
          <div className="text-slate-400 text-xs">Trades</div>
        </div>
        <div className="text-center">
          <div
            className={`font-bold text-sm ${
              (data?.winRate || 0) > 50 ? "text-green-400" : "text-red-400"
            }`}
          >
            {data?.winRate || 0}%
          </div>
          <div className="text-slate-400 text-xs">Win Rate</div>
        </div>
      </div>
      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <MobileSection title="Calendar" icon={Calendar} sectionKey="calendar">
            <CalendarStrip data={data} />
          </MobileSection>

          <MobileSection
            title="Recent Activity"
            icon={Clock}
            sectionKey="recent"
          >
            <RecentTrades data={data} compact />
          </MobileSection>

          <MobileSection
            title="Performance"
            icon={BarChart3}
            sectionKey="performance"
          >
            <KPICards data={data} compact />
          </MobileSection>
        </div>
      )}
      {activeTab === "trades" && (
        <div>
          <RecentTrades data={data} showAll />
        </div>
      )}
      {activeTab === "analytics" && (
        <div className="space-y-4">
          <MobileSection
            title="Hourly Summary"
            icon={Clock}
            sectionKey="hourly"
          >
            <HourlySummary data={data} compact />
          </MobileSection>
          <KPICards data={data} detailed />
        </div>
      )}
    </div>
  );

  // Desktop View
  const DesktopDashboard = () => (
    <div className="space-y-6">
      <CalendarStrip data={data} />
      <RecentTrades data={data} />
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
