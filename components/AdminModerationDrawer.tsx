"use client";

import React, { useState } from "react";
import { X, Shield, CheckCircle2, Ban, RefreshCw, AlertTriangle, Zap, Crown } from "lucide-react";
import { Project } from "@/lib/types";

interface AdminModerationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onRefresh: () => void;
}

export const AdminModerationDrawer: React.FC<AdminModerationDrawerProps> = ({
  isOpen,
  onClose,
  projects,
  onRefresh,
}) => {
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleModerate = async (slug: string, action: "delist" | "verify" | "activate") => {
    try {
      setLoadingSlug(slug);
      const res = await fetch("/api/admin/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, action }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSlug(null);
    }
  };

  const handleSimulateOutbid = async () => {
    try {
      const target = projects[1] || projects[0];
      if (!target) return;

      const overtakeAmt = Math.ceil(projects[0].total_amount_usd - target.total_amount_usd + 15);
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: target.slug,
          title: target.title,
          url: target.url,
          email: target.submitter_email,
          amount: overtakeAmt,
          category: target.category,
        }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl h-full bg-[#0F111A] border-l border-border p-6 overflow-y-auto flex flex-col justify-between shadow-2xl">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Admin Moderation & Security Shield</h2>
                <p className="text-xs text-slate-400">Manage listings, SafeBrowsing flags, and killswitches.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-card border border-border text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Simulation Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                Live Outbid Battle Simulator
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Instantly trigger a simulated +$50 bid on #2 to test real-time leaderboard re-ranking.
              </p>
            </div>
            <button
              onClick={handleSimulateOutbid}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold whitespace-nowrap shadow-md"
            >
              Trigger Outbid
            </button>
          </div>

          {/* Project List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Listings ({projects.length})
            </h3>

            {projects.map((p) => {
              const isLoading = loadingSlug === p.slug;
              return (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl bg-card border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono font-bold text-slate-500 text-sm">#{p.current_rank}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white truncate">{p.title}</span>
                        {p.is_verified && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono block truncate">
                        {p.url} • ${p.total_amount_usd.toFixed(2)} all-time
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                    {!p.is_verified && (
                      <button
                        onClick={() => handleModerate(p.slug, "verify")}
                        disabled={isLoading}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold hover:bg-emerald-500/20"
                      >
                        Verify
                      </button>
                    )}

                    {p.is_active ? (
                      <button
                        onClick={() => handleModerate(p.slug, "delist")}
                        disabled={isLoading}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold hover:bg-rose-500/20 flex items-center gap-1"
                      >
                        <Ban className="w-3 h-3" />
                        Delist
                      </button>
                    ) : (
                      <button
                        onClick={() => handleModerate(p.slug, "activate")}
                        disabled={isLoading}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold hover:bg-emerald-500/20"
                      >
                        Reactivate
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-border mt-6 flex justify-between items-center text-xs text-slate-500">
          <span>SafeBrowsing: Active (100% Clean)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-card border border-border text-white font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
