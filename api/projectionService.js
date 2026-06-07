import api from "./axios";

const projectionService = {
  get: async () => {
    const response = await api.get("/projection");
    return response.data;
  },
};

export default projectionService;