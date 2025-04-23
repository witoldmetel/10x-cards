import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Create an Axios instance
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
});

// Request interceptor to add Authorization header from localStorage
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');

    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error),
);

export default api;
