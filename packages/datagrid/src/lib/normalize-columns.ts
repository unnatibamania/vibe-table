import type { DataTableColumn, NormalizedDataTableColumn } from "../types/column";

export function normalizeColumns<T>(
  columns: DataTableColumn<T>[]
): NormalizedDataTableColumn<T>[] {
  return columns.map((column) => {
    const isVisible =
      typeof column.isVisible === "boolean"
        ? column.isVisible
        : !Boolean(column.isHidden);

    return {
      ...column,
      isVisible,
    };
  });
}

export function getVisibleColumns<T>(
  columns: DataTableColumn<T>[]
): NormalizedDataTableColumn<T>[] {
  return normalizeColumns(columns).filter((column) => column.isVisible);
}
