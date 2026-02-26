"use client";

import type React from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/cn";
import type { DataTableCellProps } from "../types/table";

const cellTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

export function DataTableCell({
  minWidth,
  maxWidth,
  className,
  style,
  children,
  animateOut,
  animateIn,
  ...props
}: DataTableCellProps & { animateOut?: boolean; animateIn?: boolean }) {
  const mergedStyle: React.CSSProperties = {
    minWidth: typeof minWidth === "number" ? `${minWidth}px` : undefined,
    maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : undefined,
    overflow: "hidden",
    ...style,
  };

  const content =
    animateOut || animateIn ? (
      <motion.div
        style={{ transformOrigin: "left center" }}
        initial={animateIn ? { opacity: 0, scaleX: 0 } : undefined}
        animate={
          animateOut
            ? { opacity: 0, scaleX: 0 }
            : animateIn
              ? { opacity: 1, scaleX: 1 }
              : undefined
        }
        transition={cellTransition}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    ) : (
      children
    );

  return (
    <td
      className={cn(
        "px-10 py-1 align-middle text-slate-800 whitespace-nowrap text-[0.9375rem] leading-relaxed",
        className
      )}
      style={mergedStyle}
      {...props}
    >
      {content}
    </td>
  );
}
