import React from "react";
import { formatCurrency } from "../../utils/formatters";
import { Target, CheckCircle, AlertCircle } from "lucide-react";

interface GoalTrackingProps {
  data?: {
    winRateGoal?: number;
    monthlyPnLGoal?: number;
    maxDrawdownGoal?: number;
    winRate?: number;
    monthlyPnL?: number;
    maxDrawdown?: number;
  };
  compact?: boolean;
}

const GoalTracking: React.FC<GoalTrackingProps> = ({ data = {} }) => {
  const {
    winRateGoal = 60,
    monthlyPnLGoal = 10000,
    maxDrawdownGoal = 5000,
    winRate = 0,
    monthlyPnL = 0,
    maxDrawdown = 0,
  } = data;

  const getProgressPercentage = (
    current: number,
    goal: number,
    isInverted: boolean = false
  ) => {
    if (isInverted) {
      // For drawdown, lower is better - calculate how much we're under the limit
      const remaining = Math.max(0, goal - current);
      return Math.min(100, (remaining / goal) * 100);
    }
    return Math.min(100, Math.max(0, (current / goal) * 100));
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-gray-500";
  };

  const getProgressStatus = (percentage: number) => {
    if (percentage >= 100)
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (percentage >= 75)
      return <CheckCircle className="w-4 h-4 text-blue-400" />;
    if (percentage >= 50)
      return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    return <AlertCircle className="w-4 h-4 text-red-400" />;
  };

  const goals = [
    {
      title: "Win Rate Goal",
      current: winRate,
      goal: winRateGoal,
      unit: "%",
      description: `Target: ${winRateGoal}%`,
    },
    {
      title: "Monthly P&L Goal",
      current: monthlyPnL,
      goal: monthlyPnLGoal,
      unit: "",
      description: `Target: ${formatCurrency(monthlyPnLGoal)}`,
    },
    {
      title: "Max Drawdown",
      current: maxDrawdown,
      goal: maxDrawdownGoal,
      unit: "",
      description: `Max: ${formatCurrency(maxDrawdownGoal)}`,
      isInverted: true, // Lower is better for drawdown
    },
  ];

  return (
    <div className="glass-card p-3 md:p-6">
      <h3 className="text-base md:text-lg font-semibold text-white mb-4">
        Goals
      </h3>
      <div className="space-y-3 md:space-y-4">
        {goals.map((goal, index) => {
          const progressPercentage = getProgressPercentage(
            goal.current,
            goal.goal,
            goal.isInverted
          );

          return (
            <div key={index} className="space-y-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1">
                <span className="text-sm font-medium text-white">
                  {goal.title}
                </span>
                <span className="text-xs text-slate-400">
                  {goal.description}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getProgressColor(
                    progressPercentage
                  )}`}
                  style={{
                    width: `${progressPercentage}%`,
                  }}
                ></div>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <span className="text-sm font-medium text-white">
                  {goal.unit === "%"
                    ? `${goal.current.toFixed(1)}% / ${goal.goal}%`
                    : `${formatCurrency(goal.current)} / ${formatCurrency(
                        goal.goal
                      )}`}
                </span>
                <div className="flex items-center mt-1 sm:mt-0">
                  {getProgressStatus(progressPercentage)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GoalTracking;
