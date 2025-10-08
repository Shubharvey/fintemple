import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Brain,
  Shield,
  TrendingUp,
  AlertTriangle,
  Target,
  Lightbulb,
  BookOpen,
  ChevronLeft,
} from "lucide-react";
import { Trade } from "../../types";
import {
  tradingKnowledge,
  findRelevantConcepts,
  TradingConcept,
} from "./tradingKnowledge";

// Types
interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  category?: "insight" | "warning" | "suggestion" | "praise";
}

interface TradingCoachState {
  userLevel: "beginner" | "intermediate" | "advanced";
  tradingStyle: "scalper" | "day_trader" | "swing_trader" | "position_trader";
  weaknesses: string[];
  strengths: string[];
  learningProgress: number;
}

interface ExpertResponse {
  message: string;
  category: "insight" | "warning" | "suggestion" | "praise";
}

interface TradingCoachProps {
  isMobile?: boolean;
  onClose?: () => void;
}

// Default fallback trades for development
const MOCK_TRADES: Trade[] = [
  {
    id: "1",
    symbol: "RELIANCE",
    direction: "LONG",
    entryPrice: 2500,
    exitPrice: 2550,
    quantity: 10,
    timestamp: new Date("2024-01-15").toISOString(),
    pnl: 500,
    status: "closed",
  },
];

