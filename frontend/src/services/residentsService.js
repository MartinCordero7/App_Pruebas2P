import api from './api';

const residentsService = {
  createResident: async (data) => {
    const response = await api.post('/residentes', data);
    return response.data;
  },

  getResidents: async (params) => {
    const response = await api.get('/residentes', { params });
    return response.data;
  },

  getResidentById: async (id) => {
    const response = await api.get(`/residentes/${id}`);
    return response.data;
  },

  updateResident: async (id, data) => {
    const response = await api.put(`/residentes/${id}`, data);
    return response.data;
  },

  deleteResident: async (id) => {
    const response = await api.delete(`/residentes/${id}`);
    return response.data;
  },

  getResidentBalance: async (residentId) => {
    const response = await api.get(`/residentes/${residentId}/balance`);
    return response.data;
  }
};

export default residentsService;
