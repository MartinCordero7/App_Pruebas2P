import api from './api';
import API_ROUTES from './apiRoutes';

const budgetService = {
  getBudgetOverview: async (params) => {
    const response = await api.get(API_ROUTES.dashboard.budget, { params });
    return response.data;
  },

  getCuotas: async (params) => {
    const response = await api.get(API_ROUTES.cuotas, { params });
    return response.data;
  },

  getPagos: async (params) => {
    const response = await api.get(API_ROUTES.pagos, { params });
    return response.data;
  },

  getMultas: async (params) => {
    const response = await api.get(API_ROUTES.multas, { params });
    return response.data;
  }
};

export default budgetService;