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
};

export default iaService;