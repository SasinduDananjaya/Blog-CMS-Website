"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, FolderOpen, Tag, Home } from "lucide-react";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Posts", href: "/dashboard/posts", icon: FileText },
  { name: "Categories", href: "/dashboard/categories", icon: FolderOpen, adminOnly: true },
  { name: "Tags", href: "/dashboard/tags", icon: Tag, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const filteredNavigation = navigation.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className="hidden md:block w-64 border-r bg-muted/30 min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="pt-4">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dashboard</p>
        </div>

        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
