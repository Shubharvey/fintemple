import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Settings, Sun, Moon, Palette } from "lucide-react";

interface TopBarProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

type Theme = "dark" | "light";

const TopBar: React.FC<TopBarProps> = ({
  sidebarCollapsed,
  onToggleSidebar,
}) => {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState("");
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>("dark");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-IN", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Asia/Kolkata",
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (currentTheme === "light") {
      document.documentElement.classList.add("light-theme");
    } else {
      document.documentElement.classList.remove("light-theme");
    }
  }, [currentTheme]);

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Dashboard";
      case "/trades":
        return "Trades";
      case "/reports":
        return "Reports";
      case "/import":
        return "Import Trades";
      default:
        return "Dashboard";
    }
  };

  const themes = [
    {
      id: "dark" as Theme,
      name: "Midnight Gloss",
      icon: Moon,
      description: "Dark glossy theme",
    },
    {
      id: "light" as Theme,
      name: "Daylight Clear",
      icon: Sun,
      description: "Light clean theme",
    },
  ];

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    setShowThemeMenu(false);
  };

  return (
    <div className="glass-nav h-16 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-white">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Live Indian Time */}
        <div className="flex items-center space-x-2 bg-white/5 rounded-lg px-3 py-2">
          <Palette className="w-4 h-4 text-slate-300" />
          <span className="text-sm font-medium text-slate-300">
            {currentTime}
          </span>
        </div>

        {/* Theme Settings Button with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Settings className="w-5 h-5 text-slate-300" />
          </button>

          {showThemeMenu && (
            <div className="absolute right-0 top-12 mt-2 w-64 bg-slate-800 border border-white/10 rounded-lg shadow-lg z-50 backdrop-blur-md">
              <div className="p-4 border-b border-white/10 bg-slate-800/95 rounded-t-lg">
                <h3 className="text-white font-semibold">Theme Settings</h3>
                <p className="text-slate-400 text-sm">
                  Choose your preferred theme
                </p>
              </div>

              <div className="p-2 bg-slate-800/95 rounded-b-lg">
                {themes.map((theme) => {
                  const ThemeIcon = theme.icon;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeChange(theme.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
                        currentTheme === theme.id
                          ? "bg-blue-500/20 border border-blue-500/30"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          currentTheme === theme.id
                            ? "bg-blue-500 text-white"
                            : "bg-white/10 text-slate-300"
                        }`}
                      >
                        <ThemeIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <div
                          className={`font-medium ${
                            currentTheme === theme.id
                              ? "text-blue-400"
                              : "text-white"
                          }`}
                        >
                          {theme.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {theme.description}
                        </div>
                      </div>
                      {currentTheme === theme.id && (
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay to close theme menu when clicking outside */}
      {showThemeMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowThemeMenu(false)}
        />
      )}
    </div>
  );
};

export default TopBar;
