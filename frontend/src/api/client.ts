import axios from 'axios';
import { getStoredToken, clearStoredToken } from '../utils/tokenStorage';

const apiClient = axios.create({ baseURL: '/api' });

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearStoredToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;