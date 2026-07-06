import api from './api';
import API_ROUTES from './apiRoutes';

const communicationsService = {
  getCommunications: async (params) => {
    const response = await api.get(API_ROUTES.comunicados, { params });
    return response.data;
  },

  createCommunication: async (data) => {
    const response = await api.post(API_ROUTES.comunicados, data);
    return response.data;
  },

  publishCommunication: async (data) => {
    const response = await api.post(`${API_ROUTES.comunicados}/publish`, data);
    return response.data;
  },

  deleteCommunication: async (id) => {
    const response = await api.delete(`${API_ROUTES.comunicados}/${id}`);
    return response.data;
  },

  getVisitors: async (params) => {
    const response = await api.get(API_ROUTES.visitantes, { params });
    return response.data;
  },

  getSecurityLog: async (params) => {
    const response = await api.get(API_ROUTES.accesos, { params });
    return response.data;
  }
};

export default communicationsService;