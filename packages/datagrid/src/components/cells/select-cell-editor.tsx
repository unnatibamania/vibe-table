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
      <div className={cn("flex items-center gap-2 truncate", className)}>
        {selectedOption?.icon ? (
          <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-current">
            {selectedOption.icon}
          </span>
        ) : null}
        <span className="truncate">{selectedOption?.label ?? "-"}</span>
      </div>
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
            <span className="flex items-center gap-2">
              {option.icon ? (
                <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-current">
                  {option.icon}
                </span>
              ) : null}
              {option.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
