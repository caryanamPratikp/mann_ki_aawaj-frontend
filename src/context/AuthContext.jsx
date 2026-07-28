import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('mka_admin_logged_in') === 'true';
  });
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    try {
      const user = authService.getCurrentUser();
      setCurrentUser(user);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const user = await authService.login(username, password);
      setCurrentUser(user);
      addToast(`Welcome back, ${user.fullName || user.username}!`, 'success');
      return user;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const user = await authService.register(userData);
      setCurrentUser(user);
      addToast(`Welcome to Man Ki Aavaj, ${user.fullName || user.username}!`, 'success');
      return user;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const updateProfile = (updates) => {
    if (!currentUser) return;
    const updated = authService.updateProfile ? authService.updateProfile(currentUser.id, updates) : { ...currentUser, ...updates };
    setCurrentUser(updated);
    addToast('Profile updated successfully.', 'success');
    return updated;
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    addToast('You have logged out.', 'info');
  };

  const adminLogin = (username, password) => {
    if (username && password) {
      setIsAdminLoggedIn(true);
      localStorage.setItem('mka_admin_logged_in', 'true');
      addToast('Admin logged in successfully.', 'success');
      return true;
    }
    throw new Error('Please enter valid admin credentials.');
  };

  const adminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('mka_admin_logged_in');
    addToast('Admin logged out.', 'info');
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAdminLoggedIn,
      loading,
      login,
      register,
      updateProfile,
      logout,
      adminLogin,
      adminLogout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
