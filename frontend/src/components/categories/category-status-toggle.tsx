"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Category, Status } from "@/types";
import { cn } from "@/lib/utils";

interface CategoryStatusToggleProps {
  category: Category;
  onStatusChange: (uuid: string, newStatus: Status) => Promise<void>;
}

export function CategoryStatusToggle({ category, onStatusChange }: CategoryStatusToggleProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isActive = category.newStatus === "ACTIVE";

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      await onStatusChange(category.uuid, checked ? "ACTIVE" : "INACTIVE");
    } catch (error) {
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {isUpdating ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <Switch checked={isActive} onCheckedChange={handleToggle} disabled={isUpdating} className="cursor-pointer data-[state=checked]:bg-green-400" />
      )}
      <Badge
        variant="outline"
        className={cn("text-xs font-medium", isActive ? "border-green-400 bg-green-50 text-green-600" : "border-gray-300 bg-gray-50 text-gray-600")}
      >
        {category.newStatus}
      </Badge>
    </div>
  );
}
