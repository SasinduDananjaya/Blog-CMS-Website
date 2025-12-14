export type UserRole = "ADMIN" | "USER";
export type PostStatus = "DRAFT" | "PUBLISHED";

//user types
export interface User {
  id: number;
  uuid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

//tag types
export interface Tag {
  id: number;
  uuid: string;
  name: string;
  createdAt: string;
  _count?: {
    postTags: number;
  };
}

// category type
export interface Category {
  id: number;
  uuid: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    uuid: string;
    name: string;
  };
  _count?: {
    posts: number;
  };
}

//post type
export interface Post {
  id: number;
  uuid: string;
  title: string;
  content: string;
  imageUrl: string | null;
  status: PostStatus;
  authorUuid: string;
  categoryUuid: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    uuid: string;
    name: string;
    email?: string;
  };
  category: Category | null;
  tags: Tag[];
}

//pagination
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

export interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalCategories: number;
  totalTags: number;
}
