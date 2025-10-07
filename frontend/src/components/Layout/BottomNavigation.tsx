import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  TrendingUp,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

interface BottomNavigationProps {
  user: any;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ user }) => {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
    { icon: TrendingUp, label: "Trades", href: "/trades" },
    { icon: Calendar, label: "Calendar", href: "/calendar" },
    { icon: BarChart3, label: "Reports", href: "/reports" },
    { icon: PlusCircle, label: "New Trade", href: "/new-trade" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 z-50 md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.label}
              to={item.href}
              className={`flex flex-col items-center justify-center py-2 px-3 transition-all duration-200 ${
                isActive ? "text-blue-400" : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon
                className={`w-5 h-5 mb-1 transition-all duration-200 ${
                  isActive ? "scale-110" : "scale-100"
                }`}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
