"use client";

import { cn } from "../../lib/cn";
import type { VideoCellValue } from "../../types/column";

export interface VideoCellProps {
  value: VideoCellValue | string | null | undefined;
  className?: string;
}

export function VideoCell({ value, className }: VideoCellProps) {
  const normalizedValue =
    typeof value === "string"
      ? {
          fileName: value,
        }
      : value;

  const fileName =
    normalizedValue && typeof normalizedValue.fileName === "string"
      ? normalizedValue.fileName.trim()
      : "";

  if (!fileName) {
    return <div className={cn("truncate", className)}>-</div>;
  }

  const thumbnail =
    normalizedValue && typeof normalizedValue.thumbnail === "string"
      ? normalizedValue.thumbnail
      : null;

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={`${fileName} thumbnail`}
          className="h-8 w-12 shrink-0 rounded object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-8 w-12 shrink-0 items-center justify-center rounded bg-zinc-200 text-[10px] font-medium tracking-wide text-zinc-600"
        >
          VIDEO
        </div>
      )}
      <span className="truncate text-sm text-zinc-800">{fileName}</span>
    </div>
  );
}
