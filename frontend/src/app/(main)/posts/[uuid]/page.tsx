"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Post } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { postsApi } from "@/lib/api/posts";
import { getErrorMessage } from "@/lib/api/client";
import { formatDate } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/loading";
import { ErrorMessage } from "@/components/shared/error-message";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, User, Edit, Tag } from "lucide-react";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const uuid = params.uuid as string;

  const fetchPost = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await postsApi.getOne(uuid);
      setPost(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (uuid) {
      fetchPost();
    }
  }, [uuid]);

  const canEdit = post && (isAdmin || post.authorUuid === user?.uuid);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message={error} onRetry={fetchPost} />
        <div className="mt-4">
          <Button className="cursor-pointer" variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message="Post not found" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* back btn */}
      <Button variant="ghost" className="mb-6 cursor-pointer" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <article>
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {post.category && <Badge variant="secondary">{post.category.name}</Badge>}
            {post.status === "DRAFT" && <Badge variant="outline">Draft</Badge>}
          </div>

          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {post.author.name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(post.createdAt)}
              </span>
            </div>

            {canEdit && (
              <Button asChild size="sm">
                <Link href={`/dashboard/posts/${post.uuid}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Post
                </Link>
              </Button>
            )}
          </div>
        </header>

        {/* image */}
        {post.imageUrl && (
          <div className="relative h-100 w-full mb-8 rounded-lg overflow-hidden">
            <Image src={post.imageUrl} alt={post.title} fill className="object-contain" priority />
          </div>
        )}

        {/* content */}
        <Card>
          <CardContent className="prose prose-neutral dark:prose-invert max-w-none pt-2">
            <div className="whitespace-pre-wrap">{post.content}</div>
          </CardContent>
        </Card>

        {/* tags */}
        {post.tags.length > 0 && (
          <div className="mt-6 flex items-center gap-2 flex-wrap">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {post.tags.map((tag) => (
              <Badge key={tag.uuid} variant="outline">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
