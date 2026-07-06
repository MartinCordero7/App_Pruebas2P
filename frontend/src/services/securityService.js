import api from './api';
import API_ROUTES from './apiRoutes';

const securityService = {
  getAccessLog: async (params) => {
    const response = await api.get(API_ROUTES.accesos, { params });
    return response.data;
  },

  registerAccess: async (data) => {
    const response = await api.post(API_ROUTES.accesos, data);
    return response.data;
  },

  deleteAccess: async (id) => {
    const response = await api.delete(`${API_ROUTES.accesos}/${id}`);
    return response.data;
  },

  getVisitors: async (params) => {
    const response = await api.get(API_ROUTES.visitantes, { params });
    return response.data;
  }
};

export default securityService;