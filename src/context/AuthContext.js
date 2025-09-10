import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userType, setUserType] = useState(null);
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedType = localStorage.getItem('userType');
    const storedUsername = localStorage.getItem('username');
    const storedUserId = localStorage.getItem('userId');

    if (storedToken && storedType && storedUsername && storedUserId) {
      setToken(storedToken);
      setUserType(storedType);
      setUsername(storedUsername);
      setUserId(storedUserId);
    }

    setLoading(false);
  }, []);

  const login = (newToken, newType, newUsername, newUserId) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userType', newType);
    localStorage.setItem('username', newUsername);
    localStorage.setItem('userId', newUserId);

    setToken(newToken);
    setUserType(newType);
    setUsername(newUsername);
    setUserId(newUserId);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUserType(null);
    setUsername(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ userType, token, username, userId, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
