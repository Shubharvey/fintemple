// src/components/Search/EnhancedSearch.tsx
import React, { useState, useEffect, useRef } from "react";
import { Search, X, TrendingUp, Clock, Filter } from "lucide-react";
import { Trade } from "../../types";

interface SearchSuggestion {
  type: "symbol" | "instrument" | "tradeType" | "recent";
  value: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface EnhancedSearchProps {
  trades: Trade[];
  onSearch: (
    query: string,
    filters: {
      instrumentType?: string;
      tradeType?: string;
      side?: string;
    }
  ) => void;
  placeholder?: string;
}

const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  trades,
  onSearch,
  placeholder = "Search trades...",
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    instrumentType: "",
    tradeType: "",
    side: "",
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Extract unique values from trades
  const getUniqueSymbols = () => {
    const symbols = [...new Set(trades.map((trade) => trade.symbol))];
    return symbols.map((symbol) => ({
      type: "symbol" as const,
      value: symbol,
      label: symbol,
      count: trades.filter((t) => t.symbol === symbol).length,
      icon: <TrendingUp className="w-4 h-4" />,
    }));
  };

  const getInstrumentTypes = () => {
    const types = [...new Set(trades.map((trade) => trade.instrumentType))];
    return types.map((type) => ({
      type: "instrument" as const,
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      count: trades.filter((t) => t.instrumentType === type).length,
    }));
  };

  const getTradeTypes = () => {
    const types = [
      ...new Set(trades.map((trade) => trade.tradeType).filter(Boolean)),
    ];
    return types.map((type) => ({
      type: "tradeType" as const,
      value: type,
      label: type.charAt(0).toUpperCase() + type.replace("-", " "),
      count: trades.filter((t) => t.tradeType === type).length,
    }));
  };

  // Generate suggestions based on query
  useEffect(() => {
    if (!query.trim()) {
      // Show recent searches and popular items when query is empty
      const recentSuggestions = recentSearches.slice(0, 3).map((search) => ({
        type: "recent" as const,
        value: search,
        label: search,
        icon: <Clock className="w-4 h-4" />,
      }));

      const popularSymbols = getUniqueSymbols()
        .sort((a, b) => (b.count || 0) - (a.count || 0))
        .slice(0, 3);

      setSuggestions([...recentSuggestions, ...popularSymbols]);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const allSuggestions: SearchSuggestion[] = [];

    // Symbol suggestions
    const symbolMatches = getUniqueSymbols().filter((symbol) =>
      symbol.value.toLowerCase().includes(lowercaseQuery)
    );
    allSuggestions.push(...symbolMatches);

    // Instrument type suggestions
    const instrumentMatches = getInstrumentTypes().filter((type) =>
      type.label.toLowerCase().includes(lowercaseQuery)
    );
    allSuggestions.push(...instrumentMatches);

    // Trade type suggestions
    const tradeTypeMatches = getTradeTypes().filter((type) =>
      type.label.toLowerCase().includes(lowercaseQuery)
    );
    allSuggestions.push(...tradeTypeMatches);

    // Sort by relevance (exact matches first, then by count)
    allSuggestions.sort((a, b) => {
      const aExact = a.value.toLowerCase() === lowercaseQuery;
      const bExact = b.value.toLowerCase() === lowercaseQuery;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return (b.count || 0) - (a.count || 0);
    });

    setSuggestions(allSuggestions.slice(0, 8));
  }, [query, trades, recentSearches]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    // Add to recent searches
    setRecentSearches((prev) => {
      const updated = [searchQuery, ...prev.filter((s) => s !== searchQuery)];
      return updated.slice(0, 5); // Keep only last 5 searches
    });

    onSearch(searchQuery, selectedFilters);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === "instrument") {
      setSelectedFilters((prev) => ({
        ...prev,
        instrumentType: suggestion.value,
      }));
    } else if (suggestion.type === "tradeType") {
      setSelectedFilters((prev) => ({ ...prev, tradeType: suggestion.value }));
    } else {
      setQuery(suggestion.value);
      handleSearch(suggestion.value);
    }
  };

  const clearFilter = (filterType: "instrumentType" | "tradeType" | "side") => {
    setSelectedFilters((prev) => ({ ...prev, [filterType]: "" }));
    onSearch(query, { ...selectedFilters, [filterType]: "" });
  };

  const clearAll = () => {
    setQuery("");
    setSelectedFilters({ instrumentType: "", tradeType: "", side: "" });
    onSearch("", { instrumentType: "", tradeType: "", side: "" });
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            } else if (e.key === "Escape") {
              setShowSuggestions(false);
            }
          }}
          className="block w-full pl-10 pr-10 py-3 border border-white/10 rounded-lg bg-slate-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={placeholder}
        />
        {(query || Object.values(selectedFilters).some((v) => v)) && (
          <button
            onClick={clearAll}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-white" />
          </button>
        )}
      </div>

      {/* Active Filters */}
      {(selectedFilters.instrumentType ||
        selectedFilters.tradeType ||
        selectedFilters.side) && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedFilters.instrumentType && (
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Filter className="w-3 h-3" />
              Instrument: {selectedFilters.instrumentType}
              <button onClick={() => clearFilter("instrumentType")}>
                <X className="w-3 h-3 hover:text-blue-300" />
              </button>
            </div>
          )}
          {selectedFilters.tradeType && (
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Filter className="w-3 h-3" />
              Type: {selectedFilters.tradeType}
              <button onClick={() => clearFilter("tradeType")}>
                <X className="w-3 h-3 hover:text-purple-300" />
              </button>
            </div>
          )}
          {selectedFilters.side && (
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
              <Filter className="w-3 h-3" />
              Side: {selectedFilters.side}
              <button onClick={() => clearFilter("side")}>
                <X className="w-3 h-3 hover:text-green-300" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-white/10 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-2">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-white/5 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  {suggestion.icon && (
                    <div className="text-gray-400">{suggestion.icon}</div>
                  )}
                  <div>
                    <div className="text-white font-medium">
                      {suggestion.label}
                    </div>
                    <div className="text-xs text-gray-400 capitalize">
                      {suggestion.type === "symbol" && "Trading Pair"}
                      {suggestion.type === "instrument" && "Instrument Type"}
                      {suggestion.type === "tradeType" && "Trade Type"}
                      {suggestion.type === "recent" && "Recent Search"}
                    </div>
                  </div>
                </div>
                {suggestion.count && (
                  <div className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                    {suggestion.count} trades
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Filter Actions */}
          <div className="border-t border-white/10 p-2">
            <div className="text-xs text-gray-400 mb-2 px-3">
              Quick Filters:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  setSelectedFilters((prev) => ({
                    ...prev,
                    instrumentType: "forex",
                  }))
                }
                className="text-left px-3 py-2 text-xs bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20 transition-colors"
              >
                Forex Only
              </button>
              <button
                onClick={() =>
                  setSelectedFilters((prev) => ({
                    ...prev,
                    instrumentType: "stock",
                  }))
                }
                className="text-left px-3 py-2 text-xs bg-green-500/10 text-green-400 rounded hover:bg-green-500/20 transition-colors"
              >
                Stocks Only
              </button>
              <button
                onClick={() =>
                  setSelectedFilters((prev) => ({
                    ...prev,
                    tradeType: "intraday",
                  }))
                }
                className="text-left px-3 py-2 text-xs bg-purple-500/10 text-purple-400 rounded hover:bg-purple-500/20 transition-colors"
              >
                Intraday Only
              </button>
              <button
                onClick={() =>
                  setSelectedFilters((prev) => ({ ...prev, side: "buy" }))
                }
                className="text-left px-3 py-2 text-xs bg-emerald-500/10 text-emerald-400 rounded hover:bg-emerald-500/20 transition-colors"
              >
                Buy Trades Only
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSearch;
