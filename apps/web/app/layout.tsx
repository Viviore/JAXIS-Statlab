import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
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

import SmoothScroll from "./components/SmoothScroll";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable}`} style={{ backgroundColor: "#000814" }}>
      <body className={montserrat.className} style={{ backgroundColor: "#000814" }}>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
