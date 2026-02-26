"use client";

import { cn } from "../../lib/cn";
import type { ResolutionCellValue } from "../../types/column";

export interface ResolutionCellProps {
  value: ResolutionCellValue | string | null | undefined;
  className?: string;
}

function formatDimension(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }
  return Math.round(value);
}

export function ResolutionCell({ value, className }: ResolutionCellProps) {
  if (typeof value === "string") {
    const text = value.trim();
    return <div className={cn("truncate", className)}>{text || "-"}</div>;
  }

  const width = formatDimension(value?.width ?? 0);
  const height = formatDimension(value?.height ?? 0);

  if (width === 0 || height === 0) {
    return <div className={cn("truncate", className)}>-</div>;
  }

  return (
    <div className={cn("truncate text-sm text-zinc-700", className)}>
      {width} <span className="text-zinc-400">x</span> {height}
    </div>
  );
}
