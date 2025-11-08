"use client";

import Image from "next/image";

type IconProps = {
  name: string;
  alt?: string;
  size?: number;
  className?: string;
};

export function Icon({ name, alt = "", size = 16, className }: IconProps) {
  return (
    <Image
      src={`/icons/${name}.svg`}
      alt={alt}
      width={size}
      height={size}
      aria-hidden={alt ? undefined : true}
      className={className}
    />
  );
}
