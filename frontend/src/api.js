
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});


API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, error => Promise.reject(error));


API.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) return Promise.reject(error);

    const status = error.response.status;

    if (status === 403) {
      alert('You do not have permission to perform this action.');
    }

    // Do NOT redirect automatically on 401
    return Promise.reject(error);
  }
);

export default API;
