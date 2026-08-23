"use client";

import React, { useState, useEffect } from "react";
import { X, Zap, Crown, CheckCircle2, TrendingUp, CreditCard, QrCode, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import { Project } from "@/lib/types";

interface BoostModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  preselectedProject?: Project | null;
  onBoostSuccess: () => void;
}

export const BoostModal: React.FC<BoostModalProps> = ({
  isOpen,
  onClose,
  projects,
  preselectedProject,
  onBoostSuccess,
}) => {
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [boostAmount, setBoostAmount] = useState<number>(15);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi">("card");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedProject) {
      setSelectedSlug(preselectedProject.slug);
    } else if (projects.length > 0 && !selectedSlug) {
      setSelectedSlug(projects[0].slug);
    }
  }, [preselectedProject, projects]);

  if (!isOpen) return null;

  const currentProject = projects.find((p) => p.slug === selectedSlug) || projects[0];
  const topProject = projects[0];
  const isAlreadyTop = currentProject?.current_rank === 1;

  // Calculate amount to overtake #1
  const overtakeCrownDelta = topProject && currentProject
    ? Math.max(5, Math.ceil(topProject.total_amount_usd - currentProject.total_amount_usd + 1))
    : 10;

  const projectedNewTotal = (currentProject?.total_amount_usd || 0) + boostAmount;

  // Calculate projected new rank
  let projectedRank = 1;
  for (const p of projects) {
    if (p.slug === currentProject?.slug) continue;
    if (projectedNewTotal <= p.total_amount_usd) {
      projectedRank++;
    }
  }

  const handleBoostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || boostAmount < 1) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: currentProject.slug,
          title: currentProject.title,
          url: currentProject.url,
          email: currentProject.submitter_email,
          amount: boostAmount,
          category: currentProject.category,
          paymentGateway: "dodo_payments",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
        onBoostSuccess();
        onClose();
      } else {
        alert(data.error || "Boost failed");
      }
    } catch (err: any) {
      alert(err.message || "Failed to process boost");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0F111A] border-2 border-border p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl bg-card border border-border text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 font-black">
            <Zap className="w-5 h-5 fill-brand-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Boost Listing & Jump Ranks
            </h2>
            <p className="text-xs text-slate-400">
              Add cumulative bids to outbid competitors and reclaim high-visibility spots.
            </p>
          </div>
        </div>

        <form onSubmit={handleBoostSubmit} className="space-y-4">
          {/* Select Project */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Select App to Boost
            </label>
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-white outline-none focus:border-brand-500"
            >
              {projects.map((p) => (
                <option key={p.slug} value={p.slug} className="bg-card">
                  #{p.current_rank} {p.title} (Total: ${p.total_amount_usd.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Current Rank Stats Card */}
          {currentProject && (
            <div className="rounded-2xl bg-card/70 border border-border p-3.5 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block font-semibold text-[10px] uppercase">Current Standing</span>
                <span className="font-bold text-white text-sm">
                  Rank #{currentProject.current_rank} • ${currentProject.total_amount_usd.toFixed(2)} all-time
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block font-semibold text-[10px] uppercase">After +${boostAmount} Boost</span>
                <span className="font-black text-emerald-400 text-sm">
                  {projectedRank === 1 ? "👑 Projected #1 Crown" : `🏆 Projected Rank #${projectedRank}`}
                </span>
              </div>
            </div>
          )}

          {/* Smart Boost Presets */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Select Boost Amount</span>
              {!isAlreadyTop && (
                <button
                  type="button"
                  onClick={() => setBoostAmount(overtakeCrownDelta)}
                  className="text-gold-400 text-xs font-bold hover:underline flex items-center gap-1"
                >
                  <Crown className="w-3 h-3 fill-gold-400" />
                  Exact #${1} Crown Bounty (+${overtakeCrownDelta})
                </button>
              )}
            </label>

            <div className="grid grid-cols-4 gap-2">
              {[5, 15, 30, overtakeCrownDelta].map((amt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setBoostAmount(amt)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    boostAmount === amt
                      ? "bg-brand-500 text-white shadow-md border border-brand-400"
                      : "bg-card border border-border text-slate-300 hover:bg-card-hover"
                  }`}
                >
                  {idx === 3 && !isAlreadyTop ? `👑 +$${amt}` : `+$${amt}`}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Boost Amount Input */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-semibold">Custom Boost:</span>
            <input
              type="number"
              min="1"
              step="1"
              value={boostAmount}
              onChange={(e) => setBoostAmount(Math.max(1, Number(e.target.value)))}
              className="w-28 px-3 py-1.5 rounded-xl bg-card border border-border text-sm font-black text-brand-400 font-mono text-center outline-none focus:border-brand-500"
            />
            <span className="text-xs text-slate-400">USD</span>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setPaymentMethod("card")}
              className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
                paymentMethod === "card"
                  ? "bg-brand-500/20 border-brand-500 text-white"
                  : "bg-card border-border text-slate-400"
              }`}
            >
              <CreditCard className="w-4 h-4 text-brand-400" />
              <span>Cards / Apple Pay</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("upi")}
              className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
                paymentMethod === "upi"
                  ? "bg-emerald-500/20 border-emerald-500 text-white"
                  : "bg-card border-border text-slate-400"
              }`}
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>UPI / QR Code</span>
            </button>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-brand-500/25 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Zap className="w-5 h-5 fill-white" />
                <span>Boost +${boostAmount} (Projected Rank #{projectedRank})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
