import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ugdp_token') || localStorage.getItem('samanvay_token') || null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load user session on mount
  useEffect(() => {
    async function loadSession() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
          await refreshNotifications();
        } else {
          logout();
        }
      } catch (err) {
        console.error('Session load failed:', err);
        logout();
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [token]);

  // Periodic notification fetch
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      refreshNotifications();
    }, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const refreshNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success && res.token) {
      localStorage.setItem('ugdp_token', res.token);
      setToken(res.token);
      setUser(res.user);
      await refreshNotifications();
      return { success: true };
    }
    return { success: false, message: res.message || 'Login failed' };
  };

  const register = async (data) => {
    const res = await api.register(data);
    if (res.success && res.token) {
      localStorage.setItem('ugdp_token', res.token);
      setToken(res.token);
      setUser(res.user);
      await refreshNotifications();
      return { success: true };
    }
    return { success: false, message: res.message || 'Registration failed' };
  };

  const switchRole = async (targetRole) => {
    try {
      const res = await api.demoLogin(targetRole);
      if (res.success && res.token) {
        localStorage.setItem('ugdp_token', res.token);
        setToken(res.token);
        setUser(res.user);
        await refreshNotifications();
        return { success: true };
      }
    } catch (err) {
      console.error('Role switch failed:', err);
    }
    return { success: false };
  };

  const logout = () => {
    localStorage.removeItem('ugdp_token');
    localStorage.removeItem('samanvay_token');
    setToken(null);
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        notifications,
        unreadCount,
        login,
        register,
        switchRole,
        logout,
        refreshNotifications
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
