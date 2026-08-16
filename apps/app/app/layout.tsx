import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";

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
      className={`${disketMono.variable} ${inter.variable}`}
    >
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
