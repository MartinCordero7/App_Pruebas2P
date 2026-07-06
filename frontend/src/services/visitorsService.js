import api from './api';
import API_ROUTES from './apiRoutes';

const visitorsService = {
  getVisitors: async (params) => {
    const response = await api.get(API_ROUTES.visitantes, { params });
    return response.data;
  },

  createVisitor: async (data) => {
    const response = await api.post(API_ROUTES.visitantes, data);
    return response.data;
  },

  updateVisitor: async (id, data) => {
    const response = await api.put(`${API_ROUTES.visitantes}/${id}`, data);
    return response.data;
  },

  checkOutVisitor: async (id) => {
    const response = await api.patch(`${API_ROUTES.visitantes}/${id}/checkout`);
    return response.data;
  },

  deleteVisitor: async (id) => {
    const response = await api.delete(`${API_ROUTES.visitantes}/${id}`);
    return response.data;
  },

  getPreauthorizedVisitors: async (params) => {
    const response = await api.get(API_ROUTES.visitantesPreautorizados, { params });
    return response.data;
  }
};

export default visitorsService;