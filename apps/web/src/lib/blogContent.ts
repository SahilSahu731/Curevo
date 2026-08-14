export type BlogPost = {
  slug: string;
  status: "draft" | "published";
  category: "Product" | "Privacy" | "Safety";
  title: string;
  summary: string;
  author: string;
  reviewedBy: string;
  medicalReview: string;
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
    medicalReview: "Not applicable; this article contains no clinical guidance.",
    publishedAt: "2026-08-03",
    updatedAt: "2026-08-03",
    paragraphs: [
      "Curevo is a pre-release software prototype for evaluating appointment, clinic queue, medical-record, and video-visit workflows. It is not an approved healthcare service.",
      "A public release remains blocked until an accountable operating entity, target jurisdiction, clinical-safety owner, privacy contact, support process, and production infrastructure are approved.",
      "Review deployments should use synthetic data. Do not enter real health information, clinician credentials, or urgent medical concerns.",
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
    medicalReview: "Not applicable; this article contains no clinical guidance.",
    publishedAt: "2026-08-03",
    updatedAt: "2026-08-03",
    paragraphs: [
      "Signed-in users can request a portable account export from Profile. The export is generated only after server-side authentication and excludes other users' data.",
      "Profile also provides controls to revoke video-visit consent and request account deletion. Clinical and audit records may be retained or anonymized where the documented retention policy requires it.",
      "Support requests should avoid medical details. The public contact form is intended for product, access, privacy, accessibility, and complaint handling.",
    ],
    citations: [
      { label: "Privacy notice", href: "/privacy" },
      { label: "Account settings", href: "/profile" },
      { label: "Contact support", href: "/contact" },
    ],
    corrections: [],
  },
  {
    slug: "wellness-check-limitations",
    status: "published",
    category: "Safety",
    title: "What the wellness check can and cannot do",
    summary: "The boundary between a local educational prompt and medical assessment.",
    author: "Curevo product maintainers",
    reviewedBy: "Repository safety review",
    medicalReview: "No clinician has validated this tool; it must not be used for care decisions.",
    publishedAt: "2026-08-03",
    updatedAt: "2026-08-03",
    paragraphs: [
      "The wellness check uses simple rules in the browser. It is an educational demonstration and is not a diagnostic, triage, risk-scoring, or treatment system.",
      "Its output must not replace a qualified clinician or emergency service. Severe symptoms or immediate danger require the emergency service for the user's location.",
      "Answers are held in page memory for the current interaction. Users should still avoid entering information they would not place in a prototype environment.",
    ],
    citations: [
      { label: "Open the wellness check", href: "/health-check" },
      { label: "Privacy notice", href: "/privacy" },
    ],
    corrections: [],
  },
];

export const publishedBlogPosts = blogPosts.filter((post) => post.status === "published");
export const findBlogPost = (slug: string, includeDrafts = false) => blogPosts.find((post) => post.slug === slug && (includeDrafts || post.status === "published"));
