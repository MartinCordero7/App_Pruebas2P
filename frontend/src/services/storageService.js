import api from './api';

const storageService = {
  assignStorageRoom: async (data) => {
    const response = await api.post('/units/storage', data);
    return response.data;
  },

  getStorageRooms: async () => {
    const response = await api.get('/units/storage/list');
    return response.data;
  }
};

export default storageService;
