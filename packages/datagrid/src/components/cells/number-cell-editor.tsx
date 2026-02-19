"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { Input } from "../ui/input";

export interface NumberCellEditorProps {
  value: number | null;
  isEditable?: boolean;
  onCommit: (value: number | null) => void;
  className?: string;
}

export function NumberCellEditor({
  value,
  isEditable = false,
  onCommit,
  className,
}: NumberCellEditorProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [draftValue, setDraftValue] = React.useState(
    value === null ? "" : String(value)
  );

  React.useEffect(() => {
    if (!isEditing) {
      setDraftValue(value === null ? "" : String(value));
    }
  }, [value, isEditing]);

  const parsedValue = React.useMemo(() => {
    if (draftValue.trim() === "") {
      return null;
    }
    const nextValue = Number(draftValue);
    return Number.isNaN(nextValue) ? value : nextValue;
  }, [draftValue, value]);

  const commit = React.useCallback(() => {
    setIsEditing(false);
    if (parsedValue !== value) {
      onCommit(parsedValue);
    }
  }, [parsedValue, value, onCommit]);

  const cancel = React.useCallback(() => {
    setDraftValue(value === null ? "" : String(value));
    setIsEditing(false);
  }, [value]);

  if (!isEditable) {
    return (
      <div className={cn("truncate", className)}>
        {value === null ? "-" : value.toLocaleString()}
      </div>
    );
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
        {value === null ? "-" : value.toLocaleString()}
      </button>
    );
  }

  return (
    <Input
      autoFocus
      type="number"
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
