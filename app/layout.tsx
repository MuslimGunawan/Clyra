import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/ToastProvider";
import TermsGatekeeper from "@/components/TermsGatekeeper";
import SecurityShield from "@/components/SecurityShield";
import SecretAdminTrigger from "@/components/SecretAdminTrigger";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#08090d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://clyra.vercel.app"),
  title: {
    default: "Clyra — Personal Creative & Productivity Workspace",
    template: "%s | Clyra",
  },
  description:
    "All-in-one dark minimalist workspace featuring 11+ client-side developer tools, curated AI prompts vault, and creative web projects portfolio.",
  keywords: [
    "clyra",
    "developer tools",
    "image compressor",
    "video downloader",
    "json formatter",
    "qr generator with logo",
    "ai prompt vault",
    "midjourney prompts",
    "password generator",
    "svg to jsx",
    "productivity hub",
    "client-side safe",
    "web tools",
  ],
  authors: [{ name: "Muslim Gunawan", url: "https://github.com/MuslimGunawan" }],
  creator: "Muslim Gunawan",
  publisher: "Clyra",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://clyra.vercel.app",
    siteName: "Clyra",
    title: "Clyra — Personal Creative & Productivity Workspace",
    description:
      "All-in-one dark minimalist workspace for 11+ client-side tools, AI prompt collection, and web projects portfolio.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "Clyra Workspace Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clyra — Personal Creative & Productivity Workspace",
    description:
      "11+ Client-side developer tools, AI prompt vault, and web projects showcase with dark aesthetic.",
    images: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
    ],
    creator: "@clyra",
  },
  alternates: {
    canonical: "https://clyra.vercel.app",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://clyra.vercel.app/#website",
        url: "https://clyra.vercel.app",
        name: "Clyra",
        description: "Personal Creative & Productivity Workspace",
        publisher: {
          "@type": "Person",
          name: "Muslim Gunawan",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "Clyra Tools Hub",
        operatingSystem: "All (Web Browser)",
        applicationCategory: "DeveloperApplication",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
    ],
  };

  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#08090d] text-slate-100 selection:bg-indigo-500/30 selection:text-white"
      >
        <ToastProvider>
          <SecurityShield />
          <SecretAdminTrigger />
          <Navbar />
          <div className="flex-1 flex flex-col">{children}</div>
          <Footer />
          <TermsGatekeeper />
        </ToastProvider>
      </body>
    </html>
  );
}
