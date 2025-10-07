// src/components/Loading/LoadingScreen.tsx
import React from "react";
import LoadingSpinner from "./LoadingSpinner";

interface LoadingScreenProps {
  text?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  text = "Loading your trading dashboard...",
}) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black z-50 flex flex-col items-center justify-center">
      {/* Background elements matching the theme */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(56,189,248,0.15)_0%,transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.1)_0%,transparent_50%)]"></div>

      {/* Logo */}
      <div className="relative z-10 mb-8">
        <img
          src="/onlylogo.png"
          alt="FinTemple"
          className="h-16 w-auto object-contain animate-pulse"
        />
      </div>

      {/* Loading spinner */}
      <div className="relative z-10">
        <LoadingSpinner size="xl" text={text} />
      </div>

      {/* Loading dots animation */}
      <div className="relative z-10 flex space-x-2 mt-8">
        <div
          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
