import api from './api';

const maintenanceService = {
  createRequest: async (data) => {
    const response = await api.post('/tickets', data);
    return response.data;
  },

  getRequests: async (params) => {
    const response = await api.get('/tickets', { params });
    return response.data;
  },

  getRequestById: async (id) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  updateRequest: async (id, data) => {
    const response = await api.put(`/tickets/${id}`, data);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/tickets/${id}/status`, { status });
    return response.data;
  },

  assignEmployee: async (id, employeeId) => {
    const response = await api.patch(`/tickets/${id}/assign`, { employeeId });
    return response.data;
  },

  getSchedule: async () => {
    const response = await api.get('/tickets/schedule');
    return response.data;
  }
};

export default maintenanceService;
