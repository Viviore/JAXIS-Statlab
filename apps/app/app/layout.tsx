import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      style={{ backgroundColor: "#010114" }}
    >
      <body className="font-sans antialiased" style={{ backgroundColor: "#010114" }}>
        {children}
      </body>
    </html>
  );
}
