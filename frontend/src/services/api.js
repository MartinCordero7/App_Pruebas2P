import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const isAuthEndpoint = config.url && (config.url.includes('/auth/login') || config.url.includes('/auth/register'));
  
  if (token && !isAuthEndpoint) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    // Si la respuesta tiene formato ApiResponse de Spring Boot (success y data), desempaquetar data
    if (response.data && response.data.success === true && response.data.data !== undefined) {
      // Reemplazamos response.data con el contenido real para que los servicios no se rompan
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    const isAuthEndpoint =
      error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
