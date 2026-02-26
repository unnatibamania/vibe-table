"use client";

import * as React from "react";
import type {
  NormalizedDataTableColumn,
  ProgressCellValue,
  ResolutionCellValue,
  UserCellValue,
  VideoCellValue,
} from "../types/column";
import type { RowId } from "../types/table";
import { BooleanCellEditor } from "./cells/boolean-cell-editor";
import { DateCellEditor } from "./cells/date-cell-editor";
import { MultiSelectCellEditor } from "./cells/multi-select-cell-editor";
import { NumberCellEditor } from "./cells/number-cell-editor";
import { ProgressCell } from "./cells/progress-cell";
import { RatingCellEditor } from "./cells/rating-cell-editor";
import { ResolutionCell } from "./cells/resolution-cell";
import { SelectCellEditor } from "./cells/select-cell-editor";
import { TextCellEditor } from "./cells/text-cell-editor";
import { ToggleCellEditor } from "./cells/toggle-cell-editor";
import { UserCell } from "./cells/user-cell";
import { VideoCell } from "./cells/video-cell";

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toUserCellValue(value: unknown): UserCellValue | string | null {
  if (typeof value === "string") {
    return value;
  }

  if (!isRecord(value) || typeof value.name !== "string") {
    return null;
  }

  return {
    name: value.name,
    image: typeof value.image === "string" ? value.image : null,
    description:
      typeof value.description === "string"
        ? value.description
        : typeof value.desction === "string"
          ? value.desction
          : null,
    desction: typeof value.desction === "string" ? value.desction : null,
  };
}

function toProgressCellValue(value: unknown): ProgressCellValue | null {
  if (!isRecord(value)) {
    return null;
  }

  const totalValue =
    typeof value.total === "number"
      ? value.total
      : typeof value.fullValue === "number"
        ? value.fullValue
        : null;

  if (typeof value.completed !== "number" || totalValue === null) {
    return null;
  }

  return {
    completed: value.completed,
    total: totalValue,
  };
}

function toVideoCellValue(value: unknown): VideoCellValue | string | null {
  if (typeof value === "string") {
    return value;
  }

  if (!isRecord(value) || typeof value.fileName !== "string") {
    return null;
  }

  return {
    fileName: value.fileName,
    thumbnail: typeof value.thumbnail === "string" ? value.thumbnail : null,
  };
}

function toResolutionCellValue(
  value: unknown
): ResolutionCellValue | string | null {
  if (typeof value === "string") {
    return value;
  }

  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.width !== "number" || typeof value.height !== "number") {
    return null;
  }

  return {
    width: value.width,
    height: value.height,
  };
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

  if (!isEditable && column.cell) {
    return <>{column.cell(row)}</>;
  }

  if (column.type === "user") {
    if (isEditable && typeof rawValue === "string") {
      return (
        <TextCellEditor
          value={toStringValue(rawValue)}
          isEditable={isEditable}
          onCommit={(value) => handleCommit(value)}
        />
      );
    }
    return <UserCell value={toUserCellValue(rawValue)} />;
  }

  if (column.type === "progress") {
    return <ProgressCell value={toProgressCellValue(rawValue)} />;
  }

  if (column.type === "video") {
    return <VideoCell value={toVideoCellValue(rawValue)} />;
  }

  if (column.type === "resolution") {
    return <ResolutionCell value={toResolutionCellValue(rawValue)} />;
  }

  if (!isEditable) {
    return <>{fallbackCellValue(row, column.id)}</>;
  }

  if (column.type === "custom") {
    if (column.cell) {
      return <>{column.cell(row)}</>;
    }
    return <>{fallbackCellValue(row, column.id)}</>;
  }

  if (column.type === "text") {
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
