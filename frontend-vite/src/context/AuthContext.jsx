// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("isAdmin") === "true"
  );

  const login = (username, password) => {
    if (
      username === import.meta.env.VITE_ADMIN_USERNAME &&
      password === import.meta.env.VITE_ADMIN_PASSWORD
    ) {
      setIsAuthenticated(true);
      localStorage.setItem("isAdmin", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAdmin");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
