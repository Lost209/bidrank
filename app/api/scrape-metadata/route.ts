import { NextRequest, NextResponse } from "next/server";
import { scrapeUrlMetadata } from "@/lib/scraper";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Valid URL is required" }, { status: 400 });
    }

    const metadata = await scrapeUrlMetadata(url);
    return NextResponse.json(metadata);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to scrape URL metadata" },
      { status: 500 }
    );
  }
}
