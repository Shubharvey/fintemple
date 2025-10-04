const { v4: uuidv4 } = require("uuid");
const CurrencyConverter = require("../utils/currencyConverter");

class TradingAnalytics {
  static computeTradePips(trade) {
    if (!trade.exit) return 0;

    if (trade.instrumentType === "forex") {
      const pip =
        trade.pipDecimal ?? (trade.symbol.includes("JPY") ? 0.01 : 0.0001);
      const pips =
        trade.side === "buy"
          ? (trade.exit - trade.entry) / pip
          : (trade.entry - trade.exit) / pip;
      return pips;
    }

    if (trade.instrumentType === "stock" || trade.instrumentType === "crypto") {
      return trade.exit - trade.entry;
    }

    return 0;
  }

  static computeTradePnL(trade, instrument = {}, accountCurrency = "INR") {
    if (!trade.exit) return { profitPips: 0, profitMoney: 0 };

    let profitPips = 0;
    let profitMoney = 0;

    if (trade.instrumentType === "forex") {
      profitPips = this.computeTradePips(trade);
      const pipValue = trade.pipValuePerLot ?? instrument.pipValuePerLot ?? 10;
      const lotSize = trade.lot ?? 1;
      profitMoney = profitPips * pipValue * lotSize;
      // Convert from USD to INR for forex (since pip values are typically in USD)
      profitMoney = CurrencyConverter.convert(
        profitMoney,
        "USD",
        accountCurrency
      );
    } else if (
      trade.instrumentType === "stock" ||
      trade.instrumentType === "crypto"
    ) {
      const shares = trade.volume ?? trade.lot ?? 1;
      profitMoney = (trade.exit - trade.entry) * shares;
      profitPips = profitMoney;
      // For stocks/crypto, assume prices are already in account currency (INR)
    }

    profitMoney = profitMoney - (trade.fees ?? 0);
    return { profitPips, profitMoney };
  }

  static equityCurve(trades, startingBalance = 10000) {
    const closedTrades = trades
      .filter((t) => t.exit && t.exitTimestamp)
      .map((trade) => ({
        ...trade,
        pnl: this.computeTradePnL(trade).profitMoney,
        time: trade.exitTimestamp || trade.timestamp,
      }))
      .sort((a, b) => new Date(a.time) - new Date(b.time));

    let balance = startingBalance;
    const equitySeries = [
      {
        time: new Date(closedTrades[0]?.time || Date.now()).toISOString(),
        balance,
      },
    ];

    closedTrades.forEach((trade) => {
      balance += trade.pnl;
      equitySeries.push({
        time: trade.time,
        balance: Math.max(0, balance), // Prevent negative balance
      });
    });

    return equitySeries;
  }

  static drawdowns(equitySeries) {
    if (equitySeries.length === 0)
      return { drawdownSeries: [], maxDrawdown: 0 };

    let runningMax = equitySeries[0].balance;
    const drawdownSeries = [];
    let maxDrawdown = 0;

    equitySeries.forEach((point) => {
      runningMax = Math.max(runningMax, point.balance);
      const drawdown =
        runningMax > 0 ? (runningMax - point.balance) / runningMax : 0;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
      drawdownSeries.push({
        time: point.time,
        drawdown: drawdown * 100, // Convert to percentage
      });
    });

    return { drawdownSeries, maxDrawdown: maxDrawdown * 100 };
  }

  static profitFactor(trades) {
    const closedTrades = trades.filter((t) => t.exit);
    const profits = closedTrades.map(
      (t) => this.computeTradePnL(t).profitMoney
    );
    const grossProfit = profits
      .filter((p) => p > 0)
      .reduce((sum, p) => sum + p, 0);
    const grossLoss = Math.abs(
      profits.filter((p) => p < 0).reduce((sum, p) => sum + p, 0)
    );

    return grossLoss === 0
      ? grossProfit > 0
        ? Infinity
        : 0
      : grossProfit / grossLoss;
  }

  static winRate(trades) {
    const closedTrades = trades.filter((t) => t.exit);
    if (closedTrades.length === 0) return 0;

    const winningTrades = closedTrades.filter(
      (t) => this.computeTradePnL(t).profitMoney > 0
    );
    return winningTrades.length / closedTrades.length;
  }

