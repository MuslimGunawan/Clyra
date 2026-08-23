"use client";

import { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <div className="animate-page-enter flex-1 flex flex-col w-full">
      {children}
    </div>
  );
}
