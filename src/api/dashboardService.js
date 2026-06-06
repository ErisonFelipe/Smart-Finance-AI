import api from "./axios";

const dashboardService = {
  summary: async (params = {}) => {
    const response = await api.get("/dashboard/summary", { params });
    return response.data;
  },

  monthlyEvolution: async (year) => {
    const response = await api.get("/dashboard/monthly-evolution", {
      params: { year },
    });
    return response.data;
  },

  categoryBreakdown: async (params = {}) => {
    const response = await api.get("/dashboard/category-breakdown", { params });
    return response.data;
  },

  upcomingPayments: async (days = 30) => {
    const response = await api.get("/dashboard/upcoming-payments", {
      params: { days },
    });
    return response.data;
  },
};

export default dashboardService;