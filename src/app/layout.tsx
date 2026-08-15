import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ServiceWorkerRegistrar } from "./ServiceWorkerRegistrar";
import "./globals.css";

export const metadata: Metadata = {
  title: "EchoMap",
  description: "用聲音建立你的個人化學習地圖",
  applicationName: "EchoMap",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "EchoMap",
    statusBarStyle: "default",
  },
  // Next only emits the standard `mobile-web-app-capable`; iOS 17.3 and earlier need the legacy name to run standalone.
  other: { "apple-mobile-web-app-capable": "yes" },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/icons/apple-touch-icon.png", sizes: "180x180" },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f4f3ee",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>
        {children}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
