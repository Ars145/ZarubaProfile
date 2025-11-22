import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'wouter';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  const API_URL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    checkAuth();
    
    const refreshInterval = setInterval(() => {
      refreshTokens();
    }, 50 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  const checkAuth = async () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.player);
      } else {
        await refreshTokens();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  };

  const refreshTokens = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
        });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.accessToken);
        localStorage.setItem('refresh_token', data.refreshToken);
        
        await checkAuth();
        return true;
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  const loginWithSteam = async () => {
    try {
      const returnUrl = `${window.location.origin}/auth/callback`;
      const response = await fetch(`${API_URL}/api/auth/steam/login?return_url=${encodeURIComponent(returnUrl)}`);
      const data = await response.json();
      
      if (data.success && data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Steam login failed:', error);
    }
  };

  const handleCallback = async (accessToken, refreshToken) => {
    if (accessToken && refreshToken) {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      await checkAuth();
      setLocation('/');
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setLocation('/login');
  };

  const linkDiscord = async () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const returnUrl = `${window.location.origin}/profile`;
      const response = await fetch(`${API_URL}/api/auth/discord/link?return_url=${encodeURIComponent(returnUrl)}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      
      if (data.success && data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Discord link failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    loginWithSteam,
    logout,
    linkDiscord,
    handleCallback,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
