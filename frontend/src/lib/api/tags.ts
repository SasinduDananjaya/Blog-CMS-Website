import { apiClient } from "./client";
import { Status, Tag } from "@/types";

export const tagsApi = {
  getAll: async (): Promise<Tag[]> => {
    const response = await apiClient.get("/tags");
    return response.data;
  },

  getOne: async (uuid: string): Promise<Tag> => {
    const response = await apiClient.get(`/tags/${uuid}`);
    return response.data;
  },

  create: async (name: string): Promise<Tag> => {
    const response = await apiClient.post("/tags", { name });
    return response.data;
  },

  update: async (uuid: string, name: string): Promise<Tag> => {
    const response = await apiClient.patch(`/tags/${uuid}`, { name });
    return response.data;
  },

  delete: async (uuid: string): Promise<void> => {
    await apiClient.delete(`/tags/${uuid}`);
  },

  changeStatus: async (uuid: string, newStatus: Status): Promise<Tag> => {
    const response = await apiClient.patch(`/tags/${uuid}/status`, { newStatus });
    return response.data;
  },
};
