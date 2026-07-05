import api from './api';

const unitsService = {
  createUnit: async (data) => {
    const response = await api.post('/units', data);
    return response.data;
  },

  getUnits: async (params) => {
    const response = await api.get('/units', { params });
    return response.data;
  },

  getUnitById: async (id) => {
    const response = await api.get(`/units/${id}`);
    return response.data;
  },

  updateUnit: async (id, data) => {
    const response = await api.put(`/units/${id}`, data);
    return response.data;
  },

  deleteUnit: async (id) => {
    const response = await api.delete(`/units/${id}`);
    return response.data;
  },

  // Parqueaderos
  assignParkingSpace: async (data) => {
    const response = await api.post('/units/parking', data);
    return response.data;
  },

  getParkingSpaces: async () => {
    const response = await api.get('/units/parking/list');
    return response.data;
  },

  // Bodegas
  assignStorageRoom: async (data) => {
    const response = await api.post('/units/storage', data);
    return response.data;
  },

  getStorageRooms: async () => {
    const response = await api.get('/units/storage/list');
    return response.data;
  }
};

export default unitsService;
