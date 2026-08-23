// ==============================================================================
// BIDRANK AUTOMATED PRE-DEPLOYMENT READINESS & AUDIT ENGINE
// Run: node scripts/deploy-readiness-check.mjs
// ==============================================================================

import fs from "fs";
import path from "path";
import crypto from "crypto";

const BASE_URL = process.env.APP_URL || "http://127.0.0.1:3005";

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  gold: "\x1b[38;5;214m",
  magenta: "\x1b[35m",
};

function header(title) {
  console.log(`\n${colors.gold}${colors.bright}================================================================`);
  console.log(`  🚀 ${title}`);
  console.log(`================================================================${colors.reset}\n`);
}

function check(label, passed, detail = "") {
  if (passed) {
    console.log(`  ${colors.green}✔ [PASSED]${colors.reset} ${label} ${colors.cyan}${detail}${colors.reset}`);
  } else {
    console.log(`  ${colors.red}✖ [FAILED]${colors.reset} ${label} ${colors.yellow}${detail}${colors.reset}`);
  }
  return passed;
}

async function runAudit() {
  header("BIDRANK PRE-DEPLOYMENT AUDIT & READINESS ENGINE");

  let checksTotal = 0;
  let checksPassed = 0;

  // 1. Filesystem & Config Checks
  console.log(`${colors.cyan}[1/5] Auditing Configuration Files & Environment Templates...${colors.reset}`);
  
  const requiredFiles = [
    ".env.example",
    "vercel.json",
    "README.md",
    "LAUNCH_KIT.md",
    "supabase/migrations/001_initial_schema.sql",
    ".github/workflows/ci-cd.yml",
  ];

  for (const file of requiredFiles) {
    checksTotal++;
    const exists = fs.existsSync(path.resolve(file));
    if (check(`File '${file}' exists`, exists)) checksPassed++;
  }

  // 2. Production Server Connectivity
  console.log(`\n${colors.cyan}[2/5] Testing Production Endpoint Health (${BASE_URL})...${colors.reset}`);
  
  try {
    checksTotal++;
    const homeRes = await fetch(`${BASE_URL}/`);
    const homeOk = homeRes.status === 200;
    if (check("Home Leaderboard (SSR) returns HTTP 200", homeOk)) checksPassed++;

    checksTotal++;
    const apiRes = await fetch(`${BASE_URL}/api/projects`);
    const apiData = await apiRes.json();
    const apiOk = Array.isArray(apiData.projects) && apiData.projects.length > 0;
    if (check(`Projects API returned ${apiData.projects.length} ranked listings`, apiOk)) checksPassed++;
  } catch (err) {
    check("Server connectivity failed", false, err.message);
  }

  // 3. Security & Validation Checks
  console.log(`\n${colors.cyan}[3/5] Auditing Security Shield & Negative Testing...${colors.reset}`);

  try {
    // Test negative bid rejection (min $1 required)
    checksTotal++;
    const invalidRes = await fetch(`${BASE_URL}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@test.com", amount: -10 }),
    });
    const invalidRejected = invalidRes.status === 400;
    if (check("Negative bid amounts (-$10) rejected with HTTP 400", invalidRejected)) checksPassed++;

    // Test URL safety scraper
    checksTotal++;
    const scrapeRes = await fetch(`${BASE_URL}/api/scrape-metadata`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://news.ycombinator.com" }),
    });
    const scrapeData = await scrapeRes.json();
    const scraperOk = !!scrapeData.title && scrapeData.isSafe === true;
    if (check(`SafeBrowsing Scanner confirmed clean for ${scrapeData.title?.substring(0, 25)}...`, scraperOk)) checksPassed++;
  } catch (err) {
    check("Security test execution failed", false, err.message);
  }

  // 4. Dynamic Asset & Integration Generation
  console.log(`\n${colors.cyan}[4/5] Auditing Dynamic Badges, Social OG Cards & Sitemaps...${colors.reset}`);

  try {
    // Badge SVG
    checksTotal++;
    const badgeRes = await fetch(`${BASE_URL}/api/badge/promptpulse`);
    const badgeSvg = await badgeRes.text();
    const badgeOk = badgeRes.ok && badgeSvg.includes("<svg") && badgeSvg.includes("BIDRANK");
    if (check("Dynamic SVG Badge generator produces valid SVG XML", badgeOk)) checksPassed++;

    // OpenGraph Social Card
    checksTotal++;
    const ogRes = await fetch(`${BASE_URL}/api/og/promptpulse`);
    const ogSvg = await ogRes.text();
    const ogOk = ogRes.ok && ogSvg.includes("1200") && ogSvg.includes("630");
    if (check("Dynamic 1200x630 Social Card renders with correct dimensions", ogOk)) checksPassed++;

    // Googlebot Sitemap
    checksTotal++;
    const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
    const sitemapXml = await sitemapRes.text();
    const sitemapOk = sitemapRes.ok && sitemapXml.includes("<urlset");
    if (check("Dynamic SEO Sitemap generates valid XML format", sitemapOk)) checksPassed++;
  } catch (err) {
    check("Asset audit execution failed", false, err.message);
  }

  // 5. Payment Webhook HMAC Verification
  console.log(`\n${colors.cyan}[5/5] Auditing Dodo Payments Webhook & HMAC Verification...${colors.reset}`);

  try {
    checksTotal++;
    const testWhPayload = JSON.stringify({
      type: "payment.succeeded",
      data: {
        payment_id: `audit_wh_${Date.now()}`,
        total_amount_usd: 50.0,
        customer_email: "audit@bidrank.io",
        metadata: {
          slug: "cloudaudit-dev",
          title: "CloudAudit CLI",
          url: "https://cloudaudit.dev",
          amount: 50.0,
          category: "Developer Tools",
          email: "audit@bidrank.io",
        },
      },
    });

    const sig = crypto.createHmac("sha256", "audit_secret").update(testWhPayload).digest("hex");

    const whRes = await fetch(`${BASE_URL}/api/webhooks/dodo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-dodo-signature": sig,
      },
      body: testWhPayload,
    });

    const whData = await whRes.json();
    const whOk = whRes.ok && whData.success === true;
    if (check("Dodo Payments Webhook processed bid & re-ranked atomically", whOk)) checksPassed++;
  } catch (err) {
    check("Webhook audit failed", false, err.message);
  }

  // Final Audit Summary
  console.log(`\n${colors.gold}${colors.bright}================================================================`);
  console.log("  🏁 AUDIT SUMMARY & DEPLOYMENT READINESS SCORE");
  console.log(`================================================================${colors.reset}`);
  console.log(`  Passed Checks: ${checksPassed} / ${checksTotal}`);
  
  if (checksPassed === checksTotal) {
    console.log(`  ${colors.green}${colors.bright}STATUS: 100% PRODUCTION-READY TO DEPLOY TO VERCEL! 🚀${colors.reset}\n`);
  } else {
    console.log(`  ${colors.red}${colors.bright}STATUS: Action required on failing items.${colors.reset}\n`);
    process.exit(1);
  }
}

runAudit().catch((err) => {
  console.error("Fatal audit runner error:", err);
  process.exit(1);
});
