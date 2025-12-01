/**
 * Authentication utilities
 * Handles token management and user session
 */

export const setAuthToken = (token) => {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }
};

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const setUser = (user) => {
  if (typeof window !== 'undefined') {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }
};

export const getUser = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

export const requireAuth = (router) => {
  if (typeof window === 'undefined') {
    return false; // Server-side, can't redirect
  }
  
  if (!isAuthenticated()) {
    router?.push('/login') || (window.location.href = '/login');
    return false;
  }
  return true;
};

