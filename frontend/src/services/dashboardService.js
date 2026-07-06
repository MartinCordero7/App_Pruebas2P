import api from './api';
import API_ROUTES from './apiRoutes';

const dashboardService = {
  getSummary: async () => {
    const response = await api.get(API_ROUTES.dashboard.summary);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get(API_ROUTES.dashboard.stats);
    return response.data;
  },

  getBudgetOverview: async () => {
    const response = await api.get(API_ROUTES.dashboard.budget);
    return response.data;
  },

  getFinancialSummary: async () => {
    const response = await api.get(API_ROUTES.dashboard.financial);
    return response.data;
  },

  getCashFlow: async () => {
    const response = await api.get(API_ROUTES.dashboard.cashFlow);
    return response.data;
  },

  getBalanceSheet: async () => {
    const response = await api.get(API_ROUTES.dashboard.balanceSheet);
    return response.data;
  }
};

export default dashboardService;