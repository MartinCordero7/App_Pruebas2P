import api from './api';

const maintenanceService = {
  createRequest: async (data) => {
    const response = await api.post('/maintenance', data);
    return response.data;
  },

  getRequests: async (params) => {
    const response = await api.get('/maintenance', { params });
    return response.data;
  },

  getRequestById: async (id) => {
    const response = await api.get(`/maintenance/${id}`);
    return response.data;
  },

  updateRequest: async (id, data) => {
    const response = await api.put(`/maintenance/${id}`, data);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/maintenance/${id}/status`, { status });
    return response.data;
  },

  assignEmployee: async (id, employeeId) => {
    const response = await api.patch(`/maintenance/${id}/assign`, { employeeId });
    return response.data;
  },

  getSchedule: async () => {
    const response = await api.get('/maintenance/schedule');
    return response.data;
  }
};

export default maintenanceService;
