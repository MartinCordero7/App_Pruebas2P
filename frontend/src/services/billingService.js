import api from './api';

const billingService = {
  createBilling: async (data) => {
    const response = await api.post('/billing', data);
    return response.data;
  },

  generateMonthlyBilling: async (data) => {
    const response = await api.post('/billing/generate-monthly', data);
    return response.data;
  },

  getBilling: async (params) => {
    const response = await api.get('/billing', { params });
    return response.data;
  },

  recordPayment: async (data) => {
    const response = await api.post('/billing/payment', data);
    return response.data;
  },

  getDelinquentReport: async () => {
    const response = await api.get('/billing/delinquent-report');
    return response.data;
  },

  createPaymentAgreement: async (data) => {
    const response = await api.post('/billing/agreement', data);
    return response.data;
  },

  getPaymentAgreements: async (params) => {
    const response = await api.get('/billing/agreement/list', { params });
    return response.data;
  },

  calculateInterest: async (data) => {
    const response = await api.post('/billing/calculate-interest', data);
    return response.data;
  }
};

export default billingService;
