import api from "./axios";

const userService = {
  getProfile: async () => {
    const response = await api.get("/user/profile");
    return response.data;
  },

  updateProfile: async (formData) => {
    const response = await api.put("/user/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put("/user/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  updatePreferences: async (preferences) => {
    const response = await api.put("/user/preferences", preferences);
    return response.data;
  },

  getPreferences: async () => {
    const response = await api.get("/user/preferences");
    return response.data;
  },

  deleteAccount: async (password) => {
    const response = await api.delete("/user/account", {
      data: { password },
    });
    return response.data;
  },

  exportData: async () => {
    const response = await api.get("/user/export", {
      responseType: "blob",
    });
    return response.data;
  },
};

export default userService;