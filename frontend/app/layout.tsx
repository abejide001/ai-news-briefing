import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-news-briefing-ok98.vercel.app"),
  title: "AI News Briefing",
  description:
    "AI-powered news briefing that aggregates, deduplicates, and summarizes global news.",

  openGraph: {
    title: "AI News Briefing",
    description:
      "Get concise AI-powered summaries from top global news sources.",
    url: "https://ai-news-briefing-ok98.vercel.app",
    siteName: "AI News Briefing",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI News Briefing preview",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "AI News Briefing",
    description:
      "Get concise AI-powered summaries from top global news sources.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
