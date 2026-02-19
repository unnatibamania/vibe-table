"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import type { SelectOption } from "../../types/column";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const EMPTY_VALUE = "__EMPTY__";

export interface SelectCellEditorProps {
  value: string | null;
  options: SelectOption[];
  isEditable?: boolean;
  onCommit: (value: string | null) => void;
  className?: string;
}

export function SelectCellEditor({
  value,
  options,
  isEditable = false,
  onCommit,
  className,
}: SelectCellEditorProps) {
  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  if (!isEditable) {
    return (
      <div className={cn("truncate", className)}>{selectedOption?.label ?? "-"}</div>
    );
  }

  return (
    <Select
      value={value ?? EMPTY_VALUE}
      onValueChange={(nextValue) => {
        onCommit(nextValue === EMPTY_VALUE ? null : nextValue);
      }}
    >
      <SelectTrigger className={cn("h-8", className)} aria-label="Select value">
        <SelectValue placeholder="(empty)" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={EMPTY_VALUE}>(empty)</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
