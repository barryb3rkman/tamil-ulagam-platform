"use client";

import type { ImageMetadata } from "@tamil-ulagam/shared";
import Image, { getImageProps, type ImageProps } from "next/image";
import { useState, type CSSProperties } from "react";

import { cx } from "./utils";

export interface ImageWithFallbackProps extends Omit<
  ImageProps,
  | "alt"
  | "fetchPriority"
  | "fill"
  | "height"
  | "loading"
  | "onError"
  | "preload"
  | "priority"
  | "src"
  | "width"
> {
  readonly asset: ImageMetadata;
  readonly fallbackLabel?: string;
  readonly priority?: boolean;
}

interface ResponsiveImageStyle extends CSSProperties {
  readonly "--tu-image-desktop-aspect-ratio"?: string;
  readonly "--tu-image-desktop-position"?: string;
  readonly "--tu-image-mobile-aspect-ratio"?: string;
  readonly "--tu-image-mobile-position"?: string;
}

export function ImageWithFallback({
  asset,
  className,
  fallbackLabel = "Image preparation in progress",
  priority,
  sizes = "100vw",
  style,
  ...props
}: ImageWithFallbackProps) {
  const [hasLoadError, setHasLoadError] = useState(false);
  const shouldShowPlaceholder = !asset.available || hasLoadError;
  const shouldPrioritize = priority ?? asset.aboveFold;
  const responsiveClassName = asset.mobileAlternative
    ? "[object-position:var(--tu-image-mobile-position)] sm:[object-position:var(--tu-image-desktop-position)]"
    : undefined;
  const responsiveStyle: ResponsiveImageStyle = asset.mobileAlternative
    ? {
        ...style,
        "--tu-image-desktop-position": asset.objectPosition,
        "--tu-image-mobile-position": asset.mobileObjectPosition,
      }
    : {
        ...style,
        objectPosition: asset.objectPosition,
      };

  if (shouldShowPlaceholder) {
    const placeholderStyle: ResponsiveImageStyle = asset.mobileAlternative
      ? {
          "--tu-image-desktop-aspect-ratio": asset.aspectRatio,
          "--tu-image-mobile-aspect-ratio": asset.mobileAspectRatio,
        }
      : {
          aspectRatio: asset.aspectRatio,
        };

    return (
      <div
        role="img"
        aria-label={asset.alt}
        className={cx(
          "rounded-card border-global-navy/10 text-slate shadow-card grid min-h-56 place-items-center overflow-hidden border bg-[linear-gradient(135deg,var(--tu-color-warm-ivory),var(--tu-color-white))] p-8 text-center",
          asset.mobileAlternative &&
            "[aspect-ratio:var(--tu-image-mobile-aspect-ratio)] sm:[aspect-ratio:var(--tu-image-desktop-aspect-ratio)]",
          className,
        )}
        style={placeholderStyle}
      >
        <div>
          <span
            aria-hidden="true"
            className="bg-heritage-gold mx-auto mb-4 block h-1 w-14 rounded-full"
          />
          <span className="text-global-navy block text-sm font-semibold tracking-wide">
            {fallbackLabel}
          </span>
        </div>
      </div>
    );
  }

  if (asset.mobileAlternative) {
    const {
      props: { sizes: mobileSizes, src: mobileSrc, srcSet: mobileSrcSet },
    } = getImageProps({
      alt: asset.alt,
      height: asset.mobileHeight,
      loader: props.loader,
      quality: props.quality,
      sizes,
      src: asset.mobilePath,
      unoptimized: props.unoptimized,
      width: asset.mobileWidth,
    });

    return (
      <picture>
        <source
          height={asset.mobileHeight}
          media="(max-width: 639px)"
          sizes={mobileSizes}
          srcSet={mobileSrcSet ?? mobileSrc}
          width={asset.mobileWidth}
        />
        <Image
          alt={asset.alt}
          className={cx("object-cover", responsiveClassName, className)}
          {...props}
          fetchPriority={shouldPrioritize ? "high" : undefined}
          height={asset.height}
          loading={shouldPrioritize ? "eager" : "lazy"}
          onError={() => {
            setHasLoadError(true);
          }}
          sizes={sizes}
          src={asset.path}
          style={responsiveStyle}
          width={asset.width}
        />
      </picture>
    );
  }

  return (
    <Image
      alt={asset.alt}
      className={cx("object-cover", className)}
      {...props}
      fetchPriority={shouldPrioritize ? "high" : undefined}
      height={asset.height}
      loading={shouldPrioritize ? "eager" : "lazy"}
      onError={() => {
        setHasLoadError(true);
      }}
      sizes={sizes}
      src={asset.path}
      style={responsiveStyle}
      width={asset.width}
    />
  );
}
