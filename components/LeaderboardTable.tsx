"use client";

import React from "react";
import Link from "next/link";
import { Crown, ExternalLink, Zap, ArrowUp, ArrowDown, Sparkles, CheckCircle2 } from "lucide-react";
import { Project } from "@/lib/types";

interface LeaderboardTableProps {
  projects: Project[];
  onBoost: (project: Project) => void;
  onRecordClick: (slug: string) => void;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  projects,
  onBoost,
  onRecordClick,
}) => {
  if (projects.length === 0) {
    return (
      <div className="rounded-2xl bg-card/60 border border-border p-12 text-center">
        <Sparkles className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">No projects found</h3>
        <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
          Try a different search query or be the first to submit a project in this category!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card/50 border border-border/80 overflow-hidden shadow-xl backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-card/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3.5 pl-4 sm:pl-6 pr-2 w-16 sm:w-24 text-center">Rank</th>
              <th className="py-3.5 px-3 sm:px-4">Product / Directory Listing</th>
              <th className="py-3.5 px-3 sm:px-4 hidden md:table-cell">Category</th>
              <th className="py-3.5 px-3 sm:px-4 text-right">Total Bid</th>
              <th className="py-3.5 px-3 sm:px-4 text-right hidden sm:table-cell">Traffic</th>
              <th className="py-3.5 pl-3 pr-4 sm:pr-6 text-right w-24 sm:w-36">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-sm">
            {projects.map((project) => {
              const rank = project.current_rank;
              const prev = project.previous_rank;
              const isFirst = rank === 1;
              const isTop3 = rank <= 3;

              // Calculate movement delta
              let rankDelta: React.ReactNode = null;
              if (prev && prev !== 999 && prev !== rank) {
                if (rank < prev) {
                  rankDelta = (
                    <span className="flex items-center text-[10px] font-bold text-emerald-400">
                      <ArrowUp className="w-2.5 h-2.5" />
                      +{prev - rank}
                    </span>
                  );
                } else if (rank > prev) {
                  rankDelta = (
                    <span className="flex items-center text-[10px] font-bold text-rose-400">
                      <ArrowDown className="w-2.5 h-2.5" />
                      -{rank - prev}
                    </span>
                  );
                }
              } else if (prev === 999) {
                rankDelta = (
                  <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                    NEW
                  </span>
                );
              }

              return (
                <tr
                  key={project.id}
                  className={`group transition-all hover:bg-card-hover/90 ${
                    isFirst ? "bg-gold-500/5 hover:bg-gold-500/10" : ""
                  }`}
                >
                  {/* Rank Column */}
                  <td className="py-4 pl-4 sm:pl-6 pr-2 text-center align-middle">
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      {isFirst ? (
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gold-400 to-amber-600 flex items-center justify-center shadow-md shadow-gold-500/30 text-black font-black text-sm">
                          <Crown className="w-4 h-4 fill-black" />
                        </div>
                      ) : rank === 2 ? (
                        <div className="w-8 h-8 rounded-xl bg-slate-300 flex items-center justify-center text-slate-900 font-extrabold text-xs shadow-sm">
                          #2
                        </div>
                      ) : rank === 3 ? (
                        <div className="w-8 h-8 rounded-xl bg-amber-700/80 flex items-center justify-center text-amber-100 font-extrabold text-xs shadow-sm">
                          #3
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-card border border-border flex items-center justify-center text-slate-400 font-mono text-xs">
                          #{rank}
                        </div>
                      )}
                      {rankDelta}
                    </div>
                  </td>

                  {/* Project Info Column */}
                  <td className="py-4 px-3 sm:px-4 align-middle">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-card border border-border p-1.5 flex-shrink-0 flex items-center justify-center overflow-hidden group-hover:border-brand-500/40 transition-colors">
                        {project.favicon_url ? (
                          <img
                            src={project.favicon_url}
                            alt={project.title}
                            className="w-7 h-7 object-contain rounded"
                          />
                        ) : (
                          <Sparkles className="w-5 h-5 text-slate-500" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link
                            href={`/project/${project.slug}`}
                            className="font-bold text-white hover:text-brand-400 transition-colors truncate"
                          >
                            {project.title}
                          </Link>
                          {project.is_verified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          )}
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => onRecordClick(project.slug)}
                            className="text-slate-500 hover:text-slate-200 transition-colors p-0.5"
                            title="Visit website"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {project.tagline}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category Column */}
                  <td className="py-4 px-3 sm:px-4 hidden md:table-cell align-middle">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-card border border-border text-[11px] font-medium text-slate-300">
                      {project.category}
                    </span>
                  </td>

                  {/* Total Bid Amount */}
                  <td className="py-4 px-3 sm:px-4 text-right align-middle font-mono">
                    <span
                      className={`font-black text-sm sm:text-base ${
                        isFirst
                          ? "text-gold-400"
                          : isTop3
                          ? "text-brand-400"
                          : "text-slate-200"
                      }`}
                    >
                      ${project.total_amount_usd.toFixed(2)}
                    </span>
                  </td>

                  {/* Clicks / Traffic */}
                  <td className="py-4 px-3 sm:px-4 text-right hidden sm:table-cell align-middle text-xs font-mono text-slate-400">
                    {project.all_time_clicks.toLocaleString()} views
                  </td>

                  {/* Actions (Boost) */}
                  <td className="py-4 pl-3 pr-4 sm:pr-6 text-right align-middle">
                    <button
                      onClick={() => onBoost(project)}
                      className="px-3 py-1.5 rounded-lg bg-card border border-border hover:border-brand-500 hover:bg-brand-500/10 text-slate-200 hover:text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Zap className="w-3.5 h-3.5 text-brand-400" />
                      <span>Boost</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
