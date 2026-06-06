import api from "./axios";

const transactionService = {
  list: async (params = {}) => {
    const response = await api.get("/transactions", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/transactions", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },

  togglePaid: async (id, paid) => {
    return transactionService.update(id, {
      paid,
      paidAt: paid ? new Date().toISOString() : null,
    });
  },

  delete: async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  deleteAll: async () => {
    const response = await api.delete("/transactions/all");
    return response.data;
  },

  calendar: async (month, year) => {
    const response = await api.get("/transactions/calendar", {
      params: { month, year },
    });
    return response.data;
  },

  summary: async (params = {}) => {
    const response = await api.get("/transactions/summary", { params });
    return response.data;
  },

  import: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/transactions/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};

export default transactionService;