import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const project = store.getProjectBySlug(slug);

    const title = project?.title || "Indie App";
    const tagline = project?.tagline || "The Pay-to-Rank Directory for Builders";
    const rank = project ? project.current_rank : 1;
    const isTop = rank === 1;
    const totalBid = project ? project.total_amount_usd.toFixed(2) : "50.00";
    const category = project?.category || "SaaS";

    const accentColor = isTop ? "#F59E0B" : "#6366F1";
    const badgeLabel = isTop ? "👑 Rank #1 Crown" : `🏆 Ranked #${rank}`;

    // Clean XML-safe escaping
    const safeTitle = title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeTagline = tagline.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0E1019"/>
          <stop offset="100%" stop-color="#08090D"/>
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#F59E0B"/>
          <stop offset="100%" stop-color="#FBBF24"/>
        </linearGradient>
        <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#6366F1"/>
          <stop offset="100%" stop-color="#818CF8"/>
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bgGrad)"/>
      <circle cx="200" cy="150" r="300" fill="#6366F1" opacity="0.12" filter="blur(80px)"/>
      <circle cx="1000" cy="450" r="350" fill="#F59E0B" opacity="0.1" filter="blur(90px)"/>

      <!-- Outer Border -->
      <rect x="20" y="20" width="1160" height="590" rx="24" stroke="#202434" stroke-width="2"/>

      <!-- Top Header -->
      <g transform="translate(80, 80)">
        <rect width="48" height="48" rx="14" fill="url(#goldGrad)"/>
        <text x="24" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" text-anchor="middle" fill="#000000">👑</text>
        <text x="64" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">BIDRANK</text>
      </g>

      <!-- Rank Pill Badge -->
      <g transform="translate(880, 75)">
        <rect width="240" height="54" rx="27" fill="${isTop ? "rgba(245, 158, 11, 0.15)" : "rgba(99, 102, 241, 0.15)"}" stroke="${accentColor}" stroke-width="2"/>
        <text x="120" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="${isTop ? "#FBBF24" : "#A5B4FC"}" text-anchor="middle">
          ${badgeLabel}
        </text>
      </g>

      <!-- Center Body Content -->
      <text x="80" y="240" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="800" fill="#818CF8" letter-spacing="2">
        ${category.toUpperCase()}
      </text>

      <text x="80" y="320" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="56" font-weight="900" fill="#FFFFFF" letter-spacing="-1">
        ${safeTitle}
      </text>

      <text x="80" y="380" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="500" fill="#94A3B8">
        ${safeTagline.substring(0, 70)}
      </text>

      <!-- Bottom Telemetry Bar -->
      <line x1="80" y1="460" x2="1120" y2="460" stroke="#202434" stroke-width="2"/>

      <g transform="translate(80, 490)">
        <text x="0" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#64748B">TOTAL CUMULATIVE BID</text>
        <text x="0" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="900" fill="#F59E0B">$${totalBid} USD</text>
      </g>

      <g transform="translate(360, 490)">
        <text x="0" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#64748B">BACKLINK STATUS</text>
        <text x="0" y="56" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="800" fill="#34D399">DoFollow Verified</text>
      </g>

      <g transform="translate(820, 520)">
        <text x="300" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#94A3B8" text-anchor="end">bidrank.io/project/${slug}</text>
      </g>
    </svg>
    `.trim();

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    });
  } catch (error) {
    return new NextResponse("<svg></svg>", { status: 500, headers: { "Content-Type": "image/svg+xml" } });
  }
}
