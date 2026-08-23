"use client";

import React, { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { createEphemeralToken } from "@/lib/cryptoTokens";

interface DynamicLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
  useEphemeral?: boolean;
}

export default function DynamicLink({
  href,
  children,
  className,
  useEphemeral = true,
  onClick,
  ...props
}: DynamicLinkProps) {
  const router = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);

    // If external link or anchor hash, proceed normally
    if (href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:")) {
      return;
    }

    if (useEphemeral) {
      e.preventDefault();
      try {
        const dynamicToken = createEphemeralToken(href);
        router.push(`/v/${dynamicToken}`);
      } catch {
        router.push(href);
      }
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
}
