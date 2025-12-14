"use client";

import { Category } from "@/types";
import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelect: (categoryUuid: string | null) => void;
}

export function CategoryFilter({ categories, selectedCategory, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button className="cursor-pointer" variant={selectedCategory === null ? "default" : "outline"} size="sm" onClick={() => onSelect(null)}>
        All
      </Button>
      {categories.map((category) => (
        <Button
          className="cursor-pointer"
          key={category.uuid}
          variant={selectedCategory === category.uuid ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(category.uuid)}
        >
          {category.name}
          {category._count && <span className="ml-1 text-xs opacity-70">({category._count.posts})</span>}
        </Button>
      ))}
    </div>
  );
}
