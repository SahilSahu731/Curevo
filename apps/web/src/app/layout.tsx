import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Curevo | Small steps for steadier days",
    template: "%s | Curevo",
  },
  description: "Self-guided paths for focus, reflection, routines, and everyday wellbeing—made to meet you where you are.",
  keywords: ["self-guided wellbeing", "focus tools", "procrastination support", "reflection prompts", "gentle routines", "Curevo"],
  authors: [{ name: "Curevo" }],
  creator: "Curevo",
  publisher: "Curevo",
  openGraph: {
    title: "Curevo | Small steps for steadier days",
    description: "Self-guided paths for focus, reflection, routines, and everyday wellbeing.",
    url: "/",
    siteName: "Curevo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Curevo | Small steps for steadier days",
    description: "Self-guided paths for focus, reflection, routines, and everyday wellbeing.",
  },
  robots: {
    index: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",
    follow: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
