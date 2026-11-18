import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dhwani — Ek Midnight Rose",
  description: "Princess Day ke liye ek chhoti si kahaani, Daksh Manish Bisht ki taraf se.",
  applicationName: "Ek Midnight Rose",
  keywords: ["Princess Day", "Dhwani", "midnight rose", "Hinglish letter"],
  openGraph: {
    title: "Dhwani — Ek Midnight Rose",
    description: "Kuch yaadein, kuch alfaaz aur ek chhoti si royal wish.",
    type: "website",
    locale: "en_IN",
    siteName: "Ek Midnight Rose"
  },
  twitter: {
    card: "summary_large_image",
    title: "Dhwani — Ek Midnight Rose",
    description: "Kuch yaadein, kuch alfaaz aur ek chhoti si royal wish."
  },
  icons: { icon: "/icon.svg" },
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  themeColor: "#0b0609",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=DM+Sans:wght@400;500;600;700&family=Great+Vibes&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
