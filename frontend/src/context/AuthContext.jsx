import { createContext, useContext, useState, useEffect } from "react";
import {
  getCurrentUser,
  logout as logoutAuth,
  isAuthenticated,
} from "../utils/authUtils";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on mount
    if (isAuthenticated()) {
      const currentUser = getCurrentUser();
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    logoutAuth();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
