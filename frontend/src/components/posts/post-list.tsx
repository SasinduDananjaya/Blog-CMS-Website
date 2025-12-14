"use client";

import { Post } from "@/types";
import { PostCard } from "./post-card";

interface PostListProps {
  posts: Post[];
  showStatus?: boolean;
}

export function PostList({ posts, showStatus = false }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No posts found.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.uuid} post={post} showStatus={showStatus} />
      ))}
    </div>
  );
}
