import api from "./axios";

const transactionService = {
  list: async (params = {}) => {
    const response = await api.get("/transactions", { params });
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

  delete: async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  deleteAll: async () => {
  const response = await api.delete("/transactions/all");
  return response.data;
},

calendar: async (month, year) => {
  const response = await api.get("/transactions/calendar", { params: { month, year } });
  return response.data;
},
};

export default transactionService;