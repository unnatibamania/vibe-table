"use client";

import * as React from "react";
import type { NormalizedDataTableColumn } from "../types/column";
import type { RowId } from "../types/table";
import { BooleanCellEditor } from "./cells/boolean-cell-editor";
import { DateCellEditor } from "./cells/date-cell-editor";
import { MultiSelectCellEditor } from "./cells/multi-select-cell-editor";
import { NumberCellEditor } from "./cells/number-cell-editor";
import { RatingCellEditor } from "./cells/rating-cell-editor";
import { SelectCellEditor } from "./cells/select-cell-editor";
import { TextCellEditor } from "./cells/text-cell-editor";
import { ToggleCellEditor } from "./cells/toggle-cell-editor";

interface EditableCellRendererProps<T extends object> {
  row: T;
  rowId: RowId;
  column: NormalizedDataTableColumn<T>;
  onCellChange?: (rowId: RowId, columnId: string, newValue: unknown) => void;
}

function toStringValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

function fallbackCellValue<T extends object>(row: T, columnId: string) {
  const value = (row as Record<string, unknown>)[columnId];
  return String(value ?? "");
}

export function EditableCellRenderer<T extends object>({
  row,
  rowId,
  column,
  onCellChange,
}: EditableCellRendererProps<T>) {
  const rawValue = (row as Record<string, unknown>)[column.id];
  const isEditable = Boolean(column.isEditable && onCellChange);

  const handleCommit = (newValue: unknown) => {
    if (onCellChange) {
      onCellChange(rowId, column.id, newValue);
    }
  };

  if (!isEditable) {
    if (column.cell) {
      return <>{column.cell(row)}</>;
    }
    return <>{fallbackCellValue(row, column.id)}</>;
  }

  if (column.type === "custom") {
    if (column.cell) {
      return <>{column.cell(row)}</>;
    }
    return <>{fallbackCellValue(row, column.id)}</>;
  }

  if (column.type === "text" || column.type === "user") {
    return (
      <TextCellEditor
        value={toStringValue(rawValue)}
        isEditable={isEditable}
        onCommit={(value) => handleCommit(value)}
      />
    );
  }

  if (column.type === "number") {
    return (
      <NumberCellEditor
        value={typeof rawValue === "number" ? rawValue : null}
        isEditable={isEditable}
        onCommit={(value) => handleCommit(value)}
      />
    );
  }

  if (column.type === "boolean" || column.type === "checkbox") {
    return (
      <BooleanCellEditor
        value={Boolean(rawValue)}
        isEditable={isEditable}
        onCommit={(value) => handleCommit(value)}
      />
    );
  }

  if (column.type === "toggle") {
    return (
      <ToggleCellEditor
        value={Boolean(rawValue)}
        isEditable={isEditable}
        onCommit={(value) => handleCommit(value)}
      />
    );
  }

  if (column.type === "date") {
    const dateValue =
      rawValue instanceof Date || typeof rawValue === "string"
        ? rawValue
        : null;

    return (
      <DateCellEditor
        value={dateValue}
        isEditable={isEditable}
        onCommit={(value) => handleCommit(value)}
      />
    );
  }

  if (column.type === "select") {
    return (
      <SelectCellEditor
        value={typeof rawValue === "string" ? rawValue : null}
        options={column.selectOptions}
        isEditable={isEditable}
        onCommit={(value) => handleCommit(value)}
      />
    );
  }

  if (column.type === "multi-select") {
    const values = Array.isArray(rawValue)
      ? rawValue.filter((item): item is string => typeof item === "string")
      : [];

    return (
      <MultiSelectCellEditor
        value={values}
        options={column.multiSelectOptions}
        isEditable={isEditable}
        onCommit={(value) => handleCommit(value)}
      />
    );
  }

  if (column.type === "rating") {
    return (
      <RatingCellEditor
        value={typeof rawValue === "number" ? rawValue : null}
        maxRating={column.maxRating}
        isEditable={isEditable}
        onCommit={(value) => handleCommit(value)}
      />
    );
  }

  return <>{fallbackCellValue(row, column.id)}</>;
}
