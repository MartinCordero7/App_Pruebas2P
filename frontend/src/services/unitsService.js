import api from './api';

const unitsService = {
  createUnit: async (data) => {
    const response = await api.post('/unidades', data);
    return response.data;
  },

  getUnits: async (params) => {
    const response = await api.get('/unidades', { params });
    return response.data;
  },

  getUnitById: async (id) => {
    const response = await api.get(`/unidades/${id}`);
    return response.data;
  },

  updateUnit: async (id, data) => {
    const response = await api.put(`/unidades/${id}`, data);
    return response.data;
  },

  deleteUnit: async (id) => {
    const response = await api.delete(`/unidades/${id}`);
    return response.data;
  },

  // Parqueaderos
  assignParkingSpace: async (data) => {
    const response = await api.post('/unidades/parking', data);
    return response.data;
  },

  getParkingSpaces: async () => {
    const response = await api.get('/unidades/parking/list');
    return response.data;
  },

  // Bodegas
  assignStorageRoom: async (data) => {
    const response = await api.post('/unidades/storage', data);
    return response.data;
  },

  getStorageRooms: async () => {
    const response = await api.get('/unidades/storage/list');
    return response.data;
  }
};

export default unitsService;
