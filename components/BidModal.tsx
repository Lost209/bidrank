"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, Crown, Zap, Shield, CheckCircle2, QrCode, CreditCard, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import { Category, Project } from "@/lib/types";

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onBidSuccess: () => void;
}

const CATEGORIES: Category[] = [
  "AI & ML",
  "Developer Tools",
  "SaaS",
  "Productivity",
  "Design & Creative",
  "Marketing & SEO",
  "Finance & Crypto",
  "Mobile & Apps",
  "Other",
];

export const BidModal: React.FC<BidModalProps> = ({
  isOpen,
  onClose,
  projects,
  onBidSuccess,
}) => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("SaaS");
  const [email, setEmail] = useState("");
  const [bidAmount, setBidAmount] = useState<number>(25);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi">("card");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");

  const [isScraping, setIsScraping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scrapedFlags, setScrapedFlags] = useState<string[]>([]);
  const [showUpiSim, setShowUpiSim] = useState(false);

  // Auto scrape metadata on valid URL paste
  const handleUrlBlur = async () => {
    if (!url || !url.includes(".")) return;
    try {
      setIsScraping(true);
      const res = await fetch("/api/scrape-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.title && !title) setTitle(data.title);
      if (data.description && !tagline) setTagline(data.description.substring(0, 140));
      if (data.favicon) setFaviconUrl(data.favicon);
      if (data.ogImage) setScreenshotUrl(data.ogImage);
      if (data.securityFlags) setScrapedFlags(data.securityFlags);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScraping(false);
    }
  };

  // Calculate projected rank
  const calculateProjectedRank = (amount: number) => {
    const sorted = [...projects].sort((a, b) => b.total_amount_usd - a.total_amount_usd);
    let rank = 1;
    for (const p of sorted) {
      if (amount > p.total_amount_usd) {
        break;
      }
      rank++;
    }
    return rank;
  };

  const projectedRank = calculateProjectedRank(bidAmount);
  const topBid = projects[0]?.total_amount_usd || 0;
  const overtakeAmount = Math.max(5, Math.ceil(topBid + 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !email || bidAmount < 1) return;

    try {
      setIsSubmitting(true);
      const slug = title
        ? title.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-")
        : url.replace(/^https?:\/\//, "").split("/")[0].replace(/[^a-z0-9]/g, "-");

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          title: title || slug,
          tagline: tagline || "Modern indie app",
          description,
          url,
          category,
          email,
          amount: bidAmount,
          paymentGateway: paymentMethod === "upi" ? "dodo_payments" : "dodo_payments",
          favicon: faviconUrl,
          screenshot: screenshotUrl,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        onBidSuccess();
        onClose();
      } else {
        alert(data.error || "Submission failed");
      }
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0F111A] border-2 border-border/80 p-6 sm:p-8 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl bg-card border border-border text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-amber-600 flex items-center justify-center text-black font-black">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Rank Your Indie Project
            </h2>
            <p className="text-xs text-slate-400">
              Instant live dofollow backlink & permanent spot on the leaderboard.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Project Website URL</span>
              {isScraping && (
                <span className="text-brand-400 flex items-center gap-1 normal-case text-xs">
                  <Loader2 className="w-3 h-3 animate-spin" /> Scraping OpenGraph...
                </span>
              )}
            </label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={handleUrlBlur}
              placeholder="https://yourproduct.com"
              className="w-full px-4 py-2.5 rounded-xl bg-card border border-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>

          {/* Title & Tagline Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Product Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. PromptPulse AI"
                className="w-full px-4 py-2 rounded-xl bg-card border border-border focus:border-brand-500 text-sm text-white placeholder-slate-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2 rounded-xl bg-card border border-border text-sm text-white outline-none focus:border-brand-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-card">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Tagline (Max 140 chars)
            </label>
            <input
              type="text"
              required
              maxLength={140}
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Short punchy description of what your app does"
              className="w-full px-4 py-2 rounded-xl bg-card border border-border focus:border-brand-500 text-sm text-white placeholder-slate-500 outline-none"
            />
          </div>

          {/* Submitter Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Your Email (For Outbid Alerts)</span>
              <span className="text-[11px] text-indigo-400 font-normal normal-case">
                ⚡ Instant alert if someone outbids you
              </span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="founder@yourproduct.com"
              className="w-full px-4 py-2 rounded-xl bg-card border border-border focus:border-brand-500 text-sm text-white placeholder-slate-500 outline-none"
            />
          </div>

          {/* Bid Amount & Rank Simulator */}
          <div className="rounded-2xl bg-card/80 border-2 border-brand-500/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-gold-400" />
                <span>Your Bid Amount (USD)</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBidAmount(overtakeAmount)}
                  className="px-2 py-0.5 rounded bg-gold-500/20 text-gold-400 border border-gold-500/40 text-[11px] font-bold"
                >
                  👑 Take #1 (${overtakeAmount})
                </button>
              </div>
            </div>

            {/* Quick Price Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[10, 25, 50, 100].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setBidAmount(amt)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                    bidAmount === amt
                      ? "bg-brand-500 text-white shadow-md"
                      : "bg-card border border-border text-slate-300 hover:bg-card-hover"
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="5"
                step="1"
                required
                value={bidAmount}
                onChange={(e) => setBidAmount(Math.max(1, Number(e.target.value)))}
                className="w-32 px-3 py-1.5 rounded-xl bg-[#08090D] border border-border text-lg font-black text-gold-400 font-mono text-center outline-none focus:border-gold-500"
              />
              <div className="flex-1 text-xs text-slate-300">
                Projected Live Position:{" "}
                <span className="font-black text-sm text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded border border-gold-500/20">
                  {projectedRank === 1 ? "👑 Rank #1 Crown" : `🏆 Rank #${projectedRank}`}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setPaymentMethod("card")}
              className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all ${
                paymentMethod === "card"
                  ? "bg-brand-500/20 border-brand-500 text-white"
                  : "bg-card border-border text-slate-400"
              }`}
            >
              <CreditCard className="w-4 h-4 text-brand-400" />
              <div className="text-left">
                <div>Global Cards</div>
                <div className="text-[10px] text-slate-400 font-normal">Apple Pay, Google Pay</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("upi")}
              className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all ${
                paymentMethod === "upi"
                  ? "bg-emerald-500/20 border-emerald-500 text-white"
                  : "bg-card border-border text-slate-400"
              }`}
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <div>Indian UPI / QR</div>
                <div className="text-[10px] text-slate-400 font-normal">PhonePe, GPay, Paytm</div>
              </div>
            </button>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 via-amber-500 to-gold-600 hover:from-gold-400 hover:to-amber-400 text-black font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-gold-500/25 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Crown className="w-5 h-5" />
                <span>Pay ${bidAmount} & Claim Rank #{projectedRank}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
