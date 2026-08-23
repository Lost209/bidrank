"use client";

import React from "react";
import Link from "next/link";
import { Crown, Heart, ShieldCheck, Zap, Globe, Sparkles } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-border/70 bg-[#08090D] text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold-500 to-amber-600 flex items-center justify-center text-black font-black">
                <Crown className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">BIDRANK</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              The real-time pay-to-rank directory for ambitious indie hackers, SaaS founders, and micro-builders.
            </p>
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SafeBrowsing Verified Dofollow Backlinks</span>
            </div>
          </div>

          {/* How It Works */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">How It Works</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>1. Submit your project URL (min $5 bid)</li>
              <li>2. Total cumulative bid determines rank</li>
              <li>3. Boost anytime to reclaim top spots</li>
              <li>4. Receive instant email when outbid</li>
            </ul>
          </div>

          {/* Payment & Compliance */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Global Payments</h4>
            <p className="text-xs leading-relaxed text-slate-400">
              Powered by unified Merchant of Record (Dodo Payments). Prices displayed in USD with native Indian UPI QR + Global Credit Cards.
            </p>
            <div className="flex items-center gap-2 pt-1 text-slate-300 font-mono text-[11px]">
              <span className="px-2 py-0.5 rounded bg-card border border-border">UPI</span>
              <span className="px-2 py-0.5 rounded bg-card border border-border">Apple Pay</span>
              <span className="px-2 py-0.5 rounded bg-card border border-border">Visa / MC</span>
            </div>
          </div>

          {/* Embeddable Badges */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Embed Dynamic Badge</h4>
            <p className="text-xs text-slate-400">
              Show off your live ranking on GitHub or your landing page:
            </p>
            <code className="block p-2 rounded-lg bg-card border border-border text-[10px] font-mono text-indigo-300 overflow-x-auto">
              /api/badge/[project-slug]
            </code>
          </div>
        </div>

        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Bidrank. Built for the indie hacker community.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-300">Privacy Policy</span>
            <span>•</span>
            <span className="text-gold-400 font-semibold">100% Anti-Scam Shielded</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
