"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Image from "next/image";
import { Post, Category, Tag } from "@/types";
import { postsApi } from "@/lib/api/posts";
import { categoriesApi } from "@/lib/api/categories";
import { tagsApi } from "@/lib/api/tags";
import { postSchema, PostFormData } from "@/lib/validations/post";
import { getErrorMessage } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Upload, Loader2 } from "lucide-react";

interface PostFormProps {
  post?: Post;
  mode: "create" | "edit";
}

export function PostForm({ post, mode }: PostFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(post?.tags.map((t) => t.uuid) || []);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(post?.imageUrl || null);
  const [removeImage, setRemoveImage] = useState(false);

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post?.title || "",
      content: post?.content || "",
      status: post?.status || "DRAFT",
      categoryUuid: post?.categoryUuid || undefined,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, tagsData] = await Promise.all([categoriesApi.getAll(), tagsApi.getAll()]);
        setCategories(categoriesData);
        setTags(tagsData);
      } catch (error) {
        toast.error("Failed to load categories and tags");
      }
    };
    fetchData();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setRemoveImage(false);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    setRemoveImage(true);
  };

  const toggleTag = (tagUuid: string) => {
    setSelectedTags((prev) => (prev.includes(tagUuid) ? prev.filter((t) => t !== tagUuid) : [...prev, tagUuid]));
  };

  const onSubmit = async (data: PostFormData) => {
    setIsSubmitting(true);
    try {
      const postData = {
        ...data,
        tagUuids: selectedTags,
      };

      if (mode === "create") {
        await postsApi.create(postData, image || undefined);
        toast.success("Post created successfully");
      } else if (post) {
        await postsApi.update(post.uuid, { ...postData, removeImage }, image || undefined);
        toast.success("Post updated successfully");
      }
      router.push("/dashboard/posts");
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{mode === "create" ? "Create Post" : "Edit Post"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* post title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter post title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Textarea placeholder="Write your post content..." className="min-h-[200px] resize-y" maxLength={1000} {...field} />
                      <div className="absolute bottom-2 right-3 pointer-events-none">
                        <span className="text-xs text-muted-foreground bg-background px-1 rounded">{(field.value?.length || 0).toLocaleString()} / 1000</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* upload img */}
            <div className="space-y-2">
              <Label>Image</Label>
              {imagePreview ? (
                <div className="relative inline-block">
                  <Image src={imagePreview} alt="Preview" width={200} height={150} className="rounded-lg object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="cursor-pointer absolute -top-2 -right-2 h-6 w-6"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
                  <Label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Click to upload image</span>
                  </Label>
                </div>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* post category */}
              <FormField
                control={form.control}
                name="categoryUuid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.uuid} value={category.uuid}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* tags */}
            {tags.length > 0 && (
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.uuid}
                      variant={selectedTags.includes(tag.uuid) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag.uuid)}
                    >
                      {tag.name}
                      {selectedTags.includes(tag.uuid) && <X className="h-3 w-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button className="cursor-pointer" type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button className="cursor-pointer" type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {mode === "create" ? "Create Post" : "Update Post"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
