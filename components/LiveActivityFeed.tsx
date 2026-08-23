"use client";

import React from "react";
import Link from "next/link";
import { Crown, Zap, Sparkles, TrendingUp, Clock, Activity } from "lucide-react";
import { ActivityEvent } from "@/lib/types";

interface LiveActivityFeedProps {
  activities: ActivityEvent[];
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({ activities }) => {
  return (
    <div className="rounded-2xl bg-card/60 border border-border p-5 shadow-lg backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" />
            Live Bidding Stream
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">Real-time</span>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {activities.slice(0, 6).map((act) => {
          return (
            <div
              key={act.id}
              className="flex items-start gap-3 text-xs p-2.5 rounded-xl bg-card-hover/40 border border-border/50 hover:border-slate-600 transition-colors"
            >
              {/* Icon */}
              <div className="p-1.5 rounded-lg bg-card border border-border flex-shrink-0 mt-0.5">
                {act.type === "outbid_crown" ? (
                  <Crown className="w-3.5 h-3.5 text-gold-400" />
                ) : act.type === "rank_jump" ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                ) : act.type === "new_project" ? (
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-brand-400" />
                )}
              </div>

              {/* Message */}
              <div className="flex-1 min-w-0">
                <div className="text-slate-300">
                  <Link
                    href={`/project/${act.project_slug}`}
                    className="font-bold text-white hover:text-gold-400 transition-colors inline"
                  >
                    {act.project_title}
                  </Link>{" "}
                  {act.type === "outbid_crown" ? (
                    <span>
                      claimed <span className="text-gold-400 font-bold">#1 Crown</span> from {act.outbid_project_title}!
                    </span>
                  ) : act.type === "rank_jump" ? (
                    <span>
                      jumped to <span className="text-emerald-400 font-bold">#{act.new_rank}</span> (+${act.amount_usd})
                    </span>
                  ) : act.type === "new_project" ? (
                    <span>
                      launched on the leaderboard at <span className="text-indigo-400 font-bold">#{act.new_rank}</span>
                    </span>
                  ) : (
                    <span>
                      boosted +<span className="text-brand-400 font-bold">${act.amount_usd}</span> to rank #{act.new_rank}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {act.timestamp}
                  </span>
                  <span>•</span>
                  <span className="text-slate-400 font-bold">+${act.amount_usd.toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
