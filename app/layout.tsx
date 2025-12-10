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
    statusBarStyle: "default",
    title: "HuntManifest",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AppWrapper>
              <div className="min-h-screen flex flex-col">
                <TopNav />
                <main className="flex-1 pb-24 pt-4 px-4 max-w-md mx-auto w-full">
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

