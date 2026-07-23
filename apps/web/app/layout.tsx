import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "JAXIS StatLab — Enterprise Statistical Infrastructure & Intelligence Platform",
  description: "Mission-critical workflow platform connecting clients, statisticians, QA leads, and finance teams from intake to payout with strict compliance gates.",
  keywords: ["statistical analysis", "data intelligence", "research QA", "statistical modeling", "enterprise SaaS"],
  openGraph: {
    title: "JAXIS StatLab — Enterprise Statistical Infrastructure",
    description: "High-performance statistical workflow platform built for enterprise research and clinical compliance.",
    url: "https://jaxisstatlab.com",
    siteName: "JAXIS StatLab",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
