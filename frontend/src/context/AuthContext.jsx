import { createContext, useState, useEffect } from 'react';
import API from '../services/api';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const registerUser = async (username, email, password) => {
    const response = await API.post('/users/register', { username, email, password });
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    setUser(response.data.user);
    return response.data;
  };

  const loginUser = async (email, password) => {
    const response = await API.post('/users/login', { email, password });
    if (response.data.requiresTwoFactor) {
      return response.data;
    }
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    setUser(response.data.user);
    return response.data;
  };

  const completeTwoFactorLogin = async (tempToken, code, useBackupCode = false, rememberDevice = false) => {
    const response = await authService.verifyTwoFactor(tempToken, code, useBackupCode, rememberDevice);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    setUser(response.data.user);
    return response.data;
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, updateUser, loading, registerUser, loginUser, completeTwoFactorLogin, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};