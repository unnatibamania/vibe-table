"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { Input } from "../ui/input";

export interface TextCellEditorProps {
  value: string;
  isEditable?: boolean;
  onCommit: (value: string) => void;
  className?: string;
}

export function TextCellEditor({
  value,
  isEditable = false,
  onCommit,
  className,
}: TextCellEditorProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [draftValue, setDraftValue] = React.useState(value);

  React.useEffect(() => {
    if (!isEditing) {
      setDraftValue(value);
    }
  }, [value, isEditing]);

  const commit = React.useCallback(() => {
    setIsEditing(false);
    if (draftValue !== value) {
      onCommit(draftValue);
    }
  }, [draftValue, value, onCommit]);

  const cancel = React.useCallback(() => {
    setDraftValue(value);
    setIsEditing(false);
  }, [value]);

  if (!isEditable) {
    return <div className={cn("truncate", className)}>{value || "-"}</div>;
  }

  if (!isEditing) {
    return (
      <button
        type="button"
        onDoubleClick={() => setIsEditing(true)}
        className={cn(
          "w-full cursor-text truncate rounded px-1 py-1 text-left hover:bg-zinc-100",
          className
        )}
      >
        {value || "-"}
      </button>
    );
  }

  return (
    <Input
      autoFocus
      value={draftValue}
      onChange={(event) => setDraftValue(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          commit();
        }
        if (event.key === "Escape") {
          cancel();
        }
      }}
      className={cn("h-8", className)}
    />
  );
}
