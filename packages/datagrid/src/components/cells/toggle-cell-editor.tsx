"use client";

import { cn } from "../../lib/cn";
import { Switch } from "../ui/switch";

export interface ToggleCellEditorProps {
  value: boolean;
  isEditable?: boolean;
  onCommit: (value: boolean) => void;
  className?: string;
}

export function ToggleCellEditor({
  value,
  isEditable = false,
  onCommit,
  className,
}: ToggleCellEditorProps) {
  return (
    <div className={cn("flex h-full items-center", className)}>
      <Switch
        checked={value}
        disabled={!isEditable}
        onCheckedChange={(checked) => {
          if (isEditable && checked !== value) {
            onCommit(checked);
          }
        }}
        aria-label={value ? "Enabled" : "Disabled"}
      />
    </div>
  );
}
