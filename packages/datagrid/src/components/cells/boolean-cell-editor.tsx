"use client";

import { cn } from "../../lib/cn";
import { Checkbox } from "../ui/checkbox";

export interface BooleanCellEditorProps {
  value: boolean;
  isEditable?: boolean;
  onCommit: (value: boolean) => void;
  className?: string;
}

export function BooleanCellEditor({
  value,
  isEditable = false,
  onCommit,
  className,
}: BooleanCellEditorProps) {
  return (
    <div className={cn("flex h-full items-center", className)}>
      <Checkbox
        checked={value}
        disabled={!isEditable}
        onCheckedChange={(checked) => {
          const nextValue = checked === true;
          if (isEditable && nextValue !== value) {
            onCommit(nextValue);
          }
        }}
        aria-label={value ? "True" : "False"}
      />
    </div>
  );
}
