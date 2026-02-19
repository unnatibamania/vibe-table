"use client";

import { cn } from "../../lib/cn";
import { Button } from "../ui/button";

export interface RatingCellEditorProps {
  value: number | null;
  isEditable?: boolean;
  onCommit: (value: number | null) => void;
  maxRating?: number;
  className?: string;
}

export function RatingCellEditor({
  value,
  isEditable = false,
  onCommit,
  maxRating = 5,
  className,
}: RatingCellEditorProps) {
  const currentValue = value ?? 0;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const ratingValue = index + 1;
        const isFilled = ratingValue <= currentValue;

        return (
          <Button
            key={ratingValue}
            variant="ghost"
            size="icon"
            className={cn(
              "h-6 w-6 p-0 text-base leading-none",
              isFilled ? "text-amber-500" : "text-zinc-300",
              !isEditable && "cursor-default"
            )}
            disabled={!isEditable}
            onClick={() => {
              if (!isEditable) {
                return;
              }

              const nextValue = ratingValue === currentValue ? null : ratingValue;
              onCommit(nextValue);
            }}
            aria-label={`Rate ${ratingValue}`}
          >
            {isFilled ? "★" : "☆"}
          </Button>
        );
      })}
    </div>
  );
}
