"use client";

import React, { useState, useEffect } from "react";
import { Crown, Zap, ShieldCheck, TrendingUp, Sparkles, Globe, ArrowRight, Flame } from "lucide-react";
import { Project, ActivityEvent, Category } from "@/lib/types";
import { Header } from "@/components/Header";
import { HeroSpotlight } from "@/components/HeroSpotlight";
import { CategoryPills } from "@/components/CategoryPills";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { LiveActivityFeed } from "@/components/LiveActivityFeed";
import { BidModal } from "@/components/BidModal";
import { BoostModal } from "@/components/BoostModal";
import { OutbidEmailPreview } from "@/components/OutbidEmailPreview";
import { AdminModerationDrawer } from "@/components/AdminModerationDrawer";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 12,
    totalVolumeUsd: 1055.0,
    topBid: 245.0,
    totalClicks: 6500,
    minBidToEnter: 5.0,
  });

  const [activeCategory, setActiveCategory] = useState<"All" | Category>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedBoostProject, setSelectedBoostProject] = useState<Project | null>(null);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
        if (data.stats) setStats(data.stats);
        if (data.activities) setActivities(data.activities);
      }
    } catch (e) {
      console.error("Failed to fetch leaderboard", e);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    // Poll every 10 seconds for real-time live updates
    const interval = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRecordClick = async (slug: string) => {
    try {
      await fetch(`/api/projects/${slug}`, { method: "POST" });
      fetchLeaderboard();
    } catch (e) {
      console.error(e);
    }
  };

  const handleOvertakeTop = (topProject: Project, requiredAmount: number) => {
    setSelectedBoostProject(null);
    setIsBidModalOpen(true);
  };

  const handleBoostProject = (project: Project) => {
    setSelectedBoostProject(project);
    setIsBoostModalOpen(true);
  };

  // Filter projects by category and search
  const filteredProjects = projects.filter((p) => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const topProject = projects[0];
  const minBidToOvertakeTop = topProject
    ? Math.max(5, Math.ceil(topProject.total_amount_usd + 1))
    : 10;

  return (
    <div className="min-h-screen bg-[#08090D] text-slate-200">
      {/* Navigation Header */}
      <Header
        stats={stats}
        onOpenBidModal={() => setIsBidModalOpen(true)}
        onOpenBoostModal={() => {
          setSelectedBoostProject(null);
          setIsBoostModalOpen(true);
        }}
        onOpenEmailPreview={() => setIsEmailPreviewOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-indigo-300 text-xs font-bold tracking-wide shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>The No-BS Directory for Builders & SaaS Makers</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Highest Bid Takes{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-amber-400 to-gold-500">
              #1 Crown.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Gain high-intent traffic and high-authority dofollow SEO backlinks. Position is determined strictly by cumulative USD bid. Instant live updates.
          </p>

          {/* Value Props Strip */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> 100% DoFollow SEO Links
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-indigo-300">
              <Globe className="w-4 h-4" /> Global Cards + Indian UPI
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <Zap className="w-4 h-4" /> Instant Live Webhooks
            </span>
          </div>
        </div>

        {/* #1 "King of the Hill" Spotlight Card */}
        <HeroSpotlight
          topProject={topProject}
          minBidToOvertake={minBidToOvertakeTop}
          onOvertake={handleOvertakeTop}
          onRecordClick={handleRecordClick}
        />

        {/* Main Grid: Leaderboard + Live Ticker Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left / Center: Category Filters & Leaderboard Table */}
          <div className="lg:col-span-2 space-y-6">
            <CategoryPills
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              totalCount={filteredProjects.length}
            />

            <LeaderboardTable
              projects={filteredProjects}
              onBoost={handleBoostProject}
              onRecordClick={handleRecordClick}
            />
          </div>

          {/* Right Sidebar: Live Activity & Explainer Widgets */}
          <div className="space-y-6">
            {/* Live Activity Stream */}
            <LiveActivityFeed activities={activities} />

            {/* Viral Outbid Explainer Card */}
            <div className="rounded-2xl bg-gradient-to-br from-[#121422] to-card border border-border p-5 space-y-3 shadow-lg">
              <div className="flex items-center gap-2 text-gold-400 font-bold text-sm">
                <Crown className="w-4 h-4 fill-gold-400" />
                <span>The Outbid Growth Loop</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                When you outbid a competitor, they receive an immediate notification with a 1-click boost link. This creates high-velocity rank battles and sustained referral traffic.
              </p>
              <button
                onClick={() => setIsEmailPreviewOpen(true)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 transition-colors"
              >
                <span>See sample outbid alert</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Quick CTA Box */}
            <div className="rounded-2xl bg-card border-2 border-brand-500/30 p-5 space-y-3 text-center">
              <h3 className="font-extrabold text-white text-base">Have an indie product?</h3>
              <p className="text-xs text-slate-400">
                Launch your app in 60 seconds. Paste your URL, choose your starting bid, and start getting traffic today.
              </p>
              <button
                onClick={() => setIsBidModalOpen(true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-gold-500/20"
              >
                <Crown className="w-4 h-4" />
                <span>Submit App for $5</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Submission & Action Modals */}
      <BidModal
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        projects={projects}
        onBidSuccess={fetchLeaderboard}
      />

      <BoostModal
        isOpen={isBoostModalOpen}
        onClose={() => {
          setIsBoostModalOpen(false);
          setSelectedBoostProject(null);
        }}
        projects={projects}
        preselectedProject={selectedBoostProject}
        onBoostSuccess={fetchLeaderboard}
      />

      <OutbidEmailPreview
        isOpen={isEmailPreviewOpen}
        onClose={() => setIsEmailPreviewOpen(false)}
      />

      <AdminModerationDrawer
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        projects={projects}
        onRefresh={fetchLeaderboard}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
