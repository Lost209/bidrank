"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  Crown, 
  ExternalLink, 
  Zap, 
  ArrowLeft, 
  CheckCircle2, 
  Eye, 
  Code, 
  Copy, 
  Check, 
  ShieldCheck, 
  TrendingUp, 
  Calendar 
} from "lucide-react";
import { Project } from "@/lib/types";
import { BoostModal } from "@/components/BoostModal";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [project, setProject] = useState<Project | null>(null);
  const [minBidToOvertakeTop, setMinBidToOvertakeTop] = useState(10);
  const [minBidToJumpOne, setMinBidToJumpOne] = useState(5);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState({ totalProjects: 12, totalVolumeUsd: 1055, topBid: 245 });

  const [isBoostOpen, setIsBoostOpen] = useState(false);
  const [copiedType, setCopiedType] = useState<"md" | "html" | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProjectData = async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
        setMinBidToOvertakeTop(data.minBidToOvertakeTop || 10);
        setMinBidToJumpOne(data.minBidToJumpOne || 5);
      }

      const listRes = await fetch("/api/projects");
      if (listRes.ok) {
        const listData = await listRes.json();
        setAllProjects(listData.projects || []);
        if (listData.stats) setStats(listData.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [slug]);

  const recordClick = async () => {
    if (!slug) return;
    try {
      await fetch(`/api/projects/${slug}`, { method: "POST" });
    } catch (e) {
      console.error(e);
    }
  };

  const copyCode = (type: "md" | "html", text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090D] flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-brand-400 animate-spin" />
          <span>Loading project telemetry...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#08090D] text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
        <p className="text-slate-400 mb-4">This project may have been delisted or does not exist.</p>
        <Link href="/" className="px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold text-sm">
          Return to Leaderboard
        </Link>
      </div>
    );
  }

  const isFirst = project.current_rank === 1;
  const isTop3 = project.current_rank <= 3;
  const origin = typeof window !== "undefined" ? window.location.origin : "https://bidrank.vercel.app";
  const badgeUrl = `${origin}/api/badge/${project.slug}`;
  const projectUrl = `${origin}/project/${project.slug}`;

  const mdSnippet = `[![Ranked on Bidrank](${badgeUrl})](${projectUrl})`;
  const htmlSnippet = `<a href="${projectUrl}"><img src="${badgeUrl}" alt="Ranked on Bidrank" /></a>`;

  return (
    <div className="min-h-screen bg-[#08090D] text-slate-200">
      <Header
        stats={stats}
        onOpenBidModal={() => setIsBoostOpen(true)}
        onOpenBoostModal={() => setIsBoostOpen(true)}
        onOpenEmailPreview={() => {}}
        onOpenAdmin={() => {}}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Live Leaderboard</span>
        </Link>

        {/* Hero Card */}
        <div
          className={`rounded-3xl p-6 sm:p-8 bg-card border-2 relative overflow-hidden mb-8 shadow-2xl ${
            isFirst ? "border-gold-500/80 bg-gradient-to-b from-[#181307] to-card" : "border-border"
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            {/* Left Info */}
            <div className="space-y-4 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {isFirst ? (
                  <span className="px-3 py-1 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/40 text-xs font-extrabold flex items-center gap-1.5 uppercase">
                    <Crown className="w-3.5 h-3.5 fill-gold-400" />
                    Current #1 Leader
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-card border border-border text-xs font-bold font-mono text-white">
                    Rank #{project.current_rank}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-card border border-border text-[11px] font-semibold text-slate-400">
                  {project.category}
                </span>
                {project.is_verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified DoFollow Backlink
                  </span>
                )}
              </div>

              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-black/60 border border-border p-2 flex items-center justify-center flex-shrink-0">
                  {project.favicon_url ? (
                    <img src={project.favicon_url} alt={project.title} className="w-10 h-10 object-contain rounded" />
                  ) : (
                    <Crown className="w-8 h-8 text-gold-400" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    <span>{project.title}</span>
                  </h1>
                  <p className="text-sm sm:text-base text-slate-300 mt-1 leading-relaxed">
                    {project.tagline}
                  </p>
                </div>
              </div>

              {project.description && (
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-3xl pt-2">
                  {project.description}
                </p>
              )}

              {/* Action Links */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener follow"
                  onClick={recordClick}
                  className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs sm:text-sm flex items-center gap-1.5 hover:bg-slate-200 transition-colors shadow-md"
                >
                  <span>Visit Official Website</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={() => setIsBoostOpen(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-brand-500/20"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Boost Position (+${minBidToJumpOne})</span>
                </button>
              </div>
            </div>

            {/* Right Quick Telemetry */}
            <div className="w-full lg:w-64 rounded-2xl bg-[#08090D] border border-border p-4 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Cumulative Bid:</span>
                <span className="font-black text-gold-400 text-base font-sans">
                  ${project.total_amount_usd.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">All-time Traffic:</span>
                <span className="font-bold text-slate-200 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  {project.all_time_clicks} clicks
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">To Reach #1:</span>
                <span className="font-bold text-emerald-400">
                  {isFirst ? "Currently #1 👑" : `+$${minBidToOvertakeTop}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Badge Embed Generator Card */}
        <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 space-y-6 shadow-xl mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Embed Dynamic Rank Badge</h2>
              <p className="text-xs text-slate-400">
                Display your live ranking on GitHub Readme or website footer. Updates in real time automatically.
              </p>
            </div>
          </div>

          {/* Badge Preview */}
          <div className="p-6 rounded-2xl bg-[#08090D] border border-border flex flex-col items-center justify-center gap-4">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Live Dynamic SVG Preview</span>
            <img src={badgeUrl} alt={`${project.title} Rank Badge`} className="h-10 shadow-lg" />
          </div>

          {/* Embed Code Snippets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Markdown */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300">Markdown (GitHub README)</span>
                <button
                  onClick={() => copyCode("md", mdSnippet)}
                  className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
                >
                  {copiedType === "md" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedType === "md" ? "Copied!" : "Copy"}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-[#08090D] border border-border text-[11px] font-mono text-slate-400 overflow-x-auto">
                {mdSnippet}
              </pre>
            </div>

            {/* HTML */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300">HTML (Landing Pages)</span>
                <button
                  onClick={() => copyCode("html", htmlSnippet)}
                  className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
                >
                  {copiedType === "html" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedType === "html" ? "Copied!" : "Copy"}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-[#08090D] border border-border text-[11px] font-mono text-slate-400 overflow-x-auto">
                {htmlSnippet}
              </pre>
            </div>
          </div>
        </div>
      </main>

      <BoostModal
        isOpen={isBoostOpen}
        onClose={() => setIsBoostOpen(false)}
        projects={allProjects}
        preselectedProject={project}
        onBoostSuccess={fetchProjectData}
      />

      <Footer />
    </div>
  );
}
