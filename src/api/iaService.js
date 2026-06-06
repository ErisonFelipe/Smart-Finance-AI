import api from "./axios";

const iaService = {
  chat: async (message, history = []) => {
    const response = await api.post("/ia/chat", { message, history });
    return response.data;
  },

  categorize: async (description, amount) => {
    const response = await api.post("/ia/categorize", { description, amount });
    return response.data;
  },

  analyzeSpendings: async (params = {}) => {
    const response = await api.post("/ia/analyze-spendings", params);
    return response.data;
  },

  suggestions: async () => {
    const response = await api.get("/ia/suggestions");
    return response.data;
  },

  predictNextMonth: async () => {
    const response = await api.get("/ia/predict-next-month");
    return response.data;
  },

  summarizeMonth: async (month, year) => {
    const response = await api.get("/ia/summarize-month", {
      params: { month, year },
    });
    return response.data;
  },

  detectAnomalies: async () => {
    const response = await api.get("/ia/detect-anomalies");
    return response.data;
  },
};

export default iaService;