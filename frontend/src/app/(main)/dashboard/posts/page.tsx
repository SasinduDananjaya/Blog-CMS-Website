"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Post, PostStatus } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { postsApi } from "@/lib/api/posts";
import { getErrorMessage } from "@/lib/api/client";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pagination } from "@/components/shared/pagination";
import { LoadingSpinner } from "@/components/shared/loading";
import { Plus, MoreHorizontal, Edit, Trash, Eye, EyeOff } from "lucide-react";

export default function PostsManagementPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PostStatus | "ALL">("ALL");
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        ...(statusFilter !== "ALL" && { status: statusFilter }),
      };

      const response = isAdmin ? await postsApi.getAll(params) : await postsApi.getMyPosts(params);

      setPosts(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, statusFilter, isAdmin]);

  const handleStatusChange = async (postUuid: string, status: PostStatus) => {
    try {
      await postsApi.updateStatus(postUuid, status);
      toast.success(`Post ${status === "PUBLISHED" ? "published" : "unpublished"}`);
      fetchPosts();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!deletePostId) return;
    setIsDeleting(true);
    try {
      await postsApi.delete(deletePostId);
      toast.success("Post deleted successfully");
      fetchPosts();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
      setDeletePostId(null);
    }
  };

  const canModifyPost = (post: Post) => {
    return isAdmin || post.authorUuid === user?.uuid;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="text-muted-foreground">{isAdmin ? "Manage all posts" : "Manage your posts"}</p>
        </div>
        <Button asChild className="cursor-pointer">
          <Link href="/dashboard/posts/new">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Link>
        </Button>
      </div>

      {/* post filters */}
      <div className="flex items-center gap-4">
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as PostStatus | "ALL");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* posts table */}
      {isLoading ? (
        <LoadingSpinner />
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No posts found</p>
          <Button asChild>
            <Link href="/dashboard/posts/new">Create your first post</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.uuid}>
                    <TableCell className="font-medium max-w-xs truncate">{post.title}</TableCell>
                    <TableCell>{post.author.name}</TableCell>
                    <TableCell>
                      {post.category ? <Badge variant="secondary">{post.category.name}</Badge> : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={post.status === "PUBLISHED" ? "default" : "outline"}>{post.status}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(post.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link className="cursor-pointer" href={`/posts/${post.uuid}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          {canModifyPost(post) && (
                            <>
                              <DropdownMenuItem asChild>
                                <Link className="cursor-pointer" href={`/dashboard/posts/${post.uuid}/edit`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(post.uuid, post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED")}>
                                {post.status === "PUBLISHED" ? (
                                  <>
                                    <div className="cursor-pointer flex">
                                      <EyeOff className="h-4 w-4 mr-2" />
                                      <span>Unpublish</span>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="cursor-pointer flex">
                                      <Eye className="h-4 w-4 mr-2" />
                                      <span>Publish</span>
                                    </div>
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => setDeletePostId(post.uuid)}>
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {/* delete post confirmation */}
      <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this post? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="cursor-pointer bg-red-600 hover:bg-red-700">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
