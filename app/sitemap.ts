import { MetadataRoute } from "next";
import { store } from "@/lib/store";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bidrank.vercel.app";
  const projects = store.getProjects();

  const projectUrls = projects.map((p) => ({
    url: `${baseUrl}/project/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "daily" as const,
    priority: p.current_rank === 1 ? 1.0 : p.current_rank <= 5 ? 0.9 : 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 1.0,
    },
    ...projectUrls,
  ];
}
