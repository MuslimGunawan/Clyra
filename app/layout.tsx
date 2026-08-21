import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/ToastProvider";
import TermsGatekeeper from "@/components/TermsGatekeeper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clyra — Personal Workspace, Smart Tools Hub & AI Gallery",
  description: "Minimalist, elegant dark-mode personal hub for instant browser-based tools, AI prompt collection with preview thumbnails, and web portfolio.",
  keywords: ["developer tools", "image compressor", "qr generator", "video downloader", "ai prompts", "nextjs", "clyra"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body 
        suppressHydrationWarning 
        className="min-h-full flex flex-col bg-[#08090d] text-slate-100 selection:bg-indigo-500/30 selection:text-white"
      >
        <ToastProvider>
          <Navbar />
          <div className="flex-1 flex flex-col">{children}</div>
          <Footer />
          <TermsGatekeeper />
        </ToastProvider>
      </body>
    </html>
  );
}
