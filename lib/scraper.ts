import * as cheerio from "cheerio";
import { ScrapedMetadata } from "./types";

export async function scrapeUrlMetadata(targetUrl: string): Promise<ScrapedMetadata> {
  const result: ScrapedMetadata = {
    isSafe: true,
    securityFlags: [],
  };

  try {
    let normalizedUrl = targetUrl.trim();
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    const parsed = new URL(normalizedUrl);
    const domain = parsed.hostname.toLowerCase();

    // Check basic disallowed / suspicious patterns
    const suspiciousTlds = [".xyz", ".top", ".buzz", ".work", ".click", ".fit", ".gq", ".cf", ".tk", ".ml", ".ga"];
    if (suspiciousTlds.some((tld) => domain.endsWith(tld))) {
      result.securityFlags.push("Suspicious low-reputation TLD");
    }

    if (domain.includes("free-crypto") || domain.includes("airdrop-claim") || domain.includes("casino")) {
      result.isSafe = false;
      result.securityFlags.push("Matched known scam/spam keyword pattern");
    }

    const response = await fetch(normalizedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 BidrankBot/1.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(5000), // 5s timeout
    });

    if (!response.ok) {
      // Fallback domain-based defaults
      result.title = domain.replace(/^www\./, "").split(".")[0];
      result.favicon = `https://api.dicebear.com/7.x/identicon/svg?seed=${domain}`;
      return result;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Title resolution
    result.title = 
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      $("title").text().trim() ||
      domain;

    // Description resolution
    result.description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="twitter:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      "";

    // OG Image
    let ogImage =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content");

    if (ogImage && !ogImage.startsWith("http")) {
      ogImage = new URL(ogImage, normalizedUrl).href;
    }
    result.ogImage = ogImage;

    // Favicon resolution
    let favicon =
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      $('link[rel="apple-touch-icon"]').attr("href");

    if (favicon) {
      if (!favicon.startsWith("http")) {
        favicon = new URL(favicon, normalizedUrl).href;
      }
      result.favicon = favicon;
    } else {
      result.favicon = `${parsed.protocol}//${parsed.host}/favicon.ico`;
    }

    return result;
  } catch (error) {
    // Return graceful fallback
    const domain = targetUrl.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
    return {
      title: domain.split(".")[0] || "Indie Project",
      description: "Fast, modern indie application.",
      favicon: `https://api.dicebear.com/7.x/identicon/svg?seed=${domain}`,
      isSafe: true,
      securityFlags: [],
    };
  }
}
