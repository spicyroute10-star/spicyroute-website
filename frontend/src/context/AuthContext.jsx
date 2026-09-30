import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '../api/client';
import supabaseAuthService from '../services/supabaseAuth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved && saved !== 'undefined' && saved !== 'null' ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn('Corrupted user in localStorage, clearing:', e);
      localStorage.removeItem('user');
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchApi('/auth/me')
        .then(res => {
          if (res.user) {
            setUser(res.user);
            localStorage.setItem('user', JSON.stringify(res.user));
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), password })
    });
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    return res.user;
  };

  const register = async (email, password, name, role = 'CUSTOMER', additionalData = {}) => {
    const res = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: email.trim(),
        password,
        name: name.trim(),
        role,
        ...additionalData
      })
    });
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
    }
    return { success: true, user: res.user, token: res.token };
  };

  const loginWithGoogle = async () => {
    return await supabaseAuthService.signInWithGoogle();
  };

  const sendOtp = async (phone) => {
    return await fetchApi('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
  };

  const verifyOtp = async (payload) => {
    const res = await fetchApi('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    return res.user;
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    try {
      await supabaseAuthService.logout();
    } catch (e) {
      // ignore
    }
  };

  const setSession = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      loginWithGoogle,
      register,
      sendOtp, 
      verifyOtp, 
      logout,
      setUser,
      setToken,
      setSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
