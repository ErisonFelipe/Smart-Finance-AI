import api from "./axios";

const categoryService = {
  list: async () => {
    const response = await api.get("/categories");
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/categories", data);
    return response.data;
  },
};

export default categoryService;