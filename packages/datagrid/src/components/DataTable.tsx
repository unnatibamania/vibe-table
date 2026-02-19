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
import { Checkbox } from "./ui/checkbox";

function defaultSkeletonCell() {
  return <div className="h-4 w-full animate-pulse rounded bg-zinc-200" />;
}

export function DataTable<T extends object>({
  rows,
  columns,
  getRowId,
  onCellChange,
  enableRowSelection = false,
  selectedRowIds,
  defaultSelectedRowIds,
  onSelectionChange,
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

  const resolvedRowIds = React.useMemo(
    () => rows.map((row, rowIndex) => resolveRowId(row, rowIndex)),
    [rows, resolveRowId]
  );

  const isSelectionControlled = selectedRowIds !== undefined;
  const [internalSelectedRowIds, setInternalSelectedRowIds] = React.useState<
    Set<RowId>
  >(() => new Set(defaultSelectedRowIds ? Array.from(defaultSelectedRowIds) : []));

  const effectiveSelectedRowIds = React.useMemo(() => {
    if (isSelectionControlled) {
      return selectedRowIds as Set<RowId>;
    }
    return internalSelectedRowIds;
  }, [internalSelectedRowIds, isSelectionControlled, selectedRowIds]);

  const emitSelectionChange = React.useCallback(
    (nextSelectedIds: Set<RowId>) => {
      if (onSelectionChange) {
        onSelectionChange(new Set(nextSelectedIds));
      }
    },
    [onSelectionChange]
  );

  const updateSelection = React.useCallback(
    (nextSelectedIds: Set<RowId>) => {
      if (!isSelectionControlled) {
        setInternalSelectedRowIds(nextSelectedIds);
      }
      emitSelectionChange(nextSelectedIds);
    },
    [emitSelectionChange, isSelectionControlled]
  );

  const handleSelectRow = React.useCallback(
    (rowId: RowId, checked: boolean | "indeterminate") => {
      const shouldSelect = checked === true;
      const nextSelectedIds = new Set(effectiveSelectedRowIds);
      if (shouldSelect) {
        nextSelectedIds.add(rowId);
      } else {
        nextSelectedIds.delete(rowId);
      }
      updateSelection(nextSelectedIds);
    },
    [effectiveSelectedRowIds, updateSelection]
  );

  const handleToggleSelectAll = React.useCallback(
    (checked: boolean | "indeterminate") => {
      const shouldSelectAll = checked === true;
      const nextSelectedIds = new Set(effectiveSelectedRowIds);

      if (shouldSelectAll) {
        resolvedRowIds.forEach((rowId) => {
          nextSelectedIds.add(rowId);
        });
      } else {
        resolvedRowIds.forEach((rowId) => {
          nextSelectedIds.delete(rowId);
        });
      }

      updateSelection(nextSelectedIds);
    },
    [effectiveSelectedRowIds, resolvedRowIds, updateSelection]
  );

  const headerSelectionState = React.useMemo(() => {
    if (!enableRowSelection || resolvedRowIds.length === 0) {
      return false;
    }

    const selectedInCurrentRows = resolvedRowIds.filter((rowId) =>
      effectiveSelectedRowIds.has(rowId)
    ).length;

    if (selectedInCurrentRows === 0) {
      return false;
    }

    if (selectedInCurrentRows === resolvedRowIds.length) {
      return true;
    }

    return "indeterminate";
  }, [enableRowSelection, effectiveSelectedRowIds, resolvedRowIds]);

  const resolvedColumnCount = Math.max(
    visibleColumns.length + (enableRowSelection ? 1 : 0),
    1
  );

  return (
    <div className={cn("w-full overflow-x-auto rounded-md border border-zinc-200", classNames?.root)}>
      <table className={cn("w-full border-collapse text-sm", classNames?.table)}>
        <DataTableHeader
          columns={visibleColumns}
          classNames={classNames}
          enableRowSelection={enableRowSelection}
          headerSelectionState={headerSelectionState}
          onToggleSelectAll={handleToggleSelectAll}
        />

        <tbody className={cn(classNames?.tbody)}>
          {isLoading
            ? Array.from({ length: loadingRowCount }).map((_, index) => (
                <DataTableRow
                  key={`loading-row-${index}`}
                  className={cn(classNames?.loadingRow)}
                >
                  {enableRowSelection ? (
                    <DataTableCell className={cn("w-11 min-w-11 max-w-11 px-2 py-2")}>
                      <div className="h-4 w-4 animate-pulse rounded bg-zinc-200" />
                    </DataTableCell>
                  ) : null}
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
                const isSelected = effectiveSelectedRowIds.has(rowId);
                return (
                  <DataTableRow
                    key={String(rowId)}
                    data-row-id={String(rowId)}
                    data-selected={isSelected ? "true" : "false"}
                    className={cn(classNames?.row, isSelected ? "bg-zinc-50" : undefined)}
                  >
                    {enableRowSelection ? (
                      <DataTableCell className={cn("w-11 min-w-11 max-w-11 px-2 py-2")}>
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleSelectRow(rowId, checked)
                            }
                            aria-label={`Select row ${rowIndex + 1}`}
                          />
                        </div>
                      </DataTableCell>
                    ) : null}
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
