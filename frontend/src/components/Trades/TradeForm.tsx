import React, { useState } from "react";
import { tradesAPI } from "../../services/api";
import { Trade } from "../../types";

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
    tradeType: "intraday", // New field
    timestamp: new Date().toISOString(), // Default to current time
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
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
        // Use the selected timestamp instead of always current time
        timestamp: formData.timestamp,
        // For demo, set exit timestamp if exit price is provided
        exitTimestamp: formData.exit ? new Date().toISOString() : undefined,
        // Set volume as lot size for calculation
        volume: formData.lot,
      };

      console.log("Sending trade data:", tradeData); // Debug log
      console.log("Calculated P&L:", calculatePnL()); // Debug P&L

      const response = await tradesAPI.create(tradeData);

      console.log("Trade created successfully:", response.data); // Debug log

      onTradeAdded();

      // Reset form
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
      // Convert datetime-local to ISO string
      setFormData((prev) => ({
        ...prev,
        [name]: value
          ? new Date(value).toISOString()
          : new Date().toISOString(),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Calculate potential P&L - FIXED VERSION
  const calculatePnL = () => {
    if (!formData.entry || !formData.lot) return 0;

    const exitPrice = formData.exit || formData.entry;
    let pnl;

    // Account for trade direction
    if (formData.side === "buy") {
      // For BUY trades: Profit when exit > entry
      pnl = (exitPrice - formData.entry) * formData.lot;
    } else {
      // For SELL trades: Profit when exit < entry
      pnl = (formData.entry - exitPrice) * formData.lot;
    }

    // Subtract fees
    return pnl - (formData.fees || 0);
  };

  const potentialPnL = calculatePnL();

  // Get P&L color based on value
  const getPnLColor = () => {
    if (potentialPnL > 0) return "text-green-400";
    if (potentialPnL < 0) return "text-red-400";
    return "text-slate-300";
  };

  // Format current date for datetime-local input
  const getCurrentDateTimeLocal = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="glass-card p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">New Trade</h2>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Symbol */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Symbol *
            </label>
            <input
              type="text"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              required
              className="w-full glass border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g., EURUSD, AAPL, BTCUSD"
            />
          </div>

          {/* Instrument Type */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Instrument Type *
            </label>
            <select
              name="instrumentType"
              value={formData.instrumentType}
              onChange={handleChange}
              required
              className="w-full glass border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
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
          </div>

          {/* Trade Type - NEW FIELD */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Trade Type *
            </label>
            <select
              name="tradeType"
              value={formData.tradeType}
              onChange={handleChange}
              required
              className="w-full glass border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="intraday">Intraday</option>
              <option value="scalp">Scalp</option>
              <option value="swing">Swing</option>
              <option value="short-term">Short Term</option>
              <option value="long-term">Long Term</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>

          {/* Side */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Side *
            </label>
            <select
              name="side"
              value={formData.side}
              onChange={handleChange}
              required
              className="w-full glass border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>

          {/* Date & Time - NEW FIELD */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              name="timestamp"
              value={
                formData.timestamp
                  ? new Date(formData.timestamp).toISOString().slice(0, 16)
                  : getCurrentDateTimeLocal()
              }
              onChange={handleChange}
              required
              className="w-full glass border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
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
              className="w-full glass border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
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
              className="w-full glass border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
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
              className="w-full glass border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
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
              className="w-full glass border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
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
              className="w-full glass border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
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
              className="w-full glass border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Strategy */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Strategy
            </label>
            <input
              type="text"
              name="strategy"
              value={formData.strategy}
              onChange={handleChange}
              className="w-full glass border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g., Breakout, Scalping, Swing"
            />
          </div>
        </div>

        {/* P&L Preview */}
        {formData.entry && formData.lot && (
          <div className="glass border border-white/10 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              P&L Preview
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
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
            className="w-full glass border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
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
            className="w-full glass border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            placeholder="Any additional notes about the trade..."
          />
        </div>

        {/* Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 glass border border-white/10 text-white py-3 rounded-lg hover:bg-white/5 transition-colors"
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
