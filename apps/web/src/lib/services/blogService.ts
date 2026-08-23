import api from "../api";
import type { BlogDraft, BlogPost, BlogStatus } from "../blogTypes";

export type BlogListResponse = {
  data: BlogPost[];
  count: number;
  currentPage: number;
  totalPages: number;
  categories?: string[];
};

export const blogService = {
  listPublished: async (params?: { page?: number; limit?: number; category?: string; featured?: boolean; search?: string }) =>
    (await api.get<BlogListResponse>("/blog", { params })).data,
  getPublished: async (slug: string) =>
    (await api.get<{ data: BlogPost }>(`/blog/${encodeURIComponent(slug)}`)).data.data,
  listAdmin: async (params?: { page?: number; limit?: number; status?: BlogStatus | "all"; category?: string; search?: string }) =>
    (await api.get<BlogListResponse>("/admin/blog", { params })).data,
  getAdmin: async (id: string) =>
    (await api.get<{ data: BlogPost }>(`/admin/blog/${id}`)).data.data,
  create: async (post: BlogDraft) =>
    (await api.post<{ data: BlogPost; message: string }>("/admin/blog", post)).data,
  update: async (id: string, post: Partial<BlogDraft>) =>
    (await api.patch<{ data: BlogPost; message: string }>(`/admin/blog/${id}`, post)).data,
  archive: async (id: string) =>
    (await api.delete<{ data: BlogPost; message: string }>(`/admin/blog/${id}`)).data,
};
