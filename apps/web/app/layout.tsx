import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "./components/SmoothScroll";

const disketMono = localFont({
  src: "./fonts/Disket-Mono-Regular.ttf",
  variable: "--font-disket",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
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
    <html
      lang="en"
      className={`${disketMono.variable} ${inter.variable}`}
      style={{ backgroundColor: "#010114" }}
    >
      <body className="font-sans antialiased" style={{ backgroundColor: "#010114" }}>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
