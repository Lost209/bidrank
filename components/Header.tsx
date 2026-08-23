"use client";

import React from "react";
import Link from "next/link";
import { Crown, Zap, Shield, Mail, Flame, TrendingUp } from "lucide-react";

interface HeaderProps {
  stats: {
    totalProjects: number;
    totalVolumeUsd: number;
    topBid: number;
  };
  onOpenBidModal: () => void;
  onOpenBoostModal: () => void;
  onOpenEmailPreview: () => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  onOpenBidModal,
  onOpenBoostModal,
  onOpenEmailPreview,
  onOpenAdmin,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl transition-all">
      {/* Top micro-announcement banner */}
      <div className="bg-gradient-to-r from-brand-700/40 via-gold-500/20 to-brand-700/40 border-b border-white/5 py-1.5 px-4 text-center text-xs font-medium text-slate-300">
        <span className="inline-flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
          <span>Pay-to-rank is live. Submit your indie project or boost an existing listing in real time.</span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline text-emerald-400 font-semibold">Global Cards + Native UPI Supported</span>
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-amber-600 flex items-center justify-center shadow-lg shadow-gold-500/20 group-hover:scale-105 transition-transform">
            <Crown className="w-5 h-5 text-black font-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-gold-400 transition-colors">
                BIDRANK
              </span>
              <span className="bg-gold-500/10 text-gold-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-gold-500/30 tracking-wider">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">The Indie Pay-to-Rank Leaderboard</p>
          </div>
        </Link>

        {/* Live Volume Ticker Pills */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/60 border border-border text-xs">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Total Bids:</span>
            <span className="text-white font-bold font-mono">
              ${stats.totalVolumeUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/60 border border-border text-xs">
            <Crown className="w-3.5 h-3.5 text-gold-400" />
            <span className="text-slate-400">#1 Spot:</span>
            <span className="text-gold-400 font-bold font-mono">${stats.topBid.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenEmailPreview}
            title="Preview Viral Outbid Alert Email"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-card/80 border border-border hover:border-slate-600 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Mail className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline">Outbid Email</span>
          </button>

          <button
            onClick={onOpenAdmin}
            title="Admin Moderation & Security Shield"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-card/80 border border-border hover:border-slate-600 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Moderation</span>
          </button>

          <button
            onClick={onOpenBoostModal}
            className="px-3.5 py-2 rounded-xl bg-card/80 border border-brand-500/40 hover:border-brand-400 text-indigo-300 hover:text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-all hover:bg-brand-500/10"
          >
            <Zap className="w-4 h-4 text-brand-400 fill-brand-400/20" />
            <span>Boost App</span>
          </button>

          <button
            onClick={onOpenBidModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-black font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-gold-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Crown className="w-4 h-4" />
            <span>Rank My Project</span>
          </button>
        </div>
      </div>
    </header>
  );
};
