"use client";

import React, { MouseEvent } from "react";
import Link from "next/link";

interface DynamicLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function DynamicLink({
  href,
  children,
  className,
  onClick,
  ...props
}: DynamicLinkProps) {
  // If external link or anchor hash, render standard anchor
  if (href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:")) {
    return (
      <a href={href} onClick={onClick} className={className} {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={className} {...props}>
      {children}
    </Link>
  );
}
