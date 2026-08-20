import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Permanent_Marker } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SITE } from "@/lib/config";

// WALEED Design Bible, Ch.4 Part I §3 — Font Selection:
// Inter for interface text, JetBrains Mono for technical content.
// "Never use more than two font families." Permanent Marker is the one
// deliberate exception: it's the brand wordmark typeface (matches the
// hand-drawn "Failure" logotype), used only for the logo, never for body
// or heading copy.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});
const jbMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbmono",
  weight: ["400", "500", "600"],
});
const marker = Permanent_Marker({
  subsets: ["latin"],
  variable: "--font-marker",
  weight: "400",
});

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.tagline,
};

// Runs before paint so the stored theme applies with no flash —
// Design Bible §4: "theme changes occurring instantly without page refreshes."
const themeInitScript = `
(function () {
  try {
    var t = localStorage.getItem('waleed-theme') || 'system';
    var dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jbMono.variable} ${marker.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
