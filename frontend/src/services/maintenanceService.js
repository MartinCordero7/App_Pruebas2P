import api from './api';
import API_ROUTES from './apiRoutes';

const maintenanceService = {
  createRequest: async (data) => {
    const response = await api.post(API_ROUTES.tickets, data);
    return response.data;
  },

  getRequests: async (params) => {
    const response = await api.get(API_ROUTES.tickets, { params });
    return response.data;
  },

  getRequestById: async (id) => {
    const response = await api.get(`${API_ROUTES.tickets}/${id}`);
    return response.data;
  },

  updateRequest: async (id, data) => {
    const response = await api.put(`${API_ROUTES.tickets}/${id}`, data);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`${API_ROUTES.tickets}/${id}/status`, { status });
    return response.data;
  },

  assignEmployee: async (id, employeeId) => {
    const response = await api.patch(`${API_ROUTES.tickets}/${id}/assign`, { employeeId });
    return response.data;
  },

  getSchedule: async () => {
    const response = await api.get(`${API_ROUTES.tickets}/schedule`);
    return response.data;
  }
};

export default maintenanceService;
