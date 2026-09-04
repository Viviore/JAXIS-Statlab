import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Mrs_Saint_Delafield } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { RouteProgressBar } from "./components/layout/RouteProgressBar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-code",
  display: "swap",
});

const signatureFont = Mrs_Saint_Delafield({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-signature",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JAXIS StatLab Workspace",
  description: "Interactive statistical analysis tool, dataset workspace, and data modeling dashboard.",
  icons: {
    icon: "/jaxislogo.png",
    shortcut: "/jaxislogo.png",
    apple: "/jaxislogo.png",
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
      className={`${inter.variable} ${jetbrainsMono.variable} ${signatureFont.variable}`}
      style={{ backgroundColor: "#010114" }}
    >
      <body className="font-sans antialiased" style={{ backgroundColor: "#010114" }}>
        <Suspense fallback={null}>
          <RouteProgressBar />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
