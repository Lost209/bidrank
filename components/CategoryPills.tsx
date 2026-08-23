"use client";

import React from "react";
import { Search, Sparkles } from "lucide-react";
import { Category } from "@/lib/types";

const CATEGORIES: ("All" | Category)[] = [
  "All",
  "AI & ML",
  "Developer Tools",
  "SaaS",
  "Productivity",
  "Design & Creative",
  "Marketing & SEO",
  "Finance & Crypto",
  "Mobile & Apps",
];

interface CategoryPillsProps {
  activeCategory: "All" | Category;
  onSelectCategory: (cat: "All" | Category) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalCount: number;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  totalCount,
}) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Header */}
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Live Leaderboard</span>
            <span className="text-xs font-mono font-semibold bg-card px-2 py-0.5 rounded-full border border-border text-slate-400">
              {totalCount} Apps Ranked
            </span>
          </h2>
        </div>

        {/* Live Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects, tags, founders..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-card/90 border border-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm text-white placeholder-slate-500 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Scrollable Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25 border border-brand-400"
                  : "bg-card/70 hover:bg-card border border-border text-slate-400 hover:text-slate-200"
              }`}
            >
              {cat === "All" && <Sparkles className="w-3 h-3" />}
              <span>{cat}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
