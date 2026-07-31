import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService.js';
import { apiProfileService } from '../services/apiProfileService.js';
import { apiUserService } from '../services/apiUserService.js';
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
    async function fetchUserAndProfile() {
      try {
        const user = authService.getCurrentUser();
        if (user) {
          try {
            const profileRes = await apiProfileService.getMyProfile();
            if (profileRes && profileRes.success && profileRes.data?.username) {
              const dbUsername = profileRes.data.username.startsWith('@')
                ? profileRes.data.username
                : `@${profileRes.data.username}`;
              const updatedUser = { ...user, username: dbUsername, hasProfile: true };
              localStorage.setItem('auth_user', JSON.stringify(updatedUser));
              if (user.id) {
                localStorage.setItem(`user_profile_${user.id}`, JSON.stringify(profileRes.data));
              }
              localStorage.setItem('user_profile', JSON.stringify(profileRes.data));
              setCurrentUser(updatedUser);
              return;
            }
          } catch (e) {
            // DB profile fetch error fallback
          }

          const defaultHandle = user.fullName
            ? `@${user.fullName.toLowerCase().replace(/\s+/g, '')}`
            : (user.email ? `@${user.email.split('@')[0]}` : '@user');
          const usernameFormatted = user.username
            ? (user.username.startsWith('@') ? user.username : `@${user.username}`)
            : defaultHandle;
          setCurrentUser({ ...user, username: usernameFormatted });
        } else {
          setCurrentUser(null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchUserAndProfile();
  }, []);

  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);
      const user = result.user || result;
      const defaultHandle = user.fullName
        ? `@${user.fullName.toLowerCase().replace(/\s+/g, '')}`
        : (user.email ? `@${user.email.split('@')[0]}` : '@user');
      const usernameFormatted = user.username
        ? (user.username.startsWith('@') ? user.username : `@${user.username}`)
        : defaultHandle;
      const updatedUser = { ...user, username: usernameFormatted };
      setCurrentUser(updatedUser);
      addToast(`Welcome back, ${updatedUser.username}!`, 'success');
      return { ...result, user: updatedUser };
    } catch (err) {
      addToast(err.message || 'Login failed', 'error');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const result = await authService.register(userData);
      addToast('Registration successful. Verify your email to continue.', 'success');
      return result;
    } catch (err) {
      addToast(err.message || 'Registration failed', 'error');
      throw err;
    }
  };

  const updateProfile = async (updates) => {
    if (!currentUser) return;
    try {
      if (apiProfileService && apiProfileService.updateProfile) {
        await apiProfileService.updateProfile(updates);
      }
    } catch (e) {
      console.warn('API update profile warning:', e);
    }
    const cleanUsername = updates.username
      ? (updates.username.startsWith('@') ? updates.username : `@${updates.username}`)
      : currentUser.username;
    const updated = { ...currentUser, ...updates, username: cleanUsername, hasProfile: true };
    localStorage.setItem('auth_user', JSON.stringify(updated));
    if (currentUser.id) {
      localStorage.setItem(`user_profile_${currentUser.id}`, JSON.stringify(updated));
    }
    localStorage.setItem('user_profile', JSON.stringify(updated));
    setCurrentUser(updated);
    addToast('Profile updated successfully.', 'success');
    return updated;
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    addToast('You have logged out.', 'info');
  };

  const adminLogin = async (email, password) => {
    const result = await login(email, password);
    if (result.user.role !== 'ADMIN') {
      logout();
      throw new Error('This account does not have administrator access.');
    }
    setIsAdminLoggedIn(true);
    localStorage.setItem('mka_admin_logged_in', 'true');
    return result;
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
