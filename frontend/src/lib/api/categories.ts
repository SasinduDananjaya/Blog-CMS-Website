import { apiClient } from "./client";
import { Category, Status } from "@/types";

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get("/post-categories");
    return response.data;
  },

  getOne: async (uuid: string, includePosts = false): Promise<Category> => {
    const response = await apiClient.get(`/post-categories/${uuid}`, {
      params: { includePosts },
    });
    return response.data;
  },

  create: async (name: string): Promise<Category> => {
    const response = await apiClient.post("/post-categories", { name });
    return response.data;
  },

  update: async (uuid: string, name: string): Promise<Category> => {
    const response = await apiClient.patch(`/post-categories/${uuid}`, { name });
    return response.data;
  },

  delete: async (uuid: string): Promise<void> => {
    await apiClient.delete(`/post-categories/${uuid}`);
  },

  changeStatus: async (uuid: string, newStatus: Status): Promise<Category> => {
    const response = await apiClient.patch(`/post-categories/${uuid}/status`, { newStatus });
    return response.data;
  },
};
