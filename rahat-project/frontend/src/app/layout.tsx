import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { CommandMenu } from "@/components/command-menu";
import { PageTransition } from "@/components/page-transition";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "ORBITA — Премиальный отдых",
  description: "Система бронирования лучших мест отдыха в Алматы",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-zinc-950 text-slate-200 selection:bg-orange-500/30`}
      >
        <ThemeProvider>
          <div className="min-h-screen flex w-full relative overflow-hidden">
            {/* Decorative Blur Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />

            <Sidebar />
            <main className="main-content flex-1 pb-24 md:pb-0 z-10 relative">
              <PageTransition>
                {children}
              </PageTransition>
            </main>
            <MobileNav />
          </div>
          <CommandMenu />
          <Toaster theme="dark" position="top-right" closeButton richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
