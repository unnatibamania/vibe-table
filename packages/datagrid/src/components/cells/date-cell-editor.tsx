"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

function toDateString(value: Date): string {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateValue(value: Date | string | null): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]) - 1;
    const day = Number(isoMatch[3]);
    return new Date(year, month, day);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export interface DateCellEditorProps {
  value: Date | string | null;
  isEditable?: boolean;
  onCommit: (value: string | null) => void;
  className?: string;
}

export function DateCellEditor({
  value,
  isEditable = false,
  onCommit,
  className,
}: DateCellEditorProps) {
  const [open, setOpen] = React.useState(false);
  const selectedDate = React.useMemo(() => parseDateValue(value), [value]);
  const displayValue = selectedDate ? toDateString(selectedDate) : "";

  if (!isEditable) {
    return <div className={cn("truncate", className)}>{displayValue || "-"}</div>;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-8 w-full justify-start gap-2 overflow-hidden px-2 text-left font-normal",
            !displayValue && "text-zinc-500",
            className
          )}
          aria-label={displayValue || "Pick a date"}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 opacity-70" />
          <span className="truncate">{displayValue || "(empty)"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate ?? undefined}
          onSelect={(nextDate: Date | undefined) => {
            onCommit(nextDate ? toDateString(nextDate) : null);
            setOpen(false);
          }}
          initialFocus
        />
        {selectedDate ? (
          <div className="border-t border-zinc-200 p-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-full"
              onClick={() => {
                onCommit(null);
                setOpen(false);
              }}
            >
              Clear date
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
