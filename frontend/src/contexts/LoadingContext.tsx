// src/contexts/LoadingContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

interface LoadingContextType {
  isLoading: boolean;
  loadingText: string;
  setLoading: (loading: boolean, text?: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");

  const setLoading = (loading: boolean, text = "Loading...") => {
    setIsLoading(loading);
    setLoadingText(text);
  };

  return (
    <LoadingContext.Provider value={{ isLoading, loadingText, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};
