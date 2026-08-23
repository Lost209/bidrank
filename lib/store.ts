import { Project, BidRecord, ActivityEvent, Category } from "./types";
import { INITIAL_PROJECTS, INITIAL_ACTIVITY } from "./seed-data";

class LeaderboardStore {
  private projects: Project[] = [];
  private bids: BidRecord[] = [];
  private activities: ActivityEvent[] = [];
  private listeners: Set<() => void> = new Set();
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;
    this.projects = [...INITIAL_PROJECTS];
    this.activities = [...INITIAL_ACTIVITY];
    this.recalculateRanks();
    this.initialized = true;
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public getProjects(): Project[] {
    this.init();
    return [...this.projects].sort((a, b) => b.total_amount_usd - a.total_amount_usd);
  }

  public getProjectBySlug(slug: string): Project | undefined {
    this.init();
    return this.projects.find((p) => p.slug.toLowerCase() === slug.toLowerCase());
  }

  public getActivities(): ActivityEvent[] {
    this.init();
    return [...this.activities];
  }

  public getLeaderboardStats() {
    this.init();
    const activeProjects = this.projects.filter((p) => p.is_active);
    const totalVolumeUsd = activeProjects.reduce((acc, p) => acc + p.total_amount_usd, 0);
    const totalClicks = activeProjects.reduce((acc, p) => acc + p.all_time_clicks, 0);
    const topProject = activeProjects[0];
    const topBid = topProject ? topProject.total_amount_usd : 0;
    const minBidToEnter = 5.0; // Minimum initial bid to enter leaderboard

    return {
      totalProjects: activeProjects.length,
      totalVolumeUsd,
      totalClicks,
      topProject,
      topBid,
      minBidToEnter,
    };
  }

  public getMinBidToOvertake(targetRank: number, currentSlug?: string): number {
    this.init();
    const sorted = this.getProjects();
    const currentProject = currentSlug ? this.getProjectBySlug(currentSlug) : undefined;
    const currentTotal = currentProject ? currentProject.total_amount_usd : 0;

    if (sorted.length === 0) return 5.0;

    // Target rank 1 means beating current #1
    const targetIndex = Math.max(0, targetRank - 1);
    if (targetIndex >= sorted.length) {
      // Just need min bid to join bottom
      return Math.max(5.0, 5.0 - currentTotal);
    }

    const targetProject = sorted[targetIndex];
    if (currentProject && targetProject.slug === currentProject.slug) {
      return 5.0; // Already at or above this rank, nominal boost
    }

    const amountNeeded = targetProject.total_amount_usd - currentTotal + 1.0;
    return Math.max(5.0, Math.ceil(amountNeeded));
  }

  public recordClick(slug: string): void {
    const project = this.projects.find((p) => p.slug === slug);
    if (project) {
      project.all_time_clicks += 1;
      this.notify();
    }
  }

