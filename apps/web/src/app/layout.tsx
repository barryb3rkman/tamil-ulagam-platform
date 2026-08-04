import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Tamil } from "next/font/google";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { MotionRuntime } from "@/components/motion/motion-runtime";
import { defaultMetadata } from "@/config/metadata";

import "./globals.css";

const englishFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const tamilFont = Noto_Sans_Tamil({
  subsets: ["tamil"],
  variable: "--font-noto-tamil",
  display: "swap",
});

export const metadata: Metadata = defaultMetadata;

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#F8F5EE",
  width: "device-width",
  initialScale: 1,
};

export interface RootLayoutProps {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${englishFont.variable} ${tamilFont.variable}`}
    >
      <body>
        <MotionRuntime />
        <a
          href="#main-content"
          className="rounded-button bg-deep-navy focus:ring-focus fixed top-3 left-3 z-[100] -translate-y-24 px-4 py-3 font-semibold text-white transition-transform focus:translate-y-0 focus:outline-none"
        >
          Skip to main content
        </a>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main id="main-content" className="flex-1" tabIndex={-1}>
            <div data-route-transition="enter">{children}</div>
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
