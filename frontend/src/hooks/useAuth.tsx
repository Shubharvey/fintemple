import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { authAPI } from "../services/api";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userData = localStorage.getItem("user_data");
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Auth check error:", error);
        localStorage.removeItem("user_data");
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });

      // ✅ FIXED: Access the response data correctly
      console.log("Full login response:", response); // Debug log
      console.log("Login response data:", response.data); // Debug log

      const userData = response.data.user; // Axios puts data in response.data

      if (!userData) {
        throw new Error("No user data received");
      }

      // Store auth data
      localStorage.setItem("user_data", JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      console.error("Login error:", error);

      // ✅ FIXED: Better error extraction
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Login failed";
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<void> => {
    setLoading(true);
    try {
      const response = await authAPI.register({ email, password, name });

      // ✅ FIXED: Access the response data correctly
      console.log("Full register response:", response); // Debug log
      console.log("Register response data:", response.data); // Debug log

      const userData = response.data.user; // Axios puts data in response.data

      if (!userData) {
        throw new Error("No user data received");
      }

      // Store auth data
      localStorage.setItem("user_data", JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      console.error("Registration error:", error);

      // ✅ FIXED: Better error extraction
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Registration failed";
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem("user_data");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
