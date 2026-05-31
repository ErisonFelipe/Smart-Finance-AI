import api from "./axios";

const debtService = {
  list: async (params = {}) => {
    const response = await api.get("/debts", { params });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/debts", data);
    return response.data;
  },
};

export default debtService;