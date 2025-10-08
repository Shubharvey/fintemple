import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import BottomNavigation from "./BottomNavigation";
import TradingCoach from "../TradingCoach/TradingCoach";
import { useAuth } from "../../hooks/useAuth";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showTradingCoach, setShowTradingCoach] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowMobileSidebar(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setShowMobileSidebar(!showMobileSidebar);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const handleOpenTradingCoach = () => {
    setShowTradingCoach(true);
  };

  const handleCloseTradingCoach = () => {
    setShowTradingCoach(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      {/* Mobile Sidebar Overlay */}
      {isMobile && showMobileSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile, shown as overlay */}
      <div
        className={`${
          isMobile
            ? `fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 ${
                showMobileSidebar ? "translate-x-0" : "-translate-x-full"
              }`
            : "relative h-full overflow-y-auto"
        }`}
      >
        <Sidebar
          collapsed={isMobile ? false : sidebarCollapsed}
          onToggle={toggleSidebar}
          isMobile={isMobile}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <TopBar
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
          isMobile={isMobile}
          onOpenTradingCoach={handleOpenTradingCoach}
        />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-6 p-4 md:p-6">
          {children}
        </main>

        {/* Bottom Navigation - Mobile Only */}
        {isMobile && <BottomNavigation user={user} />}
      </div>

      {/* Trading Coach */}
      {showTradingCoach && isMobile && (
        <TradingCoach isMobile={true} onClose={handleCloseTradingCoach} />
      )}

      {!isMobile && <TradingCoach />}
    </div>
  );
};

export default Layout;
