import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.MODE === 'production' ? `${import.meta.env.VITE_API_URL}/api` : '/api';

export const instance: AxiosInstance = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add Authorization header from localStorage
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');

    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error),
);

// Add response interceptor to handle errors
instance.interceptors.response.use(
  response => response,
  error => {
    if (process.env.NODE_ENV === 'development') {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response error:', error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Request error:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error:', error.message);
      }
    }
    return Promise.reject(error);
  },
);

export default instance;
