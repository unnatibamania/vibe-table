"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/cn";
import type { DataTableColumnProps } from "../types/table";

const columnTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

export const DataTableColumn = React.forwardRef<
  HTMLTableCellElement,
  DataTableColumnProps & { animateOut?: boolean; animateIn?: boolean }
>(({ minWidth, maxWidth, className, style, children, animateOut, animateIn, ...props }, ref) => {
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
        transition={columnTransition}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    ) : (
      children
    );

  return (
    <th
      ref={ref}
      scope="col"
      className={cn(
        " px-3 py-2 text-left align-middle font-medium text-zinc-900 whitespace-nowrap",
        className
      )}
      style={mergedStyle}
      {...props}
    >
      {content}
    </th>
  );
});

DataTableColumn.displayName = "DataTableColumn";
