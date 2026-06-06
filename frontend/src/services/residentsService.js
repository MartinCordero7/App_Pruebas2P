import api from './api';

const residentsService = {
  createResident: async (data) => {
    const response = await api.post('/residents', data);
    return response.data;
  },

  getResidents: async (params) => {
    const response = await api.get('/residents', { params });
    return response.data;
  },

  getResidentById: async (id) => {
    const response = await api.get(`/residents/${id}`);
    return response.data;
  },

  updateResident: async (id, data) => {
    const response = await api.put(`/residents/${id}`, data);
    return response.data;
  },

  deleteResident: async (id) => {
    const response = await api.delete(`/residents/${id}`);
    return response.data;
  },

  getResidentBalance: async (residentId) => {
    const response = await api.get(`/residents/${residentId}/balance`);
    return response.data;
  }
};

export default residentsService;
