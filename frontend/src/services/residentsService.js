import api from './api';
import API_ROUTES from './apiRoutes';

const residentsService = {
  createResident: async (data) => {
    const response = await api.post(API_ROUTES.residentes, data);
    return response.data;
  },

  getResidents: async (params) => {
    const response = await api.get(API_ROUTES.residentes, { params });
    return response.data;
  },

  getResidentById: async (id) => {
    const response = await api.get(`${API_ROUTES.residentes}/${id}`);
    return response.data;
  },

  updateResident: async (id, data) => {
    const response = await api.put(`${API_ROUTES.residentes}/${id}`, data);
    return response.data;
  },

  deleteResident: async (id) => {
    const response = await api.delete(`${API_ROUTES.residentes}/${id}`);
    return response.data;
  },

  getResidentBalance: async (residentId) => {
    const response = await api.get(`${API_ROUTES.residentes}/${residentId}/balance`);
    return response.data;
  }
};

export default residentsService;