  public processBid(params: {
    slug: string;
    title: string;
    tagline: string;
    description?: string;
    url: string;
    category: Category;
    email: string;
    amount: number;
    paymentId: string;
    paymentGateway?: "dodo_payments" | "stripe" | "test_simulation";
    favicon?: string;
    screenshot?: string;
  }): {
    success: boolean;
    project: Project;
    oldRank?: number;
    newRank: number;
    outbidProjects: { title: string; email: string; oldRank: number; newRank: number }[];
  } {
    this.init();
    const slug = params.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-");
    let project = this.projects.find((p) => p.slug === slug);
    const previousSnapshot = this.projects.map((p) => ({
      slug: p.slug,
      title: p.title,
      email: p.submitter_email,
      rank: p.current_rank,
      amount: p.total_amount_usd,
    }));

    const isNew = !project;
    const oldRank = project ? project.current_rank : undefined;

    if (project) {
      project.total_amount_usd += params.amount;
      project.updated_at = new Date().toISOString();
      if (params.title) project.title = params.title;
      if (params.tagline) project.tagline = params.tagline;
      if (params.description) project.description = params.description;
      if (params.url) project.url = params.url;
      if (params.category) project.category = params.category;
      if (params.favicon) project.favicon_url = params.favicon;
      if (params.screenshot) project.screenshot_url = params.screenshot;
    } else {
      project = {
        id: `proj-${Date.now()}`,
        slug,
        title: params.title || slug,
        tagline: params.tagline || "An awesome indie project",
        description: params.description || "",
        url: params.url
          ? params.url.startsWith("http")
            ? params.url
            : `https://${params.url}`
          : `https://${slug}.com`,
        favicon_url: params.favicon || `https://api.dicebear.com/7.x/identicon/svg?seed=${slug}`,
        screenshot_url: params.screenshot || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
        category: params.category || "SaaS",
        submitter_email: params.email,
        total_amount_usd: params.amount,
        current_rank: 999,
        previous_rank: 999,
        all_time_clicks: 0,
        is_verified: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.projects.push(project);
    }

    // Record the immutable bid
    const bidRecord: BidRecord = {
      id: `bid-${Date.now()}`,
      project_id: project.id,
      project_slug: project.slug,
      project_title: project.title,
      amount_usd: params.amount,
      payment_id: params.paymentId,
      payment_gateway: params.paymentGateway || "dodo_payments",
      customer_email: params.email,
      created_at: new Date().toISOString(),
    };
    this.bids.unshift(bidRecord);

    // Recalculate ranks
    this.recalculateRanks();

    const newRank = project.current_rank;

    // Detect who got outbid
    const outbidProjects: { title: string; email: string; oldRank: number; newRank: number }[] = [];
    this.projects.forEach((p) => {
      if (p.slug !== project!.slug) {
        const prev = previousSnapshot.find((s) => s.slug === p.slug);
        if (prev && p.current_rank > prev.rank) {
          outbidProjects.push({
            title: p.title,
            email: p.submitter_email,
            oldRank: prev.rank,
            newRank: p.current_rank,
          });
        }
      }
    });

    // Create activity event
    let eventType: ActivityEvent["type"] = "boost_bid";
    let outbidTitle: string | undefined = undefined;

    if (isNew) {
      eventType = "new_project";
    } else if (newRank === 1 && oldRank !== 1) {
      eventType = "outbid_crown";
      const previousLeader = previousSnapshot.find((s) => s.rank === 1);
      outbidTitle = previousLeader ? previousLeader.title : undefined;
    } else if (oldRank && newRank < oldRank) {
      eventType = "rank_jump";
      const overtaken = outbidProjects[0];
      outbidTitle = overtaken ? overtaken.title : undefined;
    }

    const activity: ActivityEvent = {
      id: `act-${Date.now()}`,
      type: eventType,
      project_title: project.title,
      project_slug: project.slug,
      amount_usd: params.amount,
      old_rank: oldRank,
      new_rank: newRank,
      outbid_project_title: outbidTitle,
      timestamp: "Just now",
    };
    this.activities.unshift(activity);
    if (this.activities.length > 20) this.activities.pop();

    this.notify();

    return {
      success: true,
      project,
      oldRank,
      newRank,
      outbidProjects,
    };
  }

  public moderateProject(slug: string, action: "delist" | "verify" | "activate"): boolean {
    const project = this.projects.find((p) => p.slug === slug);
    if (!project) return false;

    if (action === "delist") {
      project.is_active = false;
    } else if (action === "verify") {
      project.is_verified = true;
    } else if (action === "activate") {
      project.is_active = true;
    }

    this.recalculateRanks();
    this.notify();
    return true;
  }

  private recalculateRanks(): void {
    const active = this.projects.filter((p) => p.is_active);
    active.sort((a, b) => {
      if (b.total_amount_usd !== a.total_amount_usd) {
        return b.total_amount_usd - a.total_amount_usd;
      }
      return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
    });

    active.forEach((p, idx) => {
      p.previous_rank = p.current_rank;
      p.current_rank = idx + 1;
    });
  }
}

// Global Singleton for server-side persistence in memory across route handlers
const globalForStore = globalThis as unknown as { leaderboardStore: LeaderboardStore };
export const store = globalForStore.leaderboardStore || new LeaderboardStore();
if (process.env.NODE_ENV !== "production") globalForStore.leaderboardStore = store;
