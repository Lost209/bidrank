"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Crown, ExternalLink, Zap, Eye, CheckCircle2, ArrowUpRight } from "lucide-react";
import { Project } from "@/lib/types";

interface HeroSpotlightProps {
  topProject: Project | undefined;
  minBidToOvertake: number;
  onOvertake: (project: Project, requiredAmount: number) => void;
  onRecordClick: (slug: string) => void;
}

export const HeroSpotlight: React.FC<HeroSpotlightProps> = ({
  topProject,
  minBidToOvertake,
  onOvertake,
  onRecordClick,
}) => {
  if (!topProject) return null;

  return (
    <div className="relative mb-10">
      {/* Ambient background glow */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-gold-500/30 via-amber-500/20 to-gold-600/30 rounded-3xl blur-xl opacity-75 animate-pulse-glow" />

      {/* Main card */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#161208] via-[#0F111A] to-[#0D0E16] border-2 border-gold-500/60 p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Decorative corner watermark */}
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Crown className="w-64 h-64 text-gold-400" />
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          {/* Left: Project Details & Rank Badge */}
          <div className="flex-1 space-y-4">
            {/* Spotlight Banner Header */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/40 text-xs font-black tracking-wider uppercase shadow-sm">
                <Crown className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
                #1 King of the Hill
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-card border border-border text-[11px] font-semibold text-slate-300">
                {topProject.category}
              </span>
              {topProject.is_verified && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified Dofollow
                </span>
              )}
            </div>

            {/* Title & Tagline */}
            <div className="flex items-start gap-4">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-black/50 border border-gold-500/40 p-2 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-inner">
                {topProject.favicon_url ? (
                  <img
                    src={topProject.favicon_url}
                    alt={topProject.title}
                    className="w-10 h-10 object-contain rounded"
                  />
                ) : (
                  <Crown className="w-8 h-8 text-gold-400" />
                )}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Link
                    href={`/project/${topProject.slug}`}
                    className="hover:text-gold-400 transition-colors"
                  >
                    {topProject.title}
                  </Link>
                  <a
                    href={topProject.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onRecordClick(topProject.slug)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all inline-flex"
                    title="Visit Official Website (DoFollow)"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </h1>
                <p className="text-sm sm:text-base text-slate-300 mt-1 max-w-2xl font-normal leading-relaxed">
                  {topProject.tagline}
                </p>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs sm:text-sm text-slate-400">
              <div>
                <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">Total Bid Bounty</span>
                <span className="text-xl sm:text-2xl font-black text-gold-400 font-mono">
                  ${topProject.total_amount_usd.toFixed(2)}
                </span>
              </div>
              <div className="h-8 w-px bg-border hidden sm:block" />
              <div>
                <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">Live Traffic</span>
                <span className="text-base sm:text-lg font-bold text-slate-200 flex items-center gap-1.5 font-mono">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  {topProject.all_time_clicks.toLocaleString()} clicks
                </span>
              </div>
              <div className="h-8 w-px bg-border hidden sm:block" />
              <div>
                <span className="text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">SEO Backlink</span>
                <span className="text-xs sm:text-sm font-semibold text-emerald-400 flex items-center gap-1">
                  High-Trust Follow Link
                </span>
              </div>
            </div>
          </div>

          {/* Right: Outbid Action Box */}
          <div className="w-full lg:w-auto flex-shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
            <button
              onClick={() => onOvertake(topProject, minBidToOvertake)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-gold-500 via-amber-500 to-gold-600 hover:from-gold-400 hover:to-amber-400 text-black font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-gold-500/25 transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              <Zap className="w-5 h-5 fill-black" />
              <span>Outbid #1 for ${minBidToOvertake}</span>
            </button>

            <Link
              href={`/project/${topProject.slug}`}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-card/90 border border-border hover:border-gold-500/40 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all text-center"
            >
              <span>View Bid History & Badges</span>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
