import api from "./axios";

const boletoService = {
  list: async (params = {}) => {
    const response = await api.get("/boletos", { params });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/boletos", data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/boletos/${id}`);
    return response.data;
  },
};

export default boletoService;