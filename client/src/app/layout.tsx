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
    default: "Curevo SmartQueue - Real-time Medical OS",
    template: "%s | Curevo",
  },
  description: "Book doctors, track live clinic queues, manage telehealth visits, and access prescriptions from one secure healthcare dashboard.",
  keywords: ["clinic queue management", "doctor appointments", "telehealth", "medical records", "Curevo"],
  authors: [{ name: "Curevo" }],
  creator: "Curevo",
  publisher: "Curevo",
  openGraph: {
    title: "Curevo SmartQueue",
    description: "Real-time queue, appointment, telehealth, and medical records platform for modern clinics.",
    url: "/",
    siteName: "Curevo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Curevo SmartQueue",
    description: "Real-time medical OS for clinics, doctors, and patients.",
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
