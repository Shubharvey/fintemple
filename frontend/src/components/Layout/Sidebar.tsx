import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  LayoutDashboard,
  Calendar,
  BarChart3,
  TrendingUp,
  BookOpen,
  PlusCircle,
  Users,
  Download,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const navItems = [
    { icon: Search, label: "Search", href: "/search" },
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Calendar, label: "Calendar", href: "/calendar" },
    { icon: BarChart3, label: "Reports", href: "/reports" },
    { icon: TrendingUp, label: "Trades", href: "/trades" },
    { icon: BookOpen, label: "Journal", href: "/journal" },
    { icon: PlusCircle, label: "New trade", href: "/new-trade" },
  ];

  const communityItems = [
    { icon: Download, label: "Import trades", href: "/import" },
    { icon: Users, label: "Community", href: "/community" },
  ];

  return (
    <div
      className={`glass-sidebar h-full flex flex-col bg-slate-900/80 backdrop-blur-xl border-r border-white/10 transition-all duration-500 ease-in-out ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo and Toggle Button */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        {!collapsed && (
          <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent transition-opacity duration-500 ease-in-out">
            FinTemple
          </h1>
        )}
        <button
          onClick={onToggle}
          className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 ease-out hover:scale-110"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-300 transition-transform duration-300" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-slate-300 transition-transform duration-300" />
          )}
        </button>
      </div>

      {/* User Info - FIXED */}
      {!collapsed && user && (
        <div className="p-4 border-b border-white/10 transition-all duration-500 ease-in-out">
          <div className="flex items-center space-x-3 animate-in slide-in-from-left-8 duration-500">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-white text-sm font-semibold">
                {user.name?.charAt(0).toUpperCase() ||
                  user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0 space-y-1 overflow-hidden">
              <p className="text-white text-sm font-medium truncate transition-all duration-300">
                {user.name || user.email}
              </p>
              <p className="text-slate-400 text-xs truncate transition-all duration-300">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-8 transition-all duration-500 ease-in-overflow-auto">
        <div className="space-y-2">
          {!collapsed && (
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 pl-3 transition-all duration-500 ease-in-out animate-in slide-in-from-left-6">
              Tracker
            </h3>
          )}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 ease-out group relative overflow-hidden ${
                    collapsed ? "justify-center" : ""
                  } ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/20 transform scale-[1.02]"
                      : "text-slate-300 hover:text-white hover:bg-white/10 hover:scale-[1.02] hover:shadow-lg"
                  }`}
                  title={collapsed ? item.label : ""}
                >
                  {/* Active state indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-purple-400 rounded-r-full"></div>
                  )}

                  <Icon
                    className={`transition-all duration-300 ${
                      collapsed ? "w-5 h-5" : "w-4 h-4 mr-3"
                    } ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                  />

                  {!collapsed && (
                    <span className="transition-all duration-300 ease-out whitespace-nowrap">
                      {item.label}
                    </span>
                  )}

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2">
          {!collapsed && (
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 pl-3 transition-all duration-500 ease-in-out animate-in slide-in-from-left-6">
              Community
            </h3>
          )}
          <nav className="space-y-1">
            {communityItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 ease-out group relative overflow-hidden ${
                    collapsed ? "justify-center" : ""
                  } ${
                    isActive
                      ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30 shadow-lg shadow-green-500/20 transform scale-[1.02]"
                      : "text-slate-300 hover:text-white hover:bg-white/10 hover:scale-[1.02] hover:shadow-lg"
                  }`}
                  title={collapsed ? item.label : ""}
                >
                  {/* Active state indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 to-emerald-400 rounded-r-full"></div>
                  )}

                  <Icon
                    className={`transition-all duration-300 ${
                      collapsed ? "w-5 h-5" : "w-4 h-4 mr-3"
                    } ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                  />

                  {!collapsed && (
                    <span className="transition-all duration-300 ease-out whitespace-nowrap">
                      {item.label}
                    </span>
                  )}

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-white/10 transition-all duration-500 ease-in-out">
        <button
          onClick={logout}
          className={`flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 ease-out w-full group relative overflow-hidden ${
            collapsed ? "justify-center" : ""
          } text-red-400 hover:text-white hover:bg-red-500/20 hover:scale-[1.02] hover:shadow-lg border border-transparent hover:border-red-500/30`}
          title={collapsed ? "Logout" : ""}
        >
          <LogOut
            className={`transition-all duration-300 ${
              collapsed ? "w-5 h-5" : "w-4 h-4 mr-3"
            } group-hover:scale-110`}
          />

          {!collapsed && (
            <span className="transition-all duration-300 ease-out">Logout</span>
          )}

          {/* Hover effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
