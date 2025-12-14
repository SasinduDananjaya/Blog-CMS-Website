import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  categoryUuid: z.string().optional(),
  tagUuids: z.array(z.string()).optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
});

export type PostFormData = z.infer<typeof postSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
