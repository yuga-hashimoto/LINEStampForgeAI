"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type GeneratedAssetImageProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  fallbackSrc?: string;
};

export function GeneratedAssetImage({
  src,
  alt,
  className,
  imageClassName,
  fallbackSrc,
}: GeneratedAssetImageProps) {
  const [resolvedSrc, setResolvedSrc] = useState(src);

  useEffect(() => {
    setResolvedSrc(src);
  }, [src]);

  return (
    <span className={cn("relative block overflow-hidden", className)}>
      {/* Generated files are local mutable assets, so a plain img avoids Next Image localPatterns warnings for cache-busting URLs. */}
      <img
        alt={alt}
        className={cn("size-full object-contain", imageClassName)}
        onError={() => {
          if (fallbackSrc && resolvedSrc !== fallbackSrc) {
            setResolvedSrc(fallbackSrc);
          }
        }}
        src={resolvedSrc}
      />
    </span>
  );
}
