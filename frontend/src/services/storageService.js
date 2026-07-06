import api from './api';
import API_ROUTES from './apiRoutes';

const storageService = {
  assignStorageRoom: async (data) => {
    const response = await api.post(API_ROUTES.areasComunes, data);
    return response.data;
  },

  getStorageRooms: async () => {
    const response = await api.get(API_ROUTES.areasComunes);
    return response.data;
  },

  deleteStorageRoom: async (id) => {
    const response = await api.delete(`${API_ROUTES.areasComunes}/${id}`);
    return response.data;
  }
};

export default storageService;
