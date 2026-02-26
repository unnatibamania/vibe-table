"use client";

import { cn } from "../../lib/cn";
import type { UserCellValue } from "../../types/column";

export interface UserCellProps {
  value: UserCellValue | string | null | undefined;
  className?: string;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserCell({ value, className }: UserCellProps) {
  const normalizedValue =
    typeof value === "string"
      ? {
          name: value,
        }
      : value;

  const name =
    normalizedValue && typeof normalizedValue.name === "string"
      ? normalizedValue.name.trim()
      : "";

  if (!name) {
    return <div className={cn("truncate", className)}>-</div>;
  }

  const description =
    normalizedValue && typeof normalizedValue.description === "string"
      ? normalizedValue.description.trim()
      : normalizedValue && typeof normalizedValue.desction === "string"
        ? normalizedValue.desction.trim()
        : "";

  const image =
    normalizedValue && typeof normalizedValue.image === "string"
      ? normalizedValue.image
      : null;

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      {image ? (
        <img
          src={image}
          alt={name}
          className="h-7 w-7 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[11px] font-medium text-zinc-700"
        >
          {getInitials(name) || "?"}
        </div>
      )}
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-zinc-800">{name}</div>
        {description ? (
          <div className="truncate text-xs text-zinc-500">{description}</div>
        ) : null}
      </div>
    </div>
  );
}
