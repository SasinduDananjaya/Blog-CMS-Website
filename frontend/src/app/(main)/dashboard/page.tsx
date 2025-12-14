"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { postsApi } from "@/lib/api/posts";
import { categoriesApi } from "@/lib/api/categories";
import { tagsApi } from "@/lib/api/tags";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FolderOpen, Tag, Eye } from "lucide-react";

interface Stats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalCategories: number;
  totalTags: number;
}

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalCategories: 0,
    totalTags: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const [myPosts, publishedPosts, categories, tags] = await Promise.all([
          postsApi.getMyPosts({ limit: 100 }),
          postsApi.getMyPosts({ status: "PUBLISHED", limit: 100 }),
          categoriesApi.getAll(),
          tagsApi.getAll(),
        ]);

        setStats({
          totalPosts: myPosts.meta.total,
          publishedPosts: publishedPosts.meta.total,
          draftPosts: myPosts.meta.total - publishedPosts.meta.total,
          totalCategories: categories.length,
          totalTags: tags.length,
        });
      } catch (error) {
        console.error("Failed to fetch stats");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Posts",
      value: stats.totalPosts,
      icon: FileText,
      color: "text-blue-500",
    },
    {
      title: "Published",
      value: stats.publishedPosts,
      icon: Eye,
      color: "text-green-500",
    },
    {
      title: "Drafts",
      value: stats.draftPosts,
      icon: FileText,
      color: "text-yellow-500",
    },
    {
      title: "Categories",
      value: stats.totalCategories,
      icon: FolderOpen,
      color: "text-purple-500",
      adminOnly: true,
    },
    {
      title: "Tags",
      value: stats.totalTags,
      icon: Tag,
      color: "text-pink-500",
      adminOnly: true,
    },
  ];

  const visibleCards = statCards.filter((card) => !card.adminOnly || isAdmin);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {visibleCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? <div className="h-8 w-16 animate-pulse rounded bg-muted" /> : stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
