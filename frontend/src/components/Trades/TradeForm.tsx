import React, { useState } from "react";
import { tradesAPI } from "../../services/api";
import { Trade } from "../../types";
import { ChevronDown } from "lucide-react";

interface TradeFormProps {
  onTradeAdded: () => void;
  onCancel: () => void;
}

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
    } else if (type === "datetime-local") {
      // Fix timezone issue - use the local time directly without conversion
      setFormData((prev) => ({
        ...prev,
        [name]: value || new Date().toISOString().slice(0, 16),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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

  // Get current local datetime in correct format for datetime-local input
  const getCurrentDateTimeLocal = () => {
    const now = new Date();
    // Adjust for timezone offset to get local time
    const timezoneOffset = now.getTimezoneOffset() * 60000;
    const localTime = new Date(now.getTime() - timezoneOffset);
    return localTime.toISOString().slice(0, 16);
  };

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
          <div className="relative">
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Instrument Type *
            </label>
            <select
              name="instrumentType"
              value={formData.instrumentType}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none cursor-pointer pr-10"
            >
              <option value="forex">Forex</option>
              <option value="commodity">Commodity</option>
              <option value="stock">Stock</option>
              <option value="stock-options">Stock Options</option>
              <option value="futures">Futures</option>
              <option value="index-option">Index Option</option>
              <option value="index-future">Index Future</option>
              <option value="crypto">Crypto</option>
            </select>
            <ChevronDown className="absolute right-3 top-9 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Trade Type */}
          <div className="relative">
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Trade Type *
            </label>
            <select
              name="tradeType"
              value={formData.tradeType}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none cursor-pointer pr-10"
            >
              <option value="intraday">Intraday</option>
              <option value="scalp">Scalp</option>
              <option value="swing">Swing</option>
              <option value="short-term">Short Term</option>
              <option value="long-term">Long Term</option>
              <option value="delivery">Delivery</option>
            </select>
            <ChevronDown className="absolute right-3 top-9 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Side */}
          <div className="relative">
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Side *
            </label>
            <select
              name="side"
              value={formData.side}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none cursor-pointer pr-10"
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
            <ChevronDown className="absolute right-3 top-9 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Date & Time - FIXED */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              name="timestamp"
              value={formData.timestamp || getCurrentDateTimeLocal()}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

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

      {/* Custom CSS for dropdown styling */}
      <style>{`
        select {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        select option {
          background-color: #1e293b;
          color: white;
          padding: 8px;
        }
        
        select option:hover,
        select option:focus,
        select option:checked {
          background-color: #3b82f6 !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default TradeForm;
