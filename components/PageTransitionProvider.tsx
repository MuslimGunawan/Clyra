"use client";

import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function PageTransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div 
      key={pathname} 
      className="animate-page-enter flex-1 flex flex-col w-full"
    >
      {children}
    </div>
  );
}
