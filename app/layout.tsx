import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bidrank – Pay-to-Rank Leaderboard for Indie Apps & Micro-SaaS",
  description:
    "The real-time pay-to-rank directory for indie hackers. Public leaderboard rank is determined strictly by cumulative bid. Instant live dofollow backlink, automatic URL scraping, and outbid alerts.",
  keywords: [
    "pay to rank",
    "indie hackers directory",
    "micro saas directory",
    "leaderboard",
    "dofollow backlink",
    "product launch",
    "indie maker",
  ],
  openGraph: {
    title: "Bidrank – The Pay-to-Rank Leaderboard for Indie Apps",
    description: "Highest bidder takes #1. Live dofollow SEO backlinks & real-time outbid battles.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="https://api.dicebear.com/7.x/identicon/svg?seed=bidrank" />
      </head>
      <body className="min-h-screen bg-[#08090D] text-slate-200 antialiased selection:bg-gold-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
