import React, { useState, useEffect } from "react";
import { tradesAPI } from "../services/api";
import { Trade } from "../types";

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

  useEffect(() => {
    fetchTrades();
  }, []);

  useEffect(() => {
    calculateDailyProfits();
  }, [trades]);

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

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(selectedDate);
    const firstDay = getFirstDayOfMonth(selectedDate);
    const days = [];

    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-24 border border-white/5"></div>
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

      days.push(
        <div
          key={day}
          className="h-24 border border-white/5 p-2 hover:bg-white/5 cursor-pointer transition-colors"
          onClick={() =>
            setSelectedDate(
              new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)
            )
          }
        >
          <div className="flex justify-between items-start">
            <span className="text-sm text-slate-300">{day}</span>
            {dayProfit !== 0 && (
              <span
                className={`text-xs ${
                  dayProfit > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {formatCurrency(dayProfit, "INR")}
              </span>
            )}
          </div>
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
          className={`h-32 border border-white/5 p-3 cursor-pointer transition-all ${
            isSelected
              ? "bg-blue-500/20 border-blue-500/50"
              : "hover:bg-white/5"
          } ${isToday ? "ring-2 ring-blue-400" : ""}`}
          onClick={() => setSelectedDate(date)}
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-sm text-slate-400">{weekDays[index]}</div>
              <div className="text-lg font-semibold text-white">
                {date.getDate()}
              </div>
            </div>
            {dayProfit !== 0 && (
              <span
                className={`text-sm font-medium ${
                  dayProfit > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {formatCurrency(dayProfit, "INR")}
              </span>
            )}
          </div>

          {/* Show trades for this day */}
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Calendar</h1>
        <div className="flex space-x-4">
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

            <h2 className="text-lg font-semibold text-white min-w-48 text-center">
              {view === "month"
                ? selectedDate.toLocaleDateString("en-US", {
                    month: "long",
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

      {/* Calendar Grid */}
      <div className="glass-card p-6">
        {view === "month" ? (
          <>
            {/* Month header */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-slate-400 font-medium py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Month grid */}
            <div className="grid grid-cols-7 gap-1">{renderMonthView()}</div>
          </>
        ) : (
          <>
            {/* Week header */}
            <div className="grid grid-cols-7 gap-4 mb-4">
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
                  className="text-center text-slate-400 font-medium py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Week grid */}
            <div className="grid grid-cols-7 gap-4">{renderWeekView()}</div>
          </>
        )}
      </div>

      {/* Selected Day Details */}
      {selectedDayTrades.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Trades for{" "}
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h3>
          <div className="flex justify-between items-center mb-4">
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

          <div className="space-y-2">
            {selectedDayTrades.map((trade) => {
              const tradePnL = calculateLocalPnL(trade);
              return (
                <div
                  key={trade.id}
                  className="flex justify-between items-center p-3 bg-white/5 rounded-lg"
                >
                  <div>
                    <span className="font-medium text-white">
                      {trade.symbol}
                    </span>
                    <span
                      className={`ml-3 px-2 py-1 rounded text-xs ${
                        trade.side === "buy"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {trade.side.toUpperCase()}
                    </span>
                  </div>
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
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
