import { Post } from "@/types";
import { PostCard } from "./post-card";

interface RecentPostsProps {
  posts: Post[];
  title?: string;
}

export function RecentPosts({ posts, title = "Recent Posts" }: RecentPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.slice(0, 3).map((post) => (
          <PostCard key={post.uuid} post={post} />
        ))}
      </div>
    </section>
  );
}
