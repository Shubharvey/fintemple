import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { googleLogout } from "@react-oauth/google";
import { authAPI } from "../services/api";

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  provider?: "email" | "google";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
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

      console.log("Full login response:", response);
      console.log("Login response data:", response.data);

      const userData = response.data.user;

      if (!userData) {
        throw new Error("No user data received");
      }

      // Store auth data
      localStorage.setItem("user_data", JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      console.error("Login error:", error);

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

  // 👇 NEW: Google Login Function
  const loginWithGoogle = async (credential: string): Promise<void> => {
    setLoading(true);
    try {
      // Decode Google credential (you might want to verify this on backend)
      const decodedToken = JSON.parse(atob(credential.split(".")[1]));

      const googleUser: User = {
        id: decodedToken.sub,
        email: decodedToken.email,
        name: decodedToken.name,
        avatar: decodedToken.picture,
        provider: "google",
      };

      // Store auth data
      localStorage.setItem("user_data", JSON.stringify(googleUser));
      setUser(googleUser);
    } catch (error: any) {
      console.error("Google login error:", error);
      throw new Error("Google login failed");
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

      console.log("Full register response:", response);
      console.log("Register response data:", response.data);

      const userData = response.data.user;

      if (!userData) {
        throw new Error("No user data received");
      }

      // Store auth data
      localStorage.setItem("user_data", JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      console.error("Registration error:", error);

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

  // 👇 UPDATED: Logout function to handle Google logout
  const logout = (): void => {
    // Check if user logged in with Google and logout from Google
    if (user?.provider === "google") {
      googleLogout();
    }

    localStorage.removeItem("user_data");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, loginWithGoogle, register, logout, loading }}
    >
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

export default useAuth;
