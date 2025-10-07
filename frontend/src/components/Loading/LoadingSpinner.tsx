// src/components/Loading/LoadingSpinner.tsx
import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  text,
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <Loader2
          className={`${sizeClasses[size]} text-blue-500 animate-spin`}
        />
        <div
          className={`absolute inset-0 ${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 blur-md animate-pulse`}
        ></div>
      </div>
      {text && (
        <p className="mt-3 text-slate-400 text-sm animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
