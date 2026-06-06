import api from "./axios";

const debtService = {
  list: async (params = {}) => {
    const response = await api.get("/debts", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/debts/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/debts", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/debts/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/debts/${id}`);
    return response.data;
  },

  payInstallment: async (installmentId, data = {}) => {
    const response = await api.put(`/debts/installment/${installmentId}`, {
      paid: true,
      paidAt: new Date().toISOString(),
      ...data,
    });
    return response.data;
  },

  undoInstallment: async (installmentId) => {
    const response = await api.put(`/debts/installment/${installmentId}`, {
      paid: false,
      paidAt: null,
    });
    return response.data;
  },

  getInstallments: async (debtId) => {
    const response = await api.get(`/debts/${debtId}/installments`);
    return response.data;
  },
};

export default debtService;