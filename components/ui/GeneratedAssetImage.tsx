import Image from "next/image";

import { cn } from "@/lib/utils";

type GeneratedAssetImageProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
};

export function GeneratedAssetImage({
  src,
  alt,
  className,
  imageClassName,
}: GeneratedAssetImageProps) {
  return (
    <span className={cn("relative block overflow-hidden", className)}>
      <Image
        alt={alt}
        className={cn("size-full object-contain", imageClassName)}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        src={src}
        unoptimized
      />
    </span>
  );
}
