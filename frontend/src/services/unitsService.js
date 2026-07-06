import api from './api';
import API_ROUTES from './apiRoutes';

const unitsService = {
  createUnit: async (data) => {
    const response = await api.post(API_ROUTES.unidades, data);
    return response.data;
  },

  getUnits: async (params) => {
    const response = await api.get(API_ROUTES.unidades, { params });
    return response.data;
  },

  getUnitById: async (id) => {
    const response = await api.get(`${API_ROUTES.unidades}/${id}`);
    return response.data;
  },

  updateUnit: async (id, data) => {
    const response = await api.put(`${API_ROUTES.unidades}/${id}`, data);
    return response.data;
  },

  deleteUnit: async (id) => {
    const response = await api.delete(`${API_ROUTES.unidades}/${id}`);
    return response.data;
  },

  // Parqueaderos
  assignParkingSpace: async (data) => {
    const response = await api.post(`${API_ROUTES.unidades}/parqueaderos`, data);
    return response.data;
  },

  getParkingSpaces: async () => {
    const response = await api.get(`${API_ROUTES.unidades}/parqueaderos`);
    return response.data;
  },

  // Bodegas
  assignStorageRoom: async (data) => {
    const response = await api.post(`${API_ROUTES.unidades}/bodegas`, data);
    return response.data;
  },

  getStorageRooms: async () => {
    const response = await api.get(`${API_ROUTES.unidades}/bodegas`);
    return response.data;
  }
};

export default unitsService;