  static averageWinLoss(trades) {
    const closedTrades = trades.filter((t) => t.exit);
    const profits = closedTrades.map(
      (t) => this.computeTradePnL(t).profitMoney
    );

    const wins = profits.filter((p) => p > 0);
    const losses = profits.filter((p) => p < 0);

    const avgWin =
      wins.length > 0 ? wins.reduce((sum, w) => sum + w, 0) / wins.length : 0;
    const avgLoss =
      losses.length > 0
        ? losses.reduce((sum, l) => sum + l, 0) / losses.length
        : 0;

    return { avgWin, avgLoss: Math.abs(avgLoss) };
  }

  static averageRR(trades) {
    const closedTrades = trades.filter((t) => t.exit && t.sl);
    if (closedTrades.length === 0) return 0;

    const rrRatios = closedTrades
      .map((trade) => {
        const risk = Math.abs(trade.entry - trade.sl);
        const reward = Math.abs(trade.exit - trade.entry);
        return risk > 0 ? reward / risk : 0;
      })
      .filter((rr) => rr > 0);

    return rrRatios.length > 0
      ? rrRatios.reduce((sum, rr) => sum + rr, 0) / rrRatios.length
      : 0;
  }

  static sharpeRatio(equitySeries, riskFreeRate = 0.0) {
    if (equitySeries.length < 2) return 0;

    const returns = [];
    for (let i = 1; i < equitySeries.length; i++) {
      const ret =
        (equitySeries[i].balance - equitySeries[i - 1].balance) /
        equitySeries[i - 1].balance;
      returns.push(ret);
    }

    const meanReturn =
      returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance =
      returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) /
      returns.length;
    const stdDev = Math.sqrt(variance);

