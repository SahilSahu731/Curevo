export type BlogPost = {
  slug: string;
  status: "draft" | "published";
  category: "Product" | "Privacy" | "Safety";
  title: string;
  summary: string;
  author: string;
  reviewedBy: string;
  safetyReview: string;
  publishedAt: string;
  updatedAt: string;
  paragraphs: string[];
  citations: { label: string; href: string }[];
  corrections: { date: string; note: string }[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "prototype-review-status",
    status: "published",
    category: "Product",
    title: "Why this prototype remains review-only",
    summary: "What the current release demonstrates and which approvals still block public launch.",
    author: "Curevo product maintainers",
    reviewedBy: "Repository governance review",
    safetyReview: "Reviewed for non-clinical product boundaries.",
    publishedAt: "2026-08-03",
    updatedAt: "2026-08-03",
    paragraphs: [
      "Curevo is a pre-release focus and everyday-wellbeing prototype. It is not an approved healthcare or emergency service.",
      "A public release remains blocked until an accountable operating entity, target jurisdiction, safety owner, privacy contact, support process, accessibility evidence, and production infrastructure are approved.",
      "Review deployments should use synthetic information. Do not enter sensitive notes or urgent concerns that need a human response.",
    ],
    citations: [
      { label: "About the prototype", href: "/about" },
      { label: "Terms of use", href: "/terms" },
    ],
    corrections: [],
  },
  {
    slug: "account-data-controls",
    status: "published",
    category: "Privacy",
    title: "Account data controls in this release",
    summary: "A plain-language guide to export, consent revocation, and account deletion controls.",
    author: "Curevo product maintainers",
    reviewedBy: "Repository privacy review",
    safetyReview: "Reviewed for privacy and non-clinical product boundaries.",
    publishedAt: "2026-08-03",
    updatedAt: "2026-08-03",
    paragraphs: [
      "Signed-in users can request a portable account export from Profile. The export is generated only after server-side authentication and excludes other users' data.",
      "Profile also provides controls to delete personal focus sessions, routines, reflections, feedback, notifications, and identifying account fields.",
      "Support requests should avoid sensitive health details. The public contact form is intended for product, access, privacy, accessibility, and complaint handling.",
    ],
    citations: [
      { label: "Privacy notice", href: "/privacy" },
      { label: "Account settings", href: "/profile" },
      { label: "Contact support", href: "/contact" },
    ],
    corrections: [],
  },
  {
    slug: "reflection-without-scoring",
    status: "published",
    category: "Safety",
    title: "Why Curevo reflections do not produce a score",
    summary: "A note can reveal a useful condition without reducing a person to a number.",
    author: "Curevo product maintainers",
    reviewedBy: "Repository safety review",
    safetyReview: "Reviewed to avoid diagnostic, treatment, and outcome claims.",
    publishedAt: "2026-08-03",
    updatedAt: "2026-08-03",
    paragraphs: [
      "Curevo reflections record the words and 1-to-5 availability levels a member chooses. They do not combine those answers into a mental-health, productivity, or risk score.",
      "The progress page describes completed focus minutes, common reflection words, and routine activity. These patterns are prompts for curiosity, not assessment results or instructions.",
      "Reflection notes are stored with the member account. Members should avoid information they would not place in a prototype environment and seek qualified help for ongoing or worsening distress.",
    ],
    citations: [
      { label: "About the approach", href: "/about" },
      { label: "Privacy notice", href: "/privacy" },
    ],
    corrections: [],
  },
];

export const publishedBlogPosts = blogPosts.filter((post) => post.status === "published");
export const findBlogPost = (slug: string, includeDrafts = false) => blogPosts.find((post) => post.slug === slug && (includeDrafts || post.status === "published"));
