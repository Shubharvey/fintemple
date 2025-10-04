import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(
      "Making API request:",
      config.method?.toUpperCase(),
      config.url
    );
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log("API response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    // Handle network errors
    if (error.code === "NETWORK_ERROR" || error.message === "Network Error") {
      return Promise.reject(
        new Error("Network error - please check your connection")
      );
    }

    // Handle server errors or other messages
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";

    return Promise.reject(new Error(message));
  }
);

export const tradesAPI = {
  getAll: (params?: any) => api.get("/trades", { params }),
  getById: (id: string) => api.get(`/trades/${id}`),
  create: (trade: any) => api.post("/trades", trade),
  update: (id: string, trade: any) => api.put(`/trades/${id}`, trade),
  bulkImport: (trades: any[]) => api.post("/trades/bulk", trades),
};

export const reportsAPI = {
  getSummary: (params?: any) => api.get("/reports/summary", { params }),
};

export const dashboardAPI = {
  getSummary: async (): Promise<any> => {
    const response = await api.get("/dashboard/summary");
    return response.data;
  },

  getDailySummary: async (): Promise<any> => {
    const response = await api.get("/dashboard/daily-summary");
    return response.data;
  },

  getHourlySummary: async (): Promise<any> => {
    const response = await api.get("/dashboard/hourly-summary");
    return response.data;
  },

  getKPIs: async (): Promise<any> => {
    const response = await api.get("/dashboard/kpis");
    return response.data;
  },

  getRecentTrades: async (limit: number = 5): Promise<any> => {
    const response = await api.get("/dashboard/recent-trades", {
      params: { limit },
    });
    return response.data;
  },
};

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post("/auth/login", credentials),

  register: (userData: { email: string; password: string; name: string }) =>
    api.post("/auth/register", userData),

  logout: () => api.post("/auth/logout"),

  getProfile: () => api.get("/auth/profile"),

  refreshToken: () => api.post("/auth/refresh-token"),
};