    return stdDev === 0 ? 0 : (meanReturn - riskFreeRate) / stdDev;
  }

  static sortinoRatio(equitySeries, riskFreeRate = 0.0) {
    if (equitySeries.length < 2) return 0;

    const returns = [];
    for (let i = 1; i < equitySeries.length; i++) {
      const ret =
        (equitySeries[i].balance - equitySeries[i - 1].balance) /
        equitySeries[i - 1].balance;
      returns.push(ret);
    }

    const meanReturn =
      returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const downsideReturns = returns.filter((ret) => ret < 0);
    const downsideVariance =
      downsideReturns.reduce((sum, ret) => sum + Math.pow(ret, 2), 0) /
      returns.length;
    const downsideStdDev = Math.sqrt(downsideVariance);

    return downsideStdDev === 0
      ? 0
      : (meanReturn - riskFreeRate) / downsideStdDev;
  }

  static computeStreaks(trades) {
    const closedTrades = trades.filter((t) => t.exit);
    if (closedTrades.length === 0) return { longestWin: 0, longestLoss: 0 };

    const results = closedTrades
      .sort(
        (a, b) =>
          new Date(a.exitTimestamp || a.timestamp) -
          new Date(b.exitTimestamp || b.timestamp)
      )
      .map((t) => (this.computeTradePnL(t).profitMoney > 0 ? "win" : "loss"));

    let currentStreak = 0;
    let currentType = "";
    let longestWin = 0;
    let longestLoss = 0;

    results.forEach((result) => {
      if (result === currentType) {
        currentStreak++;
      } else {
        currentStreak = 1;
        currentType = result;
      }

      if (result === "win") {
        longestWin = Math.max(longestWin, currentStreak);
      } else {
        longestLoss = Math.max(longestLoss, currentStreak);
      }
    });

    return { longestWin, longestLoss };
  }

  static heatmap(trades) {
    const matrix = Array(7)
      .fill()
      .map(() => Array(24).fill(0));
    const counts = Array(7)
      .fill()
      .map(() => Array(24).fill(0));

    trades.forEach((trade) => {
      if (!trade.exitTimestamp) return;

      const date = new Date(trade.exitTimestamp);
      const weekday = date.getDay();
      const hour = date.getHours();
      const pnl = this.computeTradePnL(trade).profitMoney;

      matrix[weekday][hour] += pnl;
      counts[weekday][hour]++;
    });

    return { byWeekdayHour: matrix, counts };
  }

  static hourlySummary(trades) {
    const hourlyData = Array(24)
      .fill()
      .map((_, hour) => ({
        hour,
        pnl: 0,
        trades: 0,
      }));

    trades.forEach((trade) => {
      if (!trade.exitTimestamp) return;

      const hour = new Date(trade.exitTimestamp).getHours();
      const pnl = this.computeTradePnL(trade).profitMoney;

      hourlyData[hour].pnl += pnl;
      hourlyData[hour].trades++;
    });

    const totalProfit = hourlyData.reduce(
      (sum, data) => sum + Math.max(0, data.pnl),
      0
    );

    return hourlyData
      .map((data) => ({
        hour: data.hour,
        pnl: data.pnl,
        trades: data.trades,
        percentOfTotal:
          totalProfit > 0 ? (Math.max(0, data.pnl) / totalProfit) * 100 : 0,
      }))
      .sort((a, b) => b.pnl - a.pnl);
  }

  static dailySummary(trades) {
    const dailyData = {};

    trades.forEach((trade) => {
      if (!trade.exitTimestamp) return;

      const date = new Date(trade.exitTimestamp).toISOString().split("T")[0];
      const pnl = this.computeTradePnL(trade).profitMoney;

      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          pnl: 0,
          trades: 0,
        };
      }

      dailyData[date].pnl += pnl;
      dailyData[date].trades++;
    });

    // Convert to array and sort by date (newest first)
    return Object.values(dailyData)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((day) => ({
        ...day,
        date: new Date(day.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      }));
  }

  static strategyBreakdown(trades) {
    const strategies = {};

    trades.forEach((trade) => {
      const strategy = trade.strategy || "Uncategorized";
      if (!strategies[strategy]) {
        strategies[strategy] = {
          strategy,
          trades: [],
          profit: 0,
          winRate: 0,
        };
      }

      strategies[strategy].trades.push(trade);
    });

    return Object.values(strategies)
      .map((strat) => {
        const closedTrades = strat.trades.filter((t) => t.exit);
        const winningTrades = closedTrades.filter(
          (t) => this.computeTradePnL(t).profitMoney > 0
        );
        const totalProfit = closedTrades.reduce(
          (sum, t) => sum + this.computeTradePnL(t).profitMoney,
          0
        );

        return {
          strategy: strat.strategy,
          trades: closedTrades.length,
          profit: totalProfit,
          winRate:
            closedTrades.length > 0
              ? winningTrades.length / closedTrades.length
              : 0,
          equitySeries: this.equityCurve(closedTrades),
        };
      })
      .filter((strat) => strat.trades > 0);
  }

  static monteCarloSimulation(
    trades,
    simulations = 10000,
    startingBalance = 10000
  ) {
    const closedTrades = trades.filter((t) => t.exit);
    if (closedTrades.length === 0) {
      return {
        simulations: 0,
        percentiles: {
          p10: startingBalance,
          p50: startingBalance,
          p90: startingBalance,
        },
        ruinProbability: 0,
      };
    }

    const returns = closedTrades.map(
      (t) => this.computeTradePnL(t).profitMoney
    );
    const finalBalances = [];

    for (let i = 0; i < simulations; i++) {
      let balance = startingBalance;
      // Resample returns with replacement
      for (let j = 0; j < returns.length; j++) {
        const randomReturn =
          returns[Math.floor(Math.random() * returns.length)];
        balance += randomReturn;
        balance = Math.max(0, balance); // No negative balance
      }
      finalBalances.push(balance);
    }

    finalBalances.sort((a, b) => a - b);

    const p10 = finalBalances[Math.floor(simulations * 0.1)];
    const p50 = finalBalances[Math.floor(simulations * 0.5)];
    const p90 = finalBalances[Math.floor(simulations * 0.9)];

    const ruinProbability =
      finalBalances.filter((b) => b < startingBalance * 0.5).length /
      simulations;

    return {
      simulations,
      percentiles: { p10, p50, p90 },
      ruinProbability,
    };
  }

  // Helper method to get currency formatted values
  static formatCurrency(amount, currency = "INR") {
    return CurrencyConverter.format(amount, currency);
  }
}

module.exports = TradingAnalytics;
