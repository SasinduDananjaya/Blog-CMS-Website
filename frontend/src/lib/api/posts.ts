import { apiClient } from "./client";
import { Post, PaginatedResponse, PostStatus } from "@/types";

export interface PostQueryParams {
  status?: PostStatus;
  categoryUuid?: string;
  tagUuid?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreatePostData {
  title: string;
  content: string;
  status?: PostStatus;
  categoryUuid?: string;
  tagUuids?: string[];
}

export interface UpdatePostData extends Partial<CreatePostData> {
  removeImage?: boolean;
}

export const postsApi = {
  getPublished: async (params?: PostQueryParams): Promise<PaginatedResponse<Post>> => {
    const response = await apiClient.get("/posts/published", { params });
    return response.data;
  },

  getAll: async (params?: PostQueryParams): Promise<PaginatedResponse<Post>> => {
    const response = await apiClient.get("/posts", { params });
    return response.data;
  },

  getMyPosts: async (params?: PostQueryParams): Promise<PaginatedResponse<Post>> => {
    const response = await apiClient.get("/posts/my-posts", { params });
    return response.data;
  },

  getOne: async (uuid: string): Promise<Post> => {
    const response = await apiClient.get(`/posts/${uuid}`);
    return response.data;
  },

  create: async (data: CreatePostData, image?: File): Promise<Post> => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("content", data.content);
    if (data.status) formData.append("status", data.status);
    if (data.categoryUuid) formData.append("categoryUuid", data.categoryUuid);
    if (data.tagUuids?.length) {
      formData.append("tagUuids", JSON.stringify(data.tagUuids));
    }
    if (image) formData.append("image", image);

    const response = await apiClient.post("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  update: async (uuid: string, data: UpdatePostData, image?: File): Promise<Post> => {
    const formData = new FormData();
    if (data.title) formData.append("title", data.title);
    if (data.content) formData.append("content", data.content);
    if (data.status) formData.append("status", data.status);
    if (data.categoryUuid !== undefined) {
      formData.append("categoryUuid", data.categoryUuid || "");
    }
    if (data.tagUuids !== undefined) {
      formData.append("tagUuids", JSON.stringify(data.tagUuids));
    }
    if (data.removeImage) formData.append("removeImage", "true");
    if (image) formData.append("image", image);

    const response = await apiClient.patch(`/posts/${uuid}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateStatus: async (uuid: string, status: PostStatus): Promise<Post> => {
    const response = await apiClient.patch(`/posts/${uuid}/status`, { status });
    return response.data;
  },

  delete: async (uuid: string): Promise<void> => {
    await apiClient.delete(`/posts/${uuid}`);
  },
};
