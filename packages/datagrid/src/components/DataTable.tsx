"use client";

import React from "react";
import { cn } from "../lib/cn";
import { normalizeColumns } from "../lib/normalize-columns";
import type { RowId } from "../types/table";
import type { DataTableProps } from "../types/table";
import { EditableCellRenderer } from "./cell-editors";
import { DataTableCell } from "./DataTableCell";
import { DataTableHeader } from "./DataTableHeader";
import { DataTableRow } from "./DataTableRow";

function defaultSkeletonCell() {
  return <div className="h-4 w-full animate-pulse rounded bg-zinc-200" />;
}

export function DataTable<T extends object>({
  rows,
  columns,
  getRowId,
  onCellChange,
  classNames,
  isLoading = false,
  loadingRowCount = 3,
  emptyState = "No data available",
}: DataTableProps<T>) {
  const normalizedColumns = React.useMemo(
    () => normalizeColumns(columns),
    [columns]
  );

  const visibleColumns = React.useMemo(
    () => normalizedColumns.filter((column) => column.isVisible),
    [normalizedColumns]
  );

  const resolvedColumnCount = Math.max(visibleColumns.length, 1);

  const resolveRowId = React.useCallback(
    (row: T, index: number): RowId => {
      if (getRowId) {
        return getRowId(row, index);
      }

      const rawId = (row as Record<string, unknown>).id;
      if (typeof rawId === "string" || typeof rawId === "number") {
        return rawId;
      }

      return index;
    },
    [getRowId]
  );

  return (
    <div className={cn("w-full overflow-x-auto rounded-md border border-zinc-200", classNames?.root)}>
      <table className={cn("w-full border-collapse text-sm", classNames?.table)}>
        <DataTableHeader columns={visibleColumns} classNames={classNames} />

        <tbody className={cn(classNames?.tbody)}>
          {isLoading
            ? Array.from({ length: loadingRowCount }).map((_, index) => (
                <DataTableRow
                  key={`loading-row-${index}`}
                  className={cn(classNames?.loadingRow)}
                >
                  {visibleColumns.map((column) => (
                    <DataTableCell
                      key={`loading-${column.id}-${index}`}
                      minWidth={column.minWidth}
                      maxWidth={column.maxWidth}
                      className={cn(classNames?.cell)}
                    >
                      {column.skeleton ?? defaultSkeletonCell()}
                    </DataTableCell>
                  ))}
                </DataTableRow>
              ))
            : null}

          {!isLoading && rows.length === 0 ? (
            <DataTableRow>
              <DataTableCell
                colSpan={resolvedColumnCount}
                className={cn("py-6 text-center text-zinc-500", classNames?.emptyState)}
              >
                {emptyState}
              </DataTableCell>
            </DataTableRow>
          ) : null}

          {!isLoading
            ? rows.map((row, rowIndex) => {
                const rowId = resolveRowId(row, rowIndex);
                return (
                  <DataTableRow
                    key={String(rowId)}
                    data-row-id={String(rowId)}
                    className={cn(classNames?.row)}
                  >
                    {visibleColumns.map((column) => (
                      <DataTableCell
                        key={`${String(rowId)}-${column.id}`}
                        minWidth={column.minWidth}
                        maxWidth={column.maxWidth}
                        className={cn(classNames?.cell)}
                      >
                        <EditableCellRenderer
                          row={row}
                          rowId={rowId}
                          column={column}
                          onCellChange={onCellChange}
                        />
                      </DataTableCell>
                    ))}
                  </DataTableRow>
                );
              })
            : null}
        </tbody>
      </table>
    </div>
  );
}