const TradingCoach: React.FC<TradingCoachProps> = ({
  isMobile = false,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(!isMobile); // Always open on mobile when component is rendered
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [coachState, setCoachState] = useState<TradingCoachState>({
    userLevel: "beginner",
    tradingStyle: "day_trader",
    weaknesses: [],
    strengths: [],
    learningProgress: 0,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize coach with welcome message
  const initializeCoach = useCallback(() => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      type: "bot",
      content:
        "Welcome to Your AI Trading Coach! I'm here to help you master trading psychology, risk management, strategy development, and performance analysis. What's your biggest trading challenge right now?",
      timestamp: new Date(),
      category: "insight",
    };
    setMessages([welcomeMessage]);
  }, []);

  // Format message content with proper styling
  const formatMessageContent = useCallback((content: string) => {
    // Split by lines and process each line
    return content.split("\n").map((line, index) => {
      if (line.trim() === "") {
        return <div key={index} className="h-3" />; // Empty line spacing
      }

      // Check for emphasis patterns and convert to proper styling
      if (line.includes("**") || line.includes("*")) {
        // Simple markdown replacement with styled spans
        let formattedLine = line
          .replace(
            /\*\*(.*?)\*\*/g,
            '<strong class="font-bold text-white">$1</strong>'
          )
          .replace(/\*(.*?)\*/g, '<em class="italic text-blue-300">$1</em>');

        return (
          <div
            key={index}
            className="mb-2"
            dangerouslySetInnerHTML={{ __html: formattedLine }}
          />
        );
      }

      // Regular line with proper styling
      return (
        <div key={index} className="mb-2">
          {line}
        </div>
      );
    });
  }, []);

  // Fetch trades from API
  const fetchTrades = useCallback(async () => {
    try {
      const response = await fetch("/api/trades");
      if (response.ok) {
        const data = await response.json();
        setTrades(data);
      } else {
        setTrades(MOCK_TRADES);
      }
    } catch (error) {
      console.error("Error fetching trades, using mock data:", error);
      setTrades(MOCK_TRADES);
    }
  }, []);

  // Analyze user's trading personality based on their trades
  const analyzeTradingPersonality = useCallback(
    (userTrades: Trade[]): Partial<TradingCoachState> => {
      const closedTrades = userTrades.filter((t) => t.status === "closed");
      if (closedTrades.length === 0) {
        return {
          userLevel: "beginner",
          weaknesses: ["No trading history"],
          strengths: [],
        };
      }

      const analysis: Partial<TradingCoachState> = {
        weaknesses: [],
        strengths: [],
      };

      const winRate =
        (closedTrades.filter((t) => (t.pnl || 0) > 0).length /
          closedTrades.length) *
        100;

      if (winRate < 40) {
        analysis.weaknesses.push("Low win rate - need better trade selection");
      } else if (winRate > 60) {
        analysis.strengths.push("Good trade selection skills");
      }

      const totalPnL = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
      if (totalPnL < 0) {
        analysis.weaknesses.push(
          "Negative profitability - review risk management"
        );
      }

      return analysis;
    },
    []
  );

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Add bot message helper
  const addBotMessage = useCallback(
    (content: string, category?: Message["category"]) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        type: "bot",
        content,
        timestamp: new Date(),
        category,
      };
      setMessages((prev) => [...prev, newMessage]);
    },
    []
  );

  // Add user message helper
  const addUserMessage = useCallback((content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  // Generate expert response using trading knowledge base
  const getExpertResponse = useCallback(
    (
      message: string,
      userTrades: Trade[],
      state: TradingCoachState
    ): ExpertResponse => {
      const lowerMessage = message.toLowerCase();

      // First, try to find relevant concepts from our knowledge base
      const relevantConcepts = findRelevantConcepts(lowerMessage);

      if (relevantConcepts.length > 0) {
        const primaryConcept = relevantConcepts[0];
        return generateConceptResponse(primaryConcept, userTrades);
      }

      // Fallback to intelligent responses for common trading topics
      return generateIntelligentResponse(lowerMessage, userTrades, state);
    },
    []
  );

  // Generate response based on trading concept
  const generateConceptResponse = useCallback(
    (concept: TradingConcept, userTrades: Trade[]): ExpertResponse => {
      const randomAdvice =
        concept.expertAdvice[
          Math.floor(Math.random() * concept.expertAdvice.length)
        ];
      const randomAction =
        concept.actionableSteps[
          Math.floor(Math.random() * concept.actionableSteps.length)
        ];

      let category: Message["category"] = "suggestion";
      if (concept.severity === "high") category = "warning";
      if (concept.severity === "low") category = "praise";

      const message = `
${concept.topic}

Expert Insight:
${randomAdvice}

Immediate Action:
${randomAction}

Watch For:
${concept.warningSigns.slice(0, 2).join("\n")}

This is a ${concept.severity} priority area for improvement.`;

      return {
        message: message.trim(),
        category,
      };
    },
    []
  );

  // Generate intelligent fallback responses
  const generateIntelligentResponse = useCallback(
    (
      lowerMessage: string,
      userTrades: Trade[],
      state: TradingCoachState
    ): ExpertResponse => {
      // Psychology-related queries
      if (
        lowerMessage.includes("fear") ||
        lowerMessage.includes("scared") ||
        lowerMessage.includes("nervous")
      ) {
        return {
          message: `Trading Psychology - Managing Fear

Fear is natural, but here's how to manage it:

Immediate Actions:
• Reduce position size by 50% until comfortable
• Trade only your highest-probability setups
• Practice deep breathing before entering trades

Mindset Shift:
Fear is the cost of opportunity. Every successful trader has learned to act despite fear.

Practical Exercise:
Keep a fear journal - rate your fear level (1-10) before each trade and analyze patterns.`,
          category: "suggestion",
        };
      }

      if (
        lowerMessage.includes("discipline") ||
        lowerMessage.includes("sticking") ||
        lowerMessage.includes("plan")
      ) {
        return {
          message: `Building Trading Discipline

Discipline is a muscle you build. Here's your training plan:

Daily Rituals:
1. Pre-market routine - Review your rules for 5 minutes
2. Trade checklist - Never enter without all conditions met
3. Post-trade review - Grade your discipline (A-F) for every trade

Common Discipline Breakers & Fixes:
• FOMO trades → Wait 15 minutes, then re-evaluate
• Moving stop losses → Use hard stops, no exceptions  
• Revenge trading → Close platform for 2 hours after a loss

Remember: Consistency compounds. 10 disciplined trades > 100 emotional ones.`,
          category: "suggestion",
        };
      }

      if (
        lowerMessage.includes("risk") ||
        lowerMessage.includes("stop loss") ||
        lowerMessage.includes("position")
      ) {
        const closedTrades = userTrades.filter((t) => t.status === "closed");
        const hasTrades = closedTrades.length > 0;

        return {
          message: `Advanced Risk Management

The 1% Rule is Just the Beginning:

Position Sizing Formula:
Risk per trade = (Account Size × 1%) / (Entry - Stop Loss)

Stop Loss Strategies:
• Technical SL: Below support/resistance
• Volatility SL: 2x ATR from entry  
• Time-based SL: Exit if not working in X hours

Risk Pyramid:
1. Capital Preservation (Never risk more than 2%)
2. Consistent Growth (Focus on risk-reward > 1.5:1)  
3. Aggressive compounding (Only with proven edge)

${
  hasTrades
    ? `You have ${closedTrades.length} closed trades to analyze.`
    : "Start tracking trades to get personalized risk analysis."
}`,
          category: "suggestion",
        };
      }

      // Default intelligent response
      return {
        message: `I understand you're asking about trading.

As your trading coach, I specialize in:

Personalized Guidance:
• Analyzing your specific trade patterns
• Building custom risk management plans  
• Developing emotional control techniques

Actionable Solutions:
Tell me more about your situation:
• What's your biggest trading challenge?
• Are you struggling with fear, discipline, or strategy?
• What's your current risk management approach?

The more specific you are, the better I can help!`,
        category: "insight",
      };
    },
    []
  );

  // Handle sending messages
  const handleSendMessage = useCallback(
    async (userMessage?: string) => {
      const messageToSend = userMessage || inputValue.trim();
      if (!messageToSend) return;

      if (!userMessage) {
        setInputValue("");
      }

      addUserMessage(messageToSend);
      setIsTyping(true);

      // Simulate AI thinking time
      setTimeout(() => {
        try {
          const response = getExpertResponse(messageToSend, trades, coachState);
          addBotMessage(response.message, response.category);
        } catch (error) {
          console.error("Error generating response:", error);
          addBotMessage(
            "I'm having trouble processing your request. Please try again with a different question about trading psychology, risk management, or strategy.",
            "warning"
          );
        } finally {
          setIsTyping(false);
        }
      }, 1000 + Math.random() * 1000);
    },
    [
      inputValue,
      trades,
      coachState,
      addUserMessage,
      addBotMessage,
      getExpertResponse,
    ]
  );

  // Handle quick action clicks
  const handleQuickAction = useCallback(
    (actionMessage: string) => {
      handleSendMessage(actionMessage);
    },
    [handleSendMessage]
  );

  // Handle key press in input
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  // Handle close for mobile
  const handleClose = useCallback(() => {
    if (isMobile && onClose) {
      onClose();
    } else {
      setIsOpen(false);
    }
  }, [isMobile, onClose]);

  // Effects
  useEffect(() => {
    fetchTrades();
    initializeCoach();
  }, [fetchTrades, initializeCoach]);

  useEffect(() => {
    if (trades.length > 0) {
      const personalityAnalysis = analyzeTradingPersonality(trades);
      setCoachState((prev) => ({ ...prev, ...personalityAnalysis }));
    }
  }, [trades, analyzeTradingPersonality]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Get category color for message bubbles
  const getCategoryColor = useCallback(
    (category?: Message["category"]): string => {
      switch (category) {
        case "warning":
          return "border-red-500/20 bg-red-500/10";
        case "suggestion":
          return "border-yellow-500/20 bg-yellow-500/10";
        case "praise":
          return "border-green-500/20 bg-green-500/10";
        default:
          return "border-blue-500/20 bg-blue-500/10";
      }
    },
    []
  );

  // Get category icon for messages
  const getCategoryIcon = useCallback((category?: Message["category"]) => {
    switch (category) {
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case "suggestion":
        return <Lightbulb className="w-4 h-4 text-yellow-400" />;
      case "praise":
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      default:
        return <Target className="w-4 h-4 text-blue-400" />;
    }
  }, []);

  // Don't render anything if not open on desktop
  if (!isOpen && !isMobile) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full p-4 shadow-2xl transition-all duration-200 hover:scale-110 flex items-center justify-center"
          aria-label="Open Trading Coach"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    );
  }

  // Mobile and desktop chat window
  return (
    <div
      className={`${
        isMobile ? "fixed inset-0 z-50" : "fixed bottom-4 right-4 z-50"
      }`}
    >
      <div
        className={`
        bg-slate-900 border border-white/20 shadow-2xl flex flex-col backdrop-blur-sm
        ${
          isMobile
            ? "fixed inset-0 m-0 rounded-none"
            : "w-96 h-[600px] rounded-2xl"
        }
      `}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-white/20 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isMobile && (
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-white transition-colors p-1"
                aria-label="Back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="bg-blue-500/20 p-2 rounded-xl">
              <Bot className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-bold">Trading Coach</h3>
              <p className="text-slate-400 text-xs">
                AI Mentor • Risk Management • Psychology
              </p>
            </div>
          </div>
          {!isMobile && (
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-white transition-colors hover:bg-white/10 p-1 rounded-lg"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[90%] ${
                  message.type === "user"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                    : `${getCategoryColor(
                        message.category
                      )} border text-slate-200`
                } rounded-2xl p-4 shadow-lg`}
              >
                <div className="flex items-start space-x-3">
                  {message.type === "bot" && (
                    <div className="bg-blue-500/20 p-1.5 rounded-lg mt-0.5 flex-shrink-0">
                      {getCategoryIcon(message.category)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm leading-relaxed break-words">
                      {formatMessageContent(message.content)}
                    </div>
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {message.type === "user" && (
                    <div className="bg-blue-400/20 p-1.5 rounded-lg mt-0.5 flex-shrink-0">
                      <User className="w-4 h-4 text-blue-300" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500/20 p-1.5 rounded-lg">
                    <Bot className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions & Input */}
        <div className="border-t border-white/10 p-4 bg-slate-800/50">
          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() =>
                handleQuickAction("I'm feeling fearful about entering trades")
              }
              className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-2 rounded-full transition-colors border border-red-500/30"
            >
              Fear Management
            </button>
            <button
              onClick={() =>
                handleQuickAction("Help me with risk management strategy")
              }
              className="text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-3 py-2 rounded-full transition-colors border border-blue-500/30"
            >
              Risk Management
            </button>
            <button
              onClick={() =>
                handleQuickAction("I keep breaking my trading rules")
              }
              className="text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 px-3 py-2 rounded-full transition-colors border border-yellow-500/30"
            >
              Discipline Help
            </button>
          </div>

          {/* Input Area */}
          <div className="flex items-center space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about trading psychology, risk management, strategies..."
              className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm"
              disabled={isTyping}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isTyping}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white rounded-xl p-3 transition-all duration-200 disabled:scale-100 hover:scale-105"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingCoach;
