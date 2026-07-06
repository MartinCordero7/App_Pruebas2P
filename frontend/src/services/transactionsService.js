import api from './api';
import API_ROUTES from './apiRoutes';

const transactionsService = {
  createTransaction: async (data) => {
    const response = await api.post(API_ROUTES.pagos, data);
    return response.data;
  },

  getTransactions: async (params) => {
    const response = await api.get(API_ROUTES.pagos, { params });
    return response.data;
  },

  getFinancialReport: async (params) => {
    const response = await api.get(API_ROUTES.dashboard.financial, { params });
    return response.data;
  },

  getCashFlowReport: async (params) => {
    const response = await api.get(API_ROUTES.dashboard.cashFlow, { params });
    return response.data;
  },

  generateBalanceSheet: async () => {
    const response = await api.get(API_ROUTES.dashboard.balanceSheet);
    return response.data;
  }
};

export default transactionsService;
