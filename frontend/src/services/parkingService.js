import api from './api';

const parkingService = {
  assignParkingSpace: async (data) => {
    const response = await api.post('/units/parking', data);
    return response.data;
  },

  getParkingSpaces: async () => {
    const response = await api.get('/units/parking/list');
    return response.data;
  }
};

export default parkingService;
