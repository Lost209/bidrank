# 👑 Bidrank – The Pay-to-Rank Leaderboard for Indie Apps & Micro-SaaS

> **Highest bidder takes #1. Live dofollow SEO backlinks & real-time rank battles.**

Bidrank is a high-converting, gamified "pay-to-rank" directory for indie hackers and micro-startups. A project's position on the public leaderboard is determined entirely by the cumulative USD amount bid.

---

## ⚡ Core Features

- **🏆 Dynamic Real-time Leaderboard:** Atomic position re-ranking based strictly on `total_amount_usd` DESC.
- **👑 King of the Hill Spotlight:** Sticky #1 featured card with glowing amber ring, live click tracker, and 1-click outbid action.
- **💳 Global Cards + Native Indian UPI:** Unified Merchant of Record (MoR) architecture via **Dodo Payments** supporting USD pricing, Apple Pay, Google Pay, and instant UPI QR payments with zero tax overhead.
- **🔍 Instant OpenGraph URL Scraper:** Server-side metadata extractor (`cheerio`) that automatically scrapes title, tagline, and favicon from any submitted URL.
- **🚨 Viral Outbid Notification Engine:** Triggers instant email alerts via Resend when a competitor outbids an existing project with a 1-click deep-link to reclaim rank.
- **🖼️ Embeddable Dynamic SVG Badges:** Embed live badges on GitHub READMEs or landing pages (`/api/badge/[slug]`) that update in real time.
- **🛡️ Admin Security Shield & Killswitch:** Real-time domain verification, SafeBrowsing check, and 1-click admin delist / refund trigger.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router, Server Actions, Route Handlers, SSR for SEO dofollow indexing)
- **Styling:** Tailwind CSS, Framer Motion, Lucide Icons, Glassmorphic cyber-amber dark theme
- **Payments:** Dodo Payments (Global Cards + Apple/Google Pay + Indian UPI QR)
- **Email:** Resend (React Email templates for Outbid Alerts)
- **Security:** Cheerio URL scraper, DNS reputation checks, HMAC webhook signature verification
- **Deployment:** Vercel & Supabase

---

## 🚀 Quickstart

### 1. Install Dependencies
```bash
cd bidrank
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm start
```

---

## 🌐 API Routes Summary

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/projects` | `GET` | Fetch leaderboard projects, live volume telemetry, and activity events. |
| `/api/projects` | `POST` | Process a new bid or boost atomically and recalculate ranks. |
| `/api/projects/[slug]` | `GET` | Get single project telemetry, all-time bids, and overtake calculations. |
| `/api/projects/[slug]` | `POST` | Record a click / visit event. |
| `/api/scrape-metadata` | `POST` | Server-side OpenGraph metadata scraper and safety validator. |
| `/api/badge/[slug]` | `GET` | Dynamic SVG rank badge for README / landing page embeds. |
| `/api/checkout` | `POST` | Create Dodo Payments checkout session or test simulator. |
| `/api/webhooks/dodo` | `POST` | Dodo Payments webhook handler with HMAC signature verification. |
| `/api/admin/moderate` | `POST` | 1-click admin delist, verify, or outbid simulation. |

---

## 📄 License
MIT License. Built for the indie hacker community.
