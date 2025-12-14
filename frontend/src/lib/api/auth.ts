import { apiClient } from "./client";
import { AuthResponse, User } from "@/types";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/register", data);
    return response.data;
  },

  getMe: async (): Promise<{ user: User }> => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },
};
