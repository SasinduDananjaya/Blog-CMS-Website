"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Post } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { postsApi } from "@/lib/api/posts";
import { getErrorMessage } from "@/lib/api/client";
import { PostForm } from "@/components/posts/post-form";
import { LoadingSpinner } from "@/components/shared/loading";
import { ErrorMessage } from "@/components/shared/error-message";

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const uuid = params.uuid as string;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await postsApi.getOne(uuid);

        // Check permission
        if (!isAdmin && data.authorUuid !== user?.uuid) {
          router.push("/dashboard/posts");
          return;
        }

        setPost(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    if (uuid) {
      fetchPost();
    }
  }, [uuid, user, isAdmin, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!post) {
    return <ErrorMessage message="Post not found" />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PostForm post={post} mode="edit" />
    </div>
  );
}
