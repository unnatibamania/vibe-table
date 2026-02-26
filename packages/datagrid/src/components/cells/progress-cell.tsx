"use client";

import { cn } from "../../lib/cn";
import type { ProgressCellValue } from "../../types/column";

export interface ProgressCellProps {
  value: ProgressCellValue | null | undefined;
  className?: string;
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, value);
}

export function ProgressCell({ value, className }: ProgressCellProps) {
  const completed = formatNumber(value?.completed ?? 0);
  const total = formatNumber(value?.total ?? value?.fullValue ?? 0);
  const boundedCompleted = total > 0 ? Math.min(completed, total) : completed;
  const percentage = total > 0 ? Math.round((boundedCompleted / total) * 100) : 0;
  const progressColorClass =
    percentage < 30
      ? "bg-red-500"
      : percentage <= 75
        ? "bg-yellow-500"
        : "bg-green-500";

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <div className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-slate-200/80">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
            progressColorClass,
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="truncate text-xs text-slate-600 font-medium tabular-nums">
        {boundedCompleted}/{total}
      </span>
    </div>
  );
}
