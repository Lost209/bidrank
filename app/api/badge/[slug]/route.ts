import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const project = store.getProjectBySlug(slug);

    const rank = project ? project.current_rank : "Unranked";
    const isTop = rank === 1;
    const isTop3 = typeof rank === "number" && rank <= 3;

    // SVG Color Palette
    const bgGradientStart = isTop ? "#271E07" : "#0F111A";
    const bgGradientEnd = isTop ? "#151004" : "#1A1E2E";
    const borderColor = isTop ? "#F59E0B" : isTop3 ? "#818CF8" : "#2E344A";
    const badgeAccent = isTop ? "#F59E0B" : "#6366F1";
    const rankLabel = isTop ? "👑 Rank #1" : typeof rank === "number" ? `🏆 Rank #${rank}` : "🚀 Featured";

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="220" height="42" viewBox="0 0 220 42" fill="none">
      <defs>
        <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bgGradientStart}"/>
          <stop offset="100%" stop-color="${bgGradientEnd}"/>
        </linearGradient>
        <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${badgeAccent}"/>
          <stop offset="100%" stop-color="${isTop ? "#FBBF24" : "#A5B4FC"}"/>
        </linearGradient>
      </defs>

      <!-- Background Box -->
      <rect x="0.5" y="0.5" width="219" height="41" rx="8" fill="url(#cardBg)" stroke="${borderColor}" stroke-width="1.2"/>

      <!-- Left Brand Pill -->
      <rect x="6" y="6" width="76" height="30" rx="5" fill="#08090D"/>
      <text x="44" y="24" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" text-anchor="middle" letter-spacing="0.5">
        BIDRANK
      </text>

      <!-- Right Rank Indicator -->
      <text x="148" y="25" fill="url(#accentGrad)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" text-anchor="middle">
        ${rankLabel}
      </text>

      <!-- Pulse Dot for Live Ranking -->
      <circle cx="204" cy="21" r="3.5" fill="${badgeAccent}"/>
    </svg>
    `.trim();

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    });
  } catch (error) {
    return new NextResponse("<svg></svg>", {
      status: 500,
      headers: { "Content-Type": "image/svg+xml" },
    });
  }
}
