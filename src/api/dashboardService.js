import api from "./axios";

const dashboardService = {
  summary: async () => {
    const response = await api.get("/dashboard/summary");
    return response.data;
  },
};

export default dashboardService;