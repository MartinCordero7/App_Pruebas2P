import api from './api';

const transactionsService = {
  createTransaction: async (data) => {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  getTransactions: async (params) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  getFinancialReport: async (params) => {
    const response = await api.get('/transactions/report/financial', { params });
    return response.data;
  },

  getCashFlowReport: async (params) => {
    const response = await api.get('/transactions/report/cash-flow', { params });
    return response.data;
  },

  generateBalanceSheet: async () => {
    const response = await api.get('/transactions/report/balance-sheet');
    return response.data;
  }
};

export default transactionsService;
