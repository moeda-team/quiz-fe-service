"use client";

import clsx from "clsx";

type LoadingProps = {
  fullscreen?: boolean;
  text?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export default function Loading({
  fullscreen = false,
  text = "Loading...",
  className,
  size = "md",
}: LoadingProps) {
  const spinnerSize = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-[3px]",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center gap-3",
        fullscreen
          ? "fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm"
          : "w-full py-10",
        className
      )}
    >
      <div
        className={clsx(
          "animate-spin rounded-full border-white/20 border-t-white",
          spinnerSize[size]
        )}
      />

      {text && (
        <p className="text-sm font-medium text-white">
          {text}
        </p>
      )}
    </div>
  );
}