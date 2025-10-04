import { useState, useEffect } from "react";
import { dashboardAPI } from "../services/api";

export const useDashboardData = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use the summary endpoint that matches your DashboardSummary type
        const summaryData = await dashboardAPI.getSummary();
        setData(summaryData);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Failed to load dashboard data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};
