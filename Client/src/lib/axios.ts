import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

export const instance: AxiosInstance = axios.create({
  // @todo: use env variable
  baseURL: 'http://localhost:3000/api/',
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

export default instance;
