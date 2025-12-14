import Link from "next/link";
import Image from "next/image";
import { Post } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, truncateText } from "@/lib/utils";
import { Calendar, User } from "lucide-react";

interface PostCardProps {
  post: Post;
  showStatus?: boolean;
}

export function PostCard({ post, showStatus = false }: PostCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/posts/${post.uuid}`}>
        {post.imageUrl ? (
          <div className="relative h-48 w-full">
            <Image src={post.imageUrl} alt={post.title} fill className="object-cover" />
          </div>
        ) : (
          <div className="h-48 w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-4xl">📝</span>
          </div>
        )}
      </Link>

      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {post.category && <Badge variant="secondary">{post.category.name}</Badge>}
          {showStatus && <Badge variant={post.status === "PUBLISHED" ? "default" : "outline"}>{post.status}</Badge>}
        </div>
        <Link href={`/posts/${post.uuid}`} className="hover:underline">
          <h3 className="font-semibold text-lg line-clamp-2">{post.title}</h3>
        </Link>
      </CardHeader>

      <CardContent>
        <p className="text-muted-foreground text-sm line-clamp-3">{truncateText(post.content, 150)}</p>
      </CardContent>

      <CardFooter className="text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {post.author.name}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(post.createdAt)}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
