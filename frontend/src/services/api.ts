import axios from "axios";

// ✅ FIX: Use your actual Render backend URL
const API_BASE_URL = "https://fintemple-backend.onrender.com/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // ✅ INCREASED to 30 seconds for Render cold starts
  withCredentials: true, // ✅ Add this for cookies/auth
});

// ✅ ENHANCED request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    const timestamp = new Date().toISOString();
    console.log(
      `🚀 [${timestamp}] API Request:`,
      config.method?.toUpperCase(),
      config.url
    );
    console.log(`   Full URL: ${config.baseURL}${config.url}`);
    console.log(`   Headers:`, config.headers);
    if (config.data) {
      console.log(
        `   Data:`,
        typeof config.data === "string"
          ? config.data
          : JSON.stringify(config.data)
      );
    }
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// ✅ ENHANCED response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    const timestamp = new Date().toISOString();
    console.log(
      `✅ [${timestamp}] API Success:`,
      response.status,
      response.config.url
    );
    console.log(`   Response data:`, response.data);
    return response;
  },
  (error) => {
    const timestamp = new Date().toISOString();
    console.error(`❌ [${timestamp}] API Error:`, {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code,
    });

    // ✅ Handle specific error types with better messages
    if (error.code === "NETWORK_ERROR" || error.message === "Network Error") {
      return Promise.reject(
        new Error(
          "Unable to connect to server. Please check your internet connection and try again."
        )
      );
    }

    // ✅ Handle timeout errors
    if (error.code === "ECONNABORTED") {
      return Promise.reject(
        new Error("Request timeout. The server is taking too long to respond.")
      );
    }

    // ✅ Handle CORS errors specifically
    if (
      error.message?.includes("CORS") ||
      error.message?.includes("origin") ||
      error.message?.includes("cross-origin")
    ) {
      return Promise.reject(
        new Error(
          "Connection blocked by browser security. Please try refreshing the page."
        )
      );
    }

    // ✅ Handle specific HTTP status codes
    if (error.response?.status === 404) {
      return Promise.reject(
        new Error("Service temporarily unavailable. Please try again later.")
      );
    }

    if (error.response?.status === 500) {
      return Promise.reject(
        new Error(
          "Server error. Our team has been notified. Please try again later."
        )
      );
    }

    if (error.response?.status === 503) {
      return Promise.reject(
        new Error(
          "Service temporarily unavailable. Please try again in a few minutes."
        )
      );
    }

    // ✅ Extract user-friendly error message
    const serverError = error.response?.data;
    let userMessage = "Something went wrong. Please try again.";

    if (serverError?.error) {
      userMessage = serverError.error;
    } else if (serverError?.message) {
      userMessage = serverError.message;
    } else if (error.response?.status === 400) {
      userMessage = "Invalid request. Please check your input and try again.";
    } else if (error.response?.status === 401) {
      userMessage = "Please log in to continue.";
    } else if (error.response?.status === 403) {
      userMessage = "You don't have permission to perform this action.";
    }

    return Promise.reject(new Error(userMessage));
  }
);

// ✅ TEST CONNECTION FUNCTION
export const testConnection = async (): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    console.log("🔧 Testing connection to backend...");
    const response = await api.get("/health");
    return {
      success: true,
      message: "✅ Backend connection successful",
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Backend connection failed: ${error.message}`,
    };
  }
};

// ✅ TEST AUTH ENDPOINT FUNCTION
export const testAuthEndpoint = async (): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    console.log("🔧 Testing auth endpoint...");
    const response = await api.get("/diagnostic");
    return {
      success: true,
      message: "✅ Auth endpoint accessible",
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Auth endpoint test failed: ${error.message}`,
    };
  }
};

// Rest of your API exports remain the same...
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

  // ✅ ADD TEST REGISTRATION ENDPOINT
  testRegister: (userData: { email: string; password: string; name: string }) =>
    api.post("/test-registration", userData),
};
