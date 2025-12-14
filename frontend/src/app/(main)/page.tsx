"use client";

import { useState, useEffect } from "react";
import { Post, Category } from "@/types";
import { postsApi } from "@/lib/api/posts";
import { categoriesApi } from "@/lib/api/categories";
import { getErrorMessage } from "@/lib/api/client";
import { PostList } from "@/components/posts/post-list";
import { RecentPosts } from "@/components/posts/recent-posts";
import { CategoryFilter } from "@/components/categories/category-filter";
import { Pagination } from "@/components/shared/pagination";
import { PostListSkeleton } from "@/components/shared/loading";
import { ErrorMessage } from "@/components/shared/error-message";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await postsApi.getPublished({
        page,
        limit: 9,
        categoryUuid: selectedCategory || undefined,
        search: search || undefined,
      });
      setPosts(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentPosts = async () => {
    try {
      const response = await postsApi.getPublished({
        page: 1,
        limit: 3,
        categoryUuid: selectedCategory || undefined,
      });
      setRecentPosts(response.data);
    } catch (err) {
      console.error("Failed to fetch recent posts");
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [page, selectedCategory, search]);

  useEffect(() => {
    fetchRecentPosts();
  }, [selectedCategory]);

  const handleCategoryChange = (categoryUuid: string | null) => {
    setSelectedCategory(categoryUuid);
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to BlogCMS</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Discover amazing articles, tutorials, and insights from our community.</p>
      </section>

      {/* search */}
      <section className="mb-8">
        <form onSubmit={handleSearch} className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="text" placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </form>
      </section>

      {/* category filter */}
      <section className="mb-8">
        <CategoryFilter categories={categories} selectedCategory={selectedCategory} onSelect={handleCategoryChange} />
      </section>

      {/* posts */}
      <section>
        {isLoading ? (
          <PostListSkeleton count={9} />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchPosts} />
        ) : (
          <>
            <PostList posts={posts} />
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </section>

      {/* recent posts */}
      {!isLoading && !error && <RecentPosts posts={recentPosts} title={selectedCategory ? "More from this Category" : "Recent Posts"} />}
    </div>
  );
}
