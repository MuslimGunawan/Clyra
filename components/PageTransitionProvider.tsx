"use client";

import React, { useEffect, useState, useTransition } from "react";
import { usePathname } from "next/navigation";

export default function PageTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [displayKey, setDisplayKey] = useState(pathname);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setDisplayKey(pathname);
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {/* Top Route Loading Laser Indicator Bar */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 h-[2.5px] z-50 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 shadow-[0_0_12px_rgba(99,102,241,0.8)] animate-pulse" />
      )}

      {/* Animated Route Container */}
      <div 
        key={displayKey} 
        className="animate-page-enter flex-1 flex flex-col w-full"
      >
        {children}
      </div>
    </>
  );
}
