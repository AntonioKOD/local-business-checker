import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {GoogleAnalytics} from "@next/third-parties/google"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Local Business Website Checker",
  description: "Find local businesses on Google and check if they have accessible websites",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}
        <GoogleAnalytics gaId="G-E2T6B7DTY4" />
      </body>
    </html>
  );
}
