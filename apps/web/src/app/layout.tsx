import type { Metadata, Viewport } from "next";
import { Fraunces, Noto_Sans_Tamil, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";

import { RouteFrame } from "@/components/application/route-frame";
import { MotionRuntime } from "@/components/motion/motion-runtime";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { defaultMetadata } from "@/config/metadata";
import { PlatformProvider } from "@/features/enrollment/platform-provider";

import "./globals.css";

const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const englishFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
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
      className={`${displayFont.variable} ${englishFont.variable} ${tamilFont.variable}`}
    >
      <body>
        <PlatformProvider>
          <MotionRuntime />
          <ScrollProgress />
          <a
            href="#main-content"
            className="rounded-button bg-deep-navy focus:ring-focus fixed top-3 left-3 z-[100] -translate-y-24 px-4 py-3 font-semibold text-white transition-transform focus:translate-y-0 focus:outline-none"
          >
            Skip to main content
          </a>
          <RouteFrame>{children}</RouteFrame>
        </PlatformProvider>
      </body>
    </html>
  );
}
