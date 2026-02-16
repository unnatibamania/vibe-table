import type { CSSProperties } from "react";

import type { DataGridColumn } from "./types";

export function getPinnedLeftOffsets<TData>(
  columns: DataGridColumn<TData>[],
  pinnedIds: string[],
  columnWidths?: Record<string, number | undefined>,
): Record<string, number> {
  let current = 0;
  const offsets: Record<string, number> = {};

  for (const column of columns) {
    if (!pinnedIds.includes(column.id)) {
      continue;
    }

    offsets[column.id] = current;
    current += columnWidths?.[column.id] ?? column.width ?? 180;
  }

  return offsets;
}

export function getPinnedCellStyle(
  columnId: string,
  pinnedOffsets: Record<string, number>,
): CSSProperties | undefined {
  const left = pinnedOffsets[columnId];
  if (left === undefined) {
    return undefined;
  }

  return {
    position: "sticky",
    left,
    zIndex: 5,
  };
}
