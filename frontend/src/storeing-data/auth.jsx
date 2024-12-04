import React, { createContext, useContext, useEffect, useState } from "react";

// Create AuthContext
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Store user data
  const [token, setToken] = useState(localStorage.getItem("token")); // Store JWT
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Track authentication errors
  const authorizationToken = `Bearer ${token}`;

  const storeTokenInLocalMem = (serverToken) => {
    setToken(serverToken);
    localStorage.setItem("token", serverToken);
  };

  const isLoggedIn = !!token;

  const logoutUser = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  const userAuthentication = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/auth/me", {
        method: "GET",
        headers: {
          Authorization: authorizationToken,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        logoutUser(); // Token might be invalid/expired
        setError("Session expired. Please log in again.");
      }
    } catch (error) {
      console.error("Error during user authentication:", error);
      logoutUser();
      setError("Error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    userAuthentication(); // Fetch user data when token changes
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        storeTokenInLocalMem,
        logoutUser,
        user,
        loading,
        error,
        authorizationToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const authContextValue = useContext(AuthContext);
  if (!authContextValue)
    throw new Error("useAuth used outside of the provider");

  return authContextValue;
};
