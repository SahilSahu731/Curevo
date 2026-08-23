import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journal | Curevo",
  description: "Practical, maintainer-reviewed notes about focus, privacy, safety, and the choices behind Curevo.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
