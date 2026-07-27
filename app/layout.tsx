import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Daily Budget Generator - Smart Random Allocation Engine",
  description:
    "Production-grade web dashboard for generating natural random daily budget distributions with constraint validation, inline table editing, statistics, Excel & CSV export/import, and history management.",
  keywords: [
    "budget generator",
    "daily budget",
    "random allocation",
    "excel export",
    "financial dashboard",
    "nextjs dashboard",
  ],
  authors: [{ name: "Engineering Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased selection:bg-primary/20 selection:text-primary">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
