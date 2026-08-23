"use client";

import React from "react";
import { X, Mail, Crown, AlertTriangle, ArrowRight, Zap, ExternalLink } from "lucide-react";

interface OutbidEmailPreviewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OutbidEmailPreview: React.FC<OutbidEmailPreviewProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0F111A] border-2 border-border p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl bg-card border border-border text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-black">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Viral Outbid Email Alert
            </h2>
            <p className="text-xs text-slate-400">
              Automated trigger sent via Resend whenever a competitor outbids a founder.
            </p>
          </div>
        </div>

        {/* Simulated Email Client Container */}
        <div className="rounded-2xl bg-[#08090D] border border-border overflow-hidden text-xs">
          {/* Email Headers */}
          <div className="bg-[#12141F] p-3 border-b border-border space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center justify-between text-slate-400">
              <span>From: <strong className="text-white">alerts@bidrank.io</strong></span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">⚡ Triggered in 1.2s</span>
            </div>
            <div className="text-slate-400">
              Subject: <strong className="text-amber-400 font-bold">🚨 You were just outbid on Bidrank! Reclaim #1</strong>
            </div>
          </div>

          {/* Email Body Content */}
          <div className="p-6 space-y-4 font-sans text-slate-200">
            <div className="flex items-center gap-2 text-gold-400 font-black text-sm">
              <Crown className="w-4 h-4 fill-gold-400" />
              <span>BIDRANK POSITION ALERT</span>
            </div>

            <p className="text-sm">Hey Alex,</p>

            <p className="text-sm leading-relaxed">
              <strong className="text-white font-bold">TypeMagic Form Builder</strong> just placed a{" "}
              <strong className="text-emerald-400 font-bold">$55 bid</strong> and took the{" "}
              <strong className="text-gold-400 font-bold">#1 King of the Hill Spot</strong> from your project{" "}
              <strong className="text-white">PromptPulse AI</strong>.
            </p>

            <div className="rounded-xl bg-[#151824] border border-border p-4 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Previous Standing:</span>
                <span className="font-bold text-gold-400">👑 Rank #1 ($245.00)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">New Current Standing:</span>
                <span className="font-bold text-slate-300">Rank #2</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-border/60 pt-2">
                <span className="text-slate-400">Minimum Bid to Reclaim #1:</span>
                <span className="font-black text-emerald-400 font-mono text-sm">+$10.00</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>Reclaim #1 Crown for $10 (1-Click Deep Link)</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 text-center pt-2">
              You are receiving this because you submitted PromptPulse AI on Bidrank.
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-card border border-border text-slate-300 hover:text-white text-xs font-bold"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
