import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "@/lib/auth";
import { BottomNav } from "./components/BottomNav";
import { TopNav } from "./components/TopNav";
import { AppWrapper } from "./components/AppWrapper";

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HuntManifest | Waterfowl Logistics",
  description: "Logistics for Waterfowl. Track hunts, manage gear inventory, and log success. Created by Talkin' Timber.",
  keywords: ["waterfowl", "duck hunting", "hunt tracker", "hunting log", "gear inventory", "logistics"],
  authors: [{ name: "Talkin' Timber" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HuntManifest",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafbfc" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${plusJakarta.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AppWrapper>
              <div className="min-h-screen flex flex-col relative">
                {/* Mesh gradient ambient layer — dark mode only */}
                <div
                  className="hidden dark:block fixed inset-0 pointer-events-none"
                  aria-hidden="true"
                  style={{
                    background: `
                      radial-gradient(ellipse 60% 50% at 10% 20%, rgba(22, 102, 83, 0.06) 0%, transparent 70%),
                      radial-gradient(ellipse 50% 40% at 85% 75%, rgba(245, 184, 0, 0.04) 0%, transparent 70%),
                      radial-gradient(ellipse 80% 60% at 50% 100%, rgba(30, 58, 95, 0.08) 0%, transparent 60%)
                    `,
                    zIndex: 0,
                  }}
                />
                <TopNav />
                <main className="flex-1 pb-24 pt-4 px-4 max-w-md mx-auto w-full relative z-[1]">
                  {children}
                </main>
                <BottomNav />
              </div>
            </AppWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

