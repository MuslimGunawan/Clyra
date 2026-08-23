"use client";

import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback, 
  ReactNode 
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { createEphemeralToken } from "@/lib/cryptoTokens";

interface PageTransitionContextType {
  navigateTo: (href: string) => void;
  isTransitioning: boolean;
}

const PageTransitionContext = createContext<PageTransitionContextType>({
  navigateTo: () => {},
  isTransitioning: false,
});

export const usePageTransition = () => useContext(PageTransitionContext);

export default function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Animation states
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [isEntering, setIsEntering] = useState<boolean>(true);
  const [currentPath, setCurrentPath] = useState<string>(pathname);

  // Trigger Entrance animation when pathname changes
  useEffect(() => {
    setCurrentPath(pathname);
    setIsExiting(false);
    setIsEntering(true);

    const timer = setTimeout(() => {
      setIsEntering(false);
    }, 380);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Smooth Navigate with Exit Animation -> Route Push -> Enter Animation
  const navigateTo = useCallback((href: string) => {
    if (!href || href === pathname) return;

    // External or hash links
    if (href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:")) {
      window.location.href = href;
      return;
    }

    // Phase 1: Start Exit Animation (Fade Out + Slide Up)
    setIsExiting(true);

    setTimeout(() => {
      // Phase 2: Perform Router Navigation
      try {
        const dynamicToken = createEphemeralToken(href);
        router.push(`/v/${dynamicToken}`);
      } catch {
        router.push(href);
      }
    }, 160); // 160ms exit duration
  }, [pathname, router]);

  return (
    <PageTransitionContext.Provider value={{ navigateTo, isTransitioning: isExiting || isEntering }}>
      {/* 1. Top Glowing Laser Loading Indicator */}
      {(isExiting || isEntering) && (
        <div className="fixed top-0 left-0 right-0 h-[3px] z-[9999] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 shadow-[0_0_16px_rgba(99,102,241,1)] transition-all animate-pulse" />
      )}

      {/* 2. Animated Content Wrapper with High Contrast Visible Transitions */}
      <main
        key={currentPath}
        className={`flex-1 flex flex-col w-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isExiting
            ? "opacity-0 -translate-y-3 filter blur-[2px]"
            : isEntering
            ? "opacity-100 translate-y-0 filter blur-0 animate-page-enter"
            : "opacity-100 translate-y-0 filter-none"
        }`}
      >
        {children}
      </main>
    </PageTransitionContext.Provider>
  );
}
