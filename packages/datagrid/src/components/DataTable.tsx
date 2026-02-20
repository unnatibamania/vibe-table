"use client";

import React from "react";
import { closestCenter, DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { cn } from "../lib/cn";
import { mergeColumnOrder, reorderColumnIds } from "../lib/column-order";
import { normalizeColumns } from "../lib/normalize-columns";
import type { RowId } from "../types/table";
import type { DataTableProps } from "../types/table";
import { EditableCellRenderer } from "./cell-editors";
import { DataTableCell } from "./DataTableCell";
import { DataTableHeader } from "./DataTableHeader";
import { DataTableRow } from "./DataTableRow";
import { RowActionsMenu } from "./row-actions-menu";
import { Checkbox } from "./ui/checkbox";

function defaultSkeletonCell() {
  return <div className="h-4 w-full animate-pulse rounded bg-zinc-200" />;
}

const UTILITY_COLUMN_WIDTH = 44;

export function DataTable<T extends object>({
  rows,
  columns,
  getRowId,
  onCellChange,
  enableRowSelection = false,
  selectedRowIds,
  defaultSelectedRowIds,
  onSelectionChange,
  rowActions = [],
  columnActions = [],
  onColumnOrderChange,
  onColumnResize,
  classNames,
  isLoading = false,
  loadingRowCount = 3,
  emptyState = "No data available",
}: DataTableProps<T>) {
  const normalizedColumns = React.useMemo(
    () => normalizeColumns(columns),
    [columns]
  );

  const [columnOrder, setColumnOrder] = React.useState<string[]>(() =>
    normalizedColumns.map((column) => column.id)
  );

  React.useEffect(() => {
    const nextColumnIds = normalizedColumns.map((column) => column.id);
    setColumnOrder((currentOrder) => mergeColumnOrder(currentOrder, nextColumnIds));
  }, [normalizedColumns]);

  const orderedColumns = React.useMemo(() => {
    const columnMap = new Map(normalizedColumns.map((column) => [column.id, column]));
    return columnOrder
      .map((columnId) => columnMap.get(columnId))
      .filter((column): column is NonNullable<typeof column> => Boolean(column));
  }, [columnOrder, normalizedColumns]);

  const visibleColumns = React.useMemo(
    () => orderedColumns.filter((column) => column.isVisible),
    [orderedColumns]
  );

  const leftPinnedColumns = React.useMemo(
    () => visibleColumns.filter((column) => column.pin === "left"),
    [visibleColumns]
  );

  const rightPinnedColumns = React.useMemo(
    () => visibleColumns.filter((column) => column.pin === "right"),
    [visibleColumns]
  );

  const centerColumns = React.useMemo(
    () =>
      visibleColumns.filter(
        (column) => column.pin !== "left" && column.pin !== "right"
      ),
    [visibleColumns]
  );

  const sortedVisibleColumns = React.useMemo(
    () => [...leftPinnedColumns, ...centerColumns, ...rightPinnedColumns],
    [centerColumns, leftPinnedColumns, rightPinnedColumns]
  );

  const [columnWidths, setColumnWidths] = React.useState<Record<string, number>>(
    {}
  );
  const [resizingColumn, setResizingColumn] = React.useState<{
    columnId: string;
    startX: number;
    startWidth: number;
  } | null>(null);

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
    sortedVisibleColumns.length +
      (enableRowSelection ? 1 : 0) +
      (rowActions.length > 0 ? 1 : 0),
    1
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) {
        return;
      }

      const activeId = String(active.id);
      const overId = String(over.id);

      if (activeId === overId) {
        return;
      }

      const activeColumn = sortedVisibleColumns.find(
        (column) => column.id === activeId
      );
      const overColumn = sortedVisibleColumns.find((column) => column.id === overId);

      if (!activeColumn || !overColumn) {
        return;
      }

      if (
        activeColumn.isDraggable === false ||
        overColumn.isDraggable === false ||
        activeColumn.pin === "left" ||
        activeColumn.pin === "right"
      ) {
        return;
      }

      if (overColumn.pin === "left" || overColumn.pin === "right") {
        return;
      }

      setColumnOrder((currentOrder) => {
        const nextOrder = reorderColumnIds(currentOrder, activeId, overId);
        if (nextOrder !== currentOrder && onColumnOrderChange) {
          onColumnOrderChange(nextOrder);
        }
        return nextOrder;
      });
    },
    [onColumnOrderChange, sortedVisibleColumns]
  );

  const handleResizeStart = React.useCallback(
    (columnId: string, startX: number, startWidth: number) => {
      setResizingColumn({
        columnId,
        startX,
        startWidth,
      });
    },
    []
  );

  React.useEffect(() => {
    if (!resizingColumn) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const column = sortedVisibleColumns.find(
        (candidate) => candidate.id === resizingColumn.columnId
      );
      if (!column) {
        return;
      }

      const delta = event.clientX - resizingColumn.startX;
      const minWidth = column.minWidth ?? 80;
      const maxWidth =
        typeof column.maxWidth === "number"
          ? column.maxWidth
          : Number.POSITIVE_INFINITY;
      const unclampedWidth = resizingColumn.startWidth + delta;
      const nextWidth = Math.min(maxWidth, Math.max(minWidth, unclampedWidth));

      setColumnWidths((current) => {
        if (current[resizingColumn.columnId] === nextWidth) {
          return current;
        }
        return {
          ...current,
          [resizingColumn.columnId]: nextWidth,
        };
      });

      if (onColumnResize) {
        onColumnResize(resizingColumn.columnId, nextWidth);
      }
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [onColumnResize, resizingColumn, sortedVisibleColumns]);

  const handleColumnWidthMeasure = React.useCallback(
    (columnId: string, width: number) => {
      if (!Number.isFinite(width) || width <= 0) {
        return;
      }

      const roundedWidth = Math.round(width);
      setColumnWidths((current) => {
        if (current[columnId] === roundedWidth) {
          return current;
        }

        return {
          ...current,
          [columnId]: roundedWidth,
        };
      });
    },
    []
  );

  const hasLeftPinnedColumns = leftPinnedColumns.length > 0;
  const hasRightPinnedColumns = rightPinnedColumns.length > 0;

  const stickySelectionColumn = enableRowSelection && hasLeftPinnedColumns;
  const stickyRowActionsColumn = rowActions.length > 0 && hasRightPinnedColumns;

  const getEffectiveColumnWidth = React.useCallback(
    (columnId: string) => {
      const measuredWidth = columnWidths[columnId];
      if (typeof measuredWidth === "number" && measuredWidth > 0) {
        return measuredWidth;
      }

      const column = sortedVisibleColumns.find((candidate) => candidate.id === columnId);
      if (!column) {
        return 140;
      }

      return column.minWidth ?? 140;
    },
    [columnWidths, sortedVisibleColumns]
  );

  const leftPinnedOffsets = React.useMemo(() => {
    const offsets: Record<string, number> = {};
    let nextLeftOffset = stickySelectionColumn ? UTILITY_COLUMN_WIDTH : 0;

    leftPinnedColumns.forEach((column) => {
      offsets[column.id] = nextLeftOffset;
      nextLeftOffset += getEffectiveColumnWidth(column.id);
    });

    return offsets;
  }, [getEffectiveColumnWidth, leftPinnedColumns, stickySelectionColumn]);

  const rightPinnedOffsets = React.useMemo(() => {
    const offsets: Record<string, number> = {};
    let nextRightOffset = stickyRowActionsColumn ? UTILITY_COLUMN_WIDTH : 0;

    [...rightPinnedColumns].reverse().forEach((column) => {
      offsets[column.id] = nextRightOffset;
      nextRightOffset += getEffectiveColumnWidth(column.id);
    });

    return offsets;
  }, [getEffectiveColumnWidth, rightPinnedColumns, stickyRowActionsColumn]);

  const getPinnedStyleForColumn = React.useCallback(
    (columnId: string): React.CSSProperties => {
      if (Object.prototype.hasOwnProperty.call(leftPinnedOffsets, columnId)) {
        return {
          position: "sticky",
          left: `${leftPinnedOffsets[columnId]}px`,
          zIndex: 20,
          backgroundColor: "inherit",
        };
      }

      if (Object.prototype.hasOwnProperty.call(rightPinnedOffsets, columnId)) {
        return {
          position: "sticky",
          right: `${rightPinnedOffsets[columnId]}px`,
          zIndex: 20,
          backgroundColor: "inherit",
        };
      }

      return {};
    },
    [leftPinnedOffsets, rightPinnedOffsets]
  );

  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm",
        classNames?.root
      )}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToHorizontalAxis]}
      >
        <table className={cn("w-full min-w-max border-collapse text-sm", classNames?.table)}>
          <DataTableHeader
            columns={sortedVisibleColumns}
            classNames={classNames}
            enableRowSelection={enableRowSelection}
            headerSelectionState={headerSelectionState}
            onToggleSelectAll={handleToggleSelectAll}
            showRowActionsColumn={rowActions.length > 0}
            columnActions={columnActions}
            columnWidths={columnWidths}
            resizingColumnId={resizingColumn?.columnId ?? null}
            onResizeStart={handleResizeStart}
            onColumnWidthMeasure={handleColumnWidthMeasure}
            leftPinnedOffsets={leftPinnedOffsets}
            rightPinnedOffsets={rightPinnedOffsets}
            stickySelectionColumn={stickySelectionColumn}
            stickyRowActionsColumn={stickyRowActionsColumn}
          />

          <tbody className={cn(classNames?.tbody)}>
            {isLoading
              ? Array.from({ length: loadingRowCount }).map((_, index) => (
                  <DataTableRow
                    key={`loading-row-${index}`}
                    className={cn(classNames?.loadingRow)}
                  >
                    {enableRowSelection ? (
                      <DataTableCell
                        className={cn("w-11 min-w-11 max-w-11 px-2 py-2")}
                        style={
                          stickySelectionColumn
                            ? {
                                position: "sticky",
                                left: "0px",
                                zIndex: 25,
                                backgroundColor: "inherit",
                              }
                            : undefined
                        }
                      >
                        <div className="h-4 w-4 animate-pulse rounded bg-zinc-200" />
                      </DataTableCell>
                    ) : null}
                    {sortedVisibleColumns.map((column) => (
                      <DataTableCell
                        key={`loading-${column.id}-${index}`}
                        minWidth={column.minWidth}
                        maxWidth={column.maxWidth}
                        style={{
                          width: columnWidths[column.id]
                            ? `${columnWidths[column.id]}px`
                            : undefined,
                          ...getPinnedStyleForColumn(column.id),
                        }}
                        className={cn(classNames?.cell)}
                      >
                        {column.skeleton ?? defaultSkeletonCell()}
                      </DataTableCell>
                    ))}
                    {rowActions.length > 0 ? (
                      <DataTableCell
                        className={cn("w-11 min-w-11 max-w-11 px-2 py-2")}
                        style={
                          stickyRowActionsColumn
                            ? {
                                position: "sticky",
                                right: "0px",
                                zIndex: 25,
                                backgroundColor: "inherit",
                              }
                            : undefined
                        }
                      >
                        <div className="h-4 w-4 animate-pulse rounded bg-zinc-200" />
                      </DataTableCell>
                    ) : null}
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
                        <DataTableCell
                          className={cn("w-11 min-w-11 max-w-11 px-2 py-2")}
                          style={
                            stickySelectionColumn
                              ? {
                                  position: "sticky",
                                  left: "0px",
                                  zIndex: 25,
                                  backgroundColor: "inherit",
                                }
                              : undefined
                          }
                        >
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
                      {sortedVisibleColumns.map((column) => (
                        <DataTableCell
                          key={`${String(rowId)}-${column.id}`}
                          minWidth={column.minWidth}
                          maxWidth={column.maxWidth}
                          style={{
                            width: columnWidths[column.id]
                              ? `${columnWidths[column.id]}px`
                              : undefined,
                            ...getPinnedStyleForColumn(column.id),
                          }}
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
                      {rowActions.length > 0 ? (
                        <DataTableCell
                          className={cn("w-11 min-w-11 max-w-11 px-2 py-2")}
                          style={
                            stickyRowActionsColumn
                              ? {
                                  position: "sticky",
                                  right: "0px",
                                  zIndex: 25,
                                  backgroundColor: "inherit",
                                }
                              : undefined
                          }
                        >
                          <div className="flex items-center justify-center">
                            <RowActionsMenu row={row} rowId={rowId} actions={rowActions} />
                          </div>
                        </DataTableCell>
                      ) : null}
                    </DataTableRow>
                  );
                })
              : null}
          </tbody>
        </table>
      </DndContext>
    </div>
  );
}
