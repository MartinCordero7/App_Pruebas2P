import api from './api';

const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    let data = response.data;

    // Si la respuesta tiene formato ApiResponse, desempaquetarla
    if (data && data.success === true && data.data) {
      data = data.data;
    }

    if (data && data.accessToken) {
      localStorage.setItem('token', data.accessToken);
      const user = {
        username: data.username,
        role: data.roles && data.roles.length > 0 ? data.roles[0].replace('ROLE_', '').toLowerCase() : 'resident'
      };
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true, token: data.accessToken, user };
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  }
};

export default authService;
