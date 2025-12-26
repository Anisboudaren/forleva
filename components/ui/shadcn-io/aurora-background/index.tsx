"use client";

import React, { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AuroraBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <main>
      <div
        className={cn(
          // Full-height background wrapper
          "transition-bg relative flex min-h-[70vh] flex-col items-center justify-center bg-background text-foreground",
          className,
        )}
        {...(props as any)}
      >
        <div
          className="absolute inset-0 overflow-hidden"
          style={
            {
              // Gold aurora palette
              "--aurora":
                "repeating-linear-gradient(100deg,#facc15_10%,#fbbf24_15%,#f59e0b_20%,#eab308_25%,#d97706_30%)",
              "--dark-gradient":
                "repeating-linear-gradient(100deg,#000_0%,#000_7%,transparent_10%,transparent_12%,#000_16%)",
              "--white-gradient":
                "repeating-linear-gradient(100deg,#fff_0%,#fff_7%,transparent_10%,transparent_12%,#fff_16%)",

              "--gold-200": "#fef3c7",
              "--gold-300": "#fde68a",
              "--gold-400": "#facc15",
              "--gold-500": "#eab308",
              "--gold-600": "#ca8a04",
              "--black": "#000",
              "--white": "#fff",
              "--transparent": "transparent",
            } as React.CSSProperties
          }
        >
          <div
            className={cn(
              // Animated aurora layer
              `after:animate-aurora pointer-events-none absolute -inset-[6px] opacity-90 blur-[10px] filter will-change-transform
              [background-image:var(--white-gradient),var(--aurora)]
              [background-size:260%,_200%]
              [background-position:50%_50%,50%_50%]
              [--aurora:repeating-linear-gradient(100deg,var(--gold-500)_10%,var(--gold-400)_15%,var(--gold-300)_20%,var(--gold-200)_25%,var(--gold-600)_30%)]
              [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
              [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]
              after:absolute
              after:inset-0
              after:[background-image:var(--white-gradient),var(--aurora)]
              after:[background-size:200%,_120%]
              after:[background-attachment:fixed]
              after:mix-blend-screen
              after:content-[""]
              dark:[background-image:var(--dark-gradient),var(--aurora)]
              after:dark:[background-image:var(--dark-gradient),var(--aurora)]`,

              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`,
            )}
          />
        </div>
        {children}
      </div>
    </main>
  );
};
