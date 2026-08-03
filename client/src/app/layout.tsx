import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Curevo SmartQueue Prototype",
    template: "%s | Curevo",
  },
  description: "A pre-release demonstration of appointment, queue, and video-visit workflows.",
  keywords: ["clinic queue management", "doctor appointments", "telehealth", "medical records", "Curevo"],
  authors: [{ name: "Curevo" }],
  creator: "Curevo",
  publisher: "Curevo",
  openGraph: {
    title: "Curevo SmartQueue",
    description: "Pre-release appointment and clinic queue workflow demonstration.",
    url: "/",
    siteName: "Curevo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Curevo SmartQueue",
    description: "Pre-release appointment and clinic queue workflow demonstration.",
  },
  alternates: {
    canonical: "/",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
