import api from './api';
import API_ROUTES from './apiRoutes';

const assembliesService = {
  getAssemblies: async (params) => {
    const response = await api.get(API_ROUTES.assemblies || '/assemblies', { params });
    return response.data;
  },

  createAssembly: async (data) => {
    const response = await api.post(API_ROUTES.assemblies || '/assemblies', data);
    return response.data;
  },

  deleteAssembly: async (id) => {
    const response = await api.delete(`${API_ROUTES.assemblies || '/assemblies'}/${id}`);
    return response.data;
  },

  getVotes: async (params) => {
    const response = await api.get(`${API_ROUTES.assemblies || '/assemblies'}/votes`, { params });
    return response.data;
  }
};

export default assembliesService;
