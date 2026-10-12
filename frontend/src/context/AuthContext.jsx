import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api
      .get("/customers/me")
      .then(({ data }) => {
        if (active) {
          setCustomer(data);
        }
      })
      .catch(() => {
        if (active) {
          setCustomer(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const refreshCustomer = async () => {
    const { data } = await api.get("/customers/me");
    setCustomer(data);
    return data;
  };

  const logout = async () => {
    try {
      await api.post("/customers/logout");
    } catch (error) {
      if (error.response?.status !== 401) {
        throw error;
      }
    }

    setCustomer(null);
  };

  const value = useMemo(
    () => ({ customer, loading, refreshCustomer, logout }),
    [customer, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
