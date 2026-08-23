export type Category = 
  | "AI & ML"
  | "Developer Tools"
  | "SaaS"
  | "Productivity"
  | "Design & Creative"
  | "Marketing & SEO"
  | "Finance & Crypto"
  | "Mobile & Apps"
  | "Other";

export interface Project {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description?: string;
  url: string;
  favicon_url?: string;
  screenshot_url?: string;
  category: Category;
  submitter_email: string;
  total_amount_usd: number;
  current_rank: number;
  previous_rank?: number;
  all_time_clicks: number;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BidRecord {
  id: string;
  project_id: string;
  project_slug: string;
  project_title: string;
  amount_usd: number;
  payment_id: string;
  payment_gateway: "dodo_payments" | "stripe" | "test_simulation";
  customer_email: string;
  created_at: string;
}

export interface ActivityEvent {
  id: string;
  type: "new_project" | "boost_bid" | "outbid_crown" | "rank_jump";
  project_title: string;
  project_slug: string;
  amount_usd: number;
  old_rank?: number;
  new_rank?: number;
  outbid_project_title?: string;
  timestamp: string;
}

export interface ScrapedMetadata {
  title?: string;
  description?: string;
  favicon?: string;
  ogImage?: string;
  isSafe: boolean;
  securityFlags: string[];
}
