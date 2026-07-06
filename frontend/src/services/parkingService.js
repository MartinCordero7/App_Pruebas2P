import api from './api';
import API_ROUTES from './apiRoutes';

const parkingService = {
  assignParkingSpace: async (data) => {
    const response = await api.post(API_ROUTES.parqueaderos, data);
    return response.data;
  },

  getParkingSpaces: async () => {
    const response = await api.get(API_ROUTES.parqueaderos);
    return response.data;
  },

  deleteParkingSpace: async (id) => {
    const response = await api.delete(`${API_ROUTES.parqueaderos}/${id}`);
    return response.data;
  }
};

export default parkingService;
