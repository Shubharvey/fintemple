import React, { useState, useRef, useEffect } from "react";
import { tradesAPI } from "../../services/api";
import { Trade } from "../../types";
import { ChevronDown, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface TradeFormProps {
  onTradeAdded: () => void;
  onCancel: () => void;
}

// Custom dropdown component
const CustomDropdown: React.FC<{
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  required?: boolean;
}> = ({ label, value, options, onChange, required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add click outside listener
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to handle clicks outside the dropdown
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-slate-400 mb-1">
        {label} {required && "*"}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full glass border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <span>
            {options.find((opt) => opt.value === value)?.label ||
              "Select Option"}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Custom Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-white/10 rounded-lg shadow-lg z-50 backdrop-blur-md">
            <div className="p-2 max-h-60 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    value === option.value
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Custom date/time picker component with custom calendar
const CustomDateTimePicker: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}> = ({ label, value, onChange, required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(value || new Date()));
  const [selectedDate, setSelectedDate] = useState(
    new Date(value || new Date())
  );
  const [selectedHour, setSelectedHour] = useState(
    new Date(value || new Date()).getHours()
  );
  const [selectedMinute, setSelectedMinute] = useState(
    new Date(value || new Date()).getMinutes()
  );
  const [showTimePicker, setShowTimePicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add click outside listener
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to handle clicks outside the picker
  const handleClickOutside = (event: MouseEvent) => {
    if (
      pickerRef.current &&
      !pickerRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  // Format the datetime for display
  const formatDateTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Navigate to previous month
  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  // Handle date selection
  const selectDate = (day: number) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
      selectedHour,
      selectedMinute
    );
    setSelectedDate(newDate);
  };

  // Handle time selection
  const updateTime = () => {
    const newDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedHour,
      selectedMinute
    );
    setSelectedDate(newDate);
    setShowTimePicker(false);
  };

  // Apply the selected date/time
  const applyDateTime = () => {
    const isoString = selectedDate.toISOString();
    onChange(isoString);
    setIsOpen(false);
  };

  // Use current date/time
  const useCurrentDateTime = () => {
    const now = new Date();
    setSelectedDate(now);
    setSelectedHour(now.getHours());
    setSelectedMinute(now.getMinutes());
    setCurrentDate(now);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        day === selectedDate.getDate() &&
        currentDate.getMonth() === selectedDate.getMonth() &&
        currentDate.getFullYear() === selectedDate.getFullYear();

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => selectDate(day)}
          className={`h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${
            isSelected
              ? "bg-blue-500 text-white"
              : "text-slate-300 hover:bg-white/10"
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  // Generate hour options
  const generateHourOptions = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(
        <option key={i} value={i}>
          {i.toString().padStart(2, "0")}
        </option>
      );
    }
    return hours;
  };

  // Generate minute options
  const generateMinuteOptions = () => {
    const minutes = [];
    for (let i = 0; i < 60; i++) {
      minutes.push(
        <option key={i} value={i}>
          {i.toString().padStart(2, "0")}
        </option>
      );
    }
    return minutes;
  };

  return (
    <div className="relative" ref={pickerRef}>
      <label className="block text-sm font-medium text-slate-400 mb-1">
        {label} {required && "*"}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full glass border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <span className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-slate-400" />
            {formatDateTime(selectedDate)}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Custom Date/Time Picker */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-white/10 rounded-lg shadow-lg z-50 backdrop-blur-md p-4">
            {!showTimePicker ? (
              // Calendar View
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={previousMonth}
                    className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-400" />
                  </button>
                  <h3 className="text-white font-medium">
                    {currentDate.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-xs text-slate-400 text-center">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                    <div
                      key={index}
                      className="h-6 flex items-center justify-center"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {generateCalendarDays()}
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setShowTimePicker(true)}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                  >
                    Set Time
                  </button>
                  <button
                    type="button"
                    onClick={useCurrentDateTime}
                    className="px-3 py-1 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-600 transition-colors"
                  >
                    Now
                  </button>
                </div>
              </div>
            ) : (
              // Time Picker View
              <div className="space-y-3">
                <h3 className="text-white font-medium text-center">Set Time</h3>
                <div className="flex justify-center items-center space-x-2">
                  <select
                    value={selectedHour}
                    onChange={(e) => setSelectedHour(parseInt(e.target.value))}
                    className="bg-slate-700 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {generateHourOptions()}
                  </select>
                  <span className="text-white">:</span>
                  <select
                    value={selectedMinute}
                    onChange={(e) =>
                      setSelectedMinute(parseInt(e.target.value))
                    }
                    className="bg-slate-700 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {generateMinuteOptions()}
                  </select>
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setShowTimePicker(false)}
                    className="px-3 py-1 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-600 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={updateTime}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                  >
                    Set Time
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={applyDateTime}
                className="px-4 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TradeForm: React.FC<TradeFormProps> = ({ onTradeAdded, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Trade>>({
    symbol: "",
    instrumentType: "forex",
    side: "buy",
    entry: undefined,
    exit: undefined,
    lot: 1,
    fees: 0,
    strategy: "",
    tags: [],
    tradeType: "intraday",
    timestamp: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (
        !formData.symbol ||
        formData.entry === undefined ||
        formData.lot === undefined ||
        !formData.timestamp
      ) {
        throw new Error("Symbol, Entry Price, Lot Size, and Date are required");
      }

      if (formData.entry <= 0) {
        throw new Error("Entry price must be greater than 0");
      }

      if (formData.lot <= 0) {
        throw new Error("Lot size must be greater than 0");
      }

      const tradeData = {
        ...formData,
        timestamp: formData.timestamp,
        exitTimestamp: formData.exit ? new Date().toISOString() : undefined,
        volume: formData.lot,
      };

      console.log("Sending trade data:", tradeData);
      console.log("Calculated P&L:", calculatePnL());

      const response = await tradesAPI.create(tradeData);

      console.log("Trade created successfully:", response.data);

      onTradeAdded();

      setFormData({
        symbol: "",
        instrumentType: "forex",
        side: "buy",
        entry: undefined,
        exit: undefined,
        lot: 1,
        fees: 0,
        strategy: "",
        tags: [],
        tradeType: "intraday",
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create trade";
      setError(errorMessage);
      console.error("Error creating trade:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : parseFloat(value),
      }));
    } else if (name === "tags") {
      setFormData((prev) => ({
        ...prev,
        [name]: value.split(",").map((tag) => tag.trim()),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle custom dropdown changes
  const handleDropdownChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle custom date/time picker changes
  const handleDateTimeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, timestamp: value }));
  };

  const calculatePnL = () => {
    if (!formData.entry || !formData.lot) return 0;

    const exitPrice = formData.exit || formData.entry;
    let pnl;

    if (formData.side === "buy") {
      pnl = (exitPrice - formData.entry) * formData.lot;
    } else {
      pnl = (formData.entry - exitPrice) * formData.lot;
    }

    return pnl - (formData.fees || 0);
  };

  const potentialPnL = calculatePnL();

  const getPnLColor = () => {
    if (potentialPnL > 0) return "text-green-400";
    if (potentialPnL < 0) return "text-red-400";
    return "text-slate-300";
  };

  // Define options for dropdowns
  const instrumentTypeOptions = [
    { value: "forex", label: "Forex" },
    { value: "commodity", label: "Commodity" },
    { value: "stock", label: "Stock" },
    { value: "stock-options", label: "Stock Options" },
    { value: "futures", label: "Futures" },
    { value: "index-option", label: "Index Option" },
    { value: "index-future", label: "Index Future" },
    { value: "crypto", label: "Crypto" },
  ];

  const tradeTypeOptions = [
    { value: "intraday", label: "Intraday" },
    { value: "scalp", label: "Scalp" },
    { value: "swing", label: "Swing" },
    { value: "short-term", label: "Short Term" },
    { value: "long-term", label: "Long Term" },
    { value: "delivery", label: "Delivery" },
  ];

  const sideOptions = [
    { value: "buy", label: "Buy" },
    { value: "sell", label: "Sell" },
  ];

  return (
    <div className="glass-card p-4 md:p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-4 md:mb-6">New Trade</h2>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
          {/* Symbol */}
          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Symbol *
            </label>
            <input
              type="text"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="e.g., EURUSD, AAPL, BTCUSD"
            />
          </div>

          {/* Instrument Type */}
          <CustomDropdown
            label="Instrument Type"
            value={formData.instrumentType || "forex"}
            options={instrumentTypeOptions}
            onChange={(value) => handleDropdownChange("instrumentType", value)}
            required={true}
          />

          {/* Trade Type */}
          <CustomDropdown
            label="Trade Type"
            value={formData.tradeType || "intraday"}
            options={tradeTypeOptions}
            onChange={(value) => handleDropdownChange("tradeType", value)}
            required={true}
          />

          {/* Side */}
          <CustomDropdown
            label="Side"
            value={formData.side || "buy"}
            options={sideOptions}
            onChange={(value) => handleDropdownChange("side", value)}
            required={true}
          />

          {/* Date & Time - Custom Component with Custom Calendar */}
          <CustomDateTimePicker
            label="Date & Time"
            value={formData.timestamp || new Date().toISOString()}
            onChange={handleDateTimeChange}
            required={true}
          />

          {/* Lot Size */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Lot Size *
            </label>
            <input
              type="number"
              step="1"
              min="1"
              name="lot"
              value={formData.lot || ""}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="e.g., 100, 1000"
            />
          </div>

          {/* Entry Price */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Entry Price *
            </label>
            <input
              type="number"
              step="0.0001"
              min="0.0001"
              name="entry"
              value={formData.entry || ""}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="Enter entry price"
            />
          </div>

          {/* Exit Price */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Exit Price
            </label>
            <input
              type="number"
              step="0.0001"
              min="0"
              name="exit"
              value={formData.exit || ""}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="Leave empty for open trade"
            />
          </div>

          {/* Stop Loss */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Stop Loss
            </label>
            <input
              type="number"
              step="0.0001"
              min="0"
              name="sl"
              value={formData.sl || ""}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Take Profit */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Take Profit
            </label>
            <input
              type="number"
              step="0.0001"
              min="0"
              name="tp"
              value={formData.tp || ""}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Fees */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Fees (₹)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="fees"
              value={formData.fees || ""}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Strategy */}
          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Strategy
            </label>
            <input
              type="text"
              name="strategy"
              value={formData.strategy}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="e.g., Breakout, Scalping, Swing"
            />
          </div>
        </div>

        {/* P&L Preview */}
        {formData.entry && formData.lot && (
          <div className="bg-slate-800 border border-white/10 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              P&L Preview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Entry Value:</span>
                <div className="text-white font-medium">
                  ₹{(formData.entry * formData.lot).toLocaleString("en-IN")}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Exit Value:</span>
                <div className="text-white font-medium">
                  ₹
                  {(
                    (formData.exit || formData.entry) * formData.lot
                  ).toLocaleString("en-IN")}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Trade Direction:</span>
                <div className="text-white font-medium capitalize">
                  {formData.side}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Trade Type:</span>
                <div className="text-white font-medium capitalize">
                  {formData.tradeType?.replace("-", " ")}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Fees:</span>
                <div className="text-white font-medium">
                  ₹{(formData.fees || 0).toLocaleString("en-IN")}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Potential P&L:</span>
                <div className={`font-medium text-lg ${getPnLColor()}`}>
                  ₹
                  {potentialPnL.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Calculation: (
              {formData.side === "buy" ? "Exit - Entry" : "Entry - Exit"}) × Lot
              Size - Fees
              {formData.side === "buy"
                ? " (Buy: Profit when Exit > Entry)"
                : " (Sell: Profit when Exit < Entry)"}
            </div>
          </div>
        )}

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">
            Tags
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags?.join(", ") || ""}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            placeholder="Comma separated, e.g., breakout, winning, news"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes || ""}
            onChange={handleChange}
            rows={3}
            className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            placeholder="Any additional notes about the trade..."
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-slate-800 border border-white/10 text-white py-3 rounded-lg hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50"
          >
            {loading ? "Creating Trade..." : "Create Trade"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TradeForm;
