import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const indexingApproved = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

  return {
    rules: indexingApproved ? {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin-dashboard", "/doctor-dashboard", "/patient-dashboard", "/profile", "/queue"],
    } : {
      userAgent: "*",
      disallow: "/",
    },
    sitemap: indexingApproved ? `${baseUrl}/sitemap.xml` : undefined,
  };
}
