"use client";

import React, { MouseEvent } from "react";
import { usePageTransition } from "./PageTransitionProvider";

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
  const { navigateTo } = usePageTransition();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);

    // If external link or anchor hash, proceed normally
    if (href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:")) {
      return;
    }

    e.preventDefault();
    navigateTo(href);
  };

  return (
    <a href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
}
