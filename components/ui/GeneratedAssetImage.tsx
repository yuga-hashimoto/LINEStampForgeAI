"use client";

import Image from "next/image";
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
      <Image
        alt={alt}
        className={cn("size-full object-contain", imageClassName)}
        fill
        onError={() => {
          if (fallbackSrc && resolvedSrc !== fallbackSrc) {
            setResolvedSrc(fallbackSrc);
          }
        }}
        sizes="(max-width: 768px) 100vw, 50vw"
        src={resolvedSrc}
        unoptimized
      />
    </span>
  );
}
