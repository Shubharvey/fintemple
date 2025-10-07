import React, { useState, useEffect } from "react";
import { tradesAPI } from "../services/api";
import { Trade } from "../types";
import { X, Clock, TrendingUp, TrendingDown } from "lucide-react";

// Temporary formatter if the utils file doesn't exist
const formatCurrency = (amount: number, currency: string = "INR") => {
  if (currency === "INR") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const Calendar: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<"month" | "week">("month");
  const [dailyProfits, setDailyProfits] = useState<{ [key: string]: number }>(
    {}
  );
  const [isMobile, setIsMobile] = useState(false);
  const [showDateDetails, setShowDateDetails] = useState(false);

  useEffect(() => {
    fetchTrades();
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    calculateDailyProfits();
  }, [trades]);

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };

  const fetchTrades = async () => {
    try {
      const response = await tradesAPI.getAll();
      setTrades(response.data);
    } catch (error) {
      console.error("Error fetching trades:", error);
    }
  };

  // Calculate P&L locally - same as in Trades page
  const calculateLocalPnL = (trade: Trade) => {
    if (!trade.exit) return 0;

    let pnl;
    if (trade.side === "buy") {
      pnl = (trade.exit - trade.entry) * (trade.volume || trade.lot || 1);
    } else {
      pnl = (trade.entry - trade.exit) * (trade.volume || trade.lot || 1);
    }

    // Subtract fees if they exist
    const fees = trade.fees || 0;
    return pnl - fees;
  };

  const calculateDailyProfits = () => {
    const profits: { [key: string]: number } = {};

    trades.forEach((trade) => {
      if (trade.exit) {
        const date = new Date(trade.exitTimestamp || trade.timestamp)
          .toISOString()
          .split("T")[0];
        const pnl = calculateLocalPnL(trade);
        profits[date] = (profits[date] || 0) + pnl;
      }
    });

    setDailyProfits(profits);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      day
    );
    setSelectedDate(newDate);
    setShowDateDetails(true);
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(selectedDate);
    const firstDay = getFirstDayOfMonth(selectedDate);
    const days = [];

    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className={`${
            isMobile ? "aspect-square" : "h-24"
          } border border-white/5`}
        ></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedDate.getFullYear()}-${(
        selectedDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
      const dayProfit = dailyProfits[dateStr] || 0;
      const isSelected = selectedDate.getDate() === day;

      days.push(
        <div
          key={day}
          className={`${
            isMobile ? "aspect-square" : "h-24"
          } border border-white/5 p-2 hover:bg-white/5 cursor-pointer transition-colors flex flex-col ${
            isSelected ? "bg-blue-500/20 border-blue-500/50" : ""
          }`}
          onClick={() => handleDateClick(day)}
        >
          <div
            className={`flex ${
              isMobile ? "flex-col items-center" : "justify-between items-start"
            }`}
          >
            <span className="text-sm text-slate-300">{day}</span>
            {dayProfit !== 0 && (
              <span
                className={`text-xs ${isMobile ? "mt-1" : ""} ${
                  dayProfit > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {isMobile
                  ? dayProfit > 0
                    ? "↑"
                    : "↓"
                  : formatCurrency(dayProfit, "INR")}
              </span>
            )}
          </div>

          {/* Show trade indicators on mobile */}
          {isMobile && (
            <div className="mt-auto flex justify-center space-x-1">
              {trades
                .filter((trade) => {
                  if (!trade.exit) return false;
                  const tradeDate = new Date(
                    trade.exitTimestamp || trade.timestamp
                  ).toDateString();
                  const currentDate = new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    day
                  ).toDateString();
                  return tradeDate === currentDate;
                })
                .slice(0, 3)
                .map((trade, index) => (
                  <div
                    key={trade.id}
                    className={`w-1 h-1 rounded-full ${
                      calculateLocalPnL(trade) > 0
                        ? "bg-green-400"
                        : "bg-red-400"
                    }`}
                  />
                ))}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const getWeekDates = (date: Date) => {
    const startDate = new Date(date);
    startDate.setDate(date.getDate() - date.getDay());
    const weekDates = [];

    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startDate);
      weekDate.setDate(startDate.getDate() + i);
      weekDates.push(weekDate);
    }

    return weekDates;
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(selectedDate);
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return weekDates.map((date, index) => {
      const dateStr = date.toISOString().split("T")[0];
      const dayProfit = dailyProfits[dateStr] || 0;
      const isToday = new Date().toDateString() === date.toDateString();
      const isSelected = selectedDate.toDateString() === date.toDateString();

      return (
        <div
          key={index}
          className={`${
            isMobile ? "aspect-square" : "h-32"
          } border border-white/5 p-2 md:p-3 cursor-pointer transition-all ${
            isSelected
              ? "bg-blue-500/20 border-blue-500/50"
              : "hover:bg-white/5"
          } ${isToday ? "ring-2 ring-blue-400" : ""} flex flex-col`}
          onClick={() => {
            setSelectedDate(date);
            setShowDateDetails(true);
          }}
        >
          <div
            className={`flex ${
              isMobile ? "flex-col items-center" : "justify-between items-start"
            } mb-2`}
          >
            <div className={isMobile ? "text-center" : ""}>
              <div className="text-xs md:text-sm text-slate-400">
                {weekDays[index]}
              </div>
              <div
                className={`font-semibold text-white ${
                  isMobile ? "text-lg" : "text-lg"
                }`}
              >
                {date.getDate()}
              </div>
            </div>
            {dayProfit !== 0 && (
              <span
                className={`text-xs md:text-sm font-medium ${
                  dayProfit > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {isMobile
                  ? dayProfit > 0
                    ? "↑"
                    : "↓"
                  : formatCurrency(dayProfit, "INR")}
              </span>
            )}
          </div>

          {/* Show trades for this day */}
          {!isMobile && (
            <div className="text-xs text-slate-500 space-y-1">
              {trades
                .filter((trade) => {
                  if (!trade.exit) return false;
                  const tradeDate = new Date(
                    trade.exitTimestamp || trade.timestamp
                  ).toDateString();
                  return tradeDate === date.toDateString();
                })
                .slice(0, 3)
                .map((trade) => {
                  const tradePnL = calculateLocalPnL(trade);
                  return (
                    <div key={trade.id} className="flex justify-between">
                      <span>{trade.symbol}</span>
                      <span
                        className={
                          tradePnL > 0 ? "text-green-400" : "text-red-400"
                        }
                      >
                        {formatCurrency(tradePnL, "INR")}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Mobile trade indicators */}
          {isMobile && (
            <div className="mt-auto flex justify-center space-x-1">
              {trades
                .filter((trade) => {
                  if (!trade.exit) return false;
                  const tradeDate = new Date(
                    trade.exitTimestamp || trade.timestamp
                  ).toDateString();
                  return tradeDate === date.toDateString();
                })
                .slice(0, 3)
                .map((trade, index) => (
                  <div
                    key={trade.id}
                    className={`w-1 h-1 rounded-full ${
                      calculateLocalPnL(trade) > 0
                        ? "bg-green-400"
                        : "bg-red-400"
                    }`}
                  />
                ))}
            </div>
          )}
        </div>
      );
    });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + (direction === "next" ? 1 : -1));
    setSelectedDate(newDate);
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === "next" ? 7 : -7));
    setSelectedDate(newDate);
  };

  const selectedDayTrades = trades.filter((trade) => {
    if (!trade.exit) return false;
    const tradeDate = new Date(
      trade.exitTimestamp || trade.timestamp
    ).toDateString();
    return tradeDate === selectedDate.toDateString();
  });

  const selectedDayProfit = selectedDayTrades.reduce((total, trade) => {
    return total + calculateLocalPnL(trade);
  }, 0);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-xl md:text-2xl font-bold text-white">Calendar</h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setView("month")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                view === "month"
                  ? "bg-blue-500 text-white"
                  : "hover:bg-white/10"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                view === "week" ? "bg-blue-500 text-white" : "hover:bg-white/10"
              }`}
            >
              Week
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
                view === "month" ? navigateMonth("prev") : navigateWeek("prev")
              }
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              ←
            </button>

            <h2 className="text-sm md:text-lg font-semibold text-white min-w-32 md:min-w-48 text-center">
              {view === "month"
                ? selectedDate.toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })
                : `Week of ${selectedDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}`}
            </h2>

            <button
              onClick={() =>
                view === "month" ? navigateMonth("next") : navigateWeek("next")
              }
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Selected Date Header */}
      {showDateDetails && (
        <div className="glass-card p-4 md:p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-white">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h2>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-slate-400">Total P&L:</span>
                <span
                  className={`text-lg font-bold ${
                    selectedDayProfit > 0
                      ? "text-green-400"
                      : selectedDayProfit < 0
                      ? "text-red-400"
                      : "text-slate-300"
                  }`}
                >
                  {formatCurrency(selectedDayProfit, "INR")}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowDateDetails(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {selectedDayTrades.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-white font-medium">
                All Trades ({selectedDayTrades.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {selectedDayTrades.map((trade) => {
                  const tradePnL = calculateLocalPnL(trade);
                  return (
                    <div
                      key={trade.id}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-white/5 rounded-lg space-y-2 sm:space-y-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-300 text-sm">
                            {formatTime(trade.timestamp)}
                          </span>
                        </div>
                        <span className="font-medium text-white">
                          {trade.symbol}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            trade.side === "buy"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {trade.side.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end space-x-4">
                        <div className="text-right">
                          <div
                            className={`font-medium ${
                              tradePnL > 0 ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {formatCurrency(tradePnL, "INR")}
                          </div>
                          <div className="text-xs text-slate-400">
                            {trade.strategy || "No strategy"}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {tradePnL > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8">
              No trades found for this date
            </div>
          )}
        </div>
      )}

      {/* Calendar Grid */}
      <div className="glass-card p-4 md:p-6">
        {view === "month" ? (
          <>
            {/* Month header */}
            <div className={`grid grid-cols-7 gap-1 mb-4`}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-slate-400 font-medium py-2 text-xs md:text-sm"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Month grid */}
            <div className={`grid grid-cols-7 gap-1`}>{renderMonthView()}</div>
          </>
        ) : (
          <>
            {/* Week header */}
            <div className={`grid grid-cols-7 gap-1 md:gap-4 mb-4`}>
              {[
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ].map((day) => (
                <div
                  key={day}
                  className="text-center text-slate-400 font-medium py-2 text-xs md:text-sm"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Week grid */}
            <div className={`grid grid-cols-7 gap-1 md:gap-4`}>
              {renderWeekView()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Calendar;
