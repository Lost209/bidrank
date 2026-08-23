import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const query = searchParams.get("q");

    let projects = store.getProjects();

    if (category && category !== "All") {
      projects = projects.filter((p) => p.category === category);
    }

    if (query) {
      const q = query.toLowerCase();
      projects = projects.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)
      );
    }

    const stats = store.getLeaderboardStats();
    const activities = store.getActivities();

    return NextResponse.json({
      projects,
      stats,
      activities,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      slug,
      title,
      tagline,
      description,
      url,
      category,
      email,
      amount,
      paymentId,
      paymentGateway,
      favicon,
      screenshot,
    } = body;

    if (!email || !amount || amount < 1) {
      return NextResponse.json({ error: "Email and valid amount (min $1) are required" }, { status: 400 });
    }

    const result = store.processBid({
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      title,
      tagline,
      description,
      url,
      category,
      email,
      amount: Number(amount),
      paymentId: paymentId || `sim_${Date.now()}`,
      paymentGateway: paymentGateway || "test_simulation",
      favicon,
      screenshot,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process bid" }, { status: 500 });
  }
}
