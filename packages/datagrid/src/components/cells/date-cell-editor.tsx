"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { Input } from "../ui/input";

function toDateInputValue(value: Date | string | null): string {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, "0");
    const day = `${value.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return value;
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
  const currentValue = React.useMemo(() => toDateInputValue(value), [value]);

  if (!isEditable) {
    return <div className={cn("truncate", className)}>{currentValue || "-"}</div>;
  }

  return (
    <Input
      type="date"
      value={currentValue}
      onChange={(event) => {
        const nextValue = event.target.value;
        onCommit(nextValue ? nextValue : null);
      }}
      className={cn("h-8", className)}
    />
  );
}
