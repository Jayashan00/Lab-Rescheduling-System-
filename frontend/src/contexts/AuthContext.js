import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
return useContext(AuthContext);
}

export function AuthProvider({ children }) {
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
const [isAuthenticated, setIsAuthenticated] = useState(false);

useEffect(() => {
const token = localStorage.getItem('token');
const userData = localStorage.getItem('user');


if (token && userData) {
  try {
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setIsAuthenticated(true);

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}
setLoading(false);
}, []);

const login = async (username, password) => {
try {
const response = await axios.post('/api/auth/signin', {
username,
password
});


  const { accessToken, id, username: userName, email, roles } = response.data;

  const userData = {
    id,
    username: userName,
    email,
    roles
  };

  localStorage.setItem('token', accessToken);
  localStorage.setItem('user', JSON.stringify(userData));

  setUser(userData);
  setIsAuthenticated(true);


  axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

  return { success: true };
} catch (error) {
  console.error('Login error:', error);
  return {
    success: false,
    message: error.response?.data?.message || 'Login failed'
  };
}
};

const register = async (userData) => {
try {
const response = await axios.post('/api/auth/signup', userData);
return { success: true, message: response.data.message };
} catch (error) {
console.error('Registration error:', error);
return {
success: false,
message: error.response?.data?.message || 'Registration failed'
};
}
};

const logout = () => {
localStorage.removeItem('token');
localStorage.removeItem('user');
delete axios.defaults.headers.common['Authorization'];
setUser(null);
setIsAuthenticated(false);
};

const value = {
user,
isAuthenticated,
login,
register,
logout,
loading
};

return (
<AuthContext.Provider value={value}>
{!loading && children}
</AuthContext.Provider>
);
}