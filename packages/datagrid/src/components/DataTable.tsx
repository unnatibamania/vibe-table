"use client";

import React from "react";
import { closestCenter, DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { cn } from "../lib/cn";
import { mergeColumnOrder, reorderColumnIds } from "../lib/column-order";
import { normalizeColumns } from "../lib/normalize-columns";
import type { NormalizedDataTableColumn } from "../types/column";
import type {
  DataTableProps,
  DataTableSortState,
  RowId,
} from "../types/table";
import { EditableCellRenderer } from "./cell-editors";
import { DataTableCell } from "./DataTableCell";
import { DataTableHeader } from "./DataTableHeader";
import { DataTableRow } from "./DataTableRow";
import { RowActionsMenu } from "./row-actions-menu";
import { Checkbox } from "./ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

function defaultSkeletonCell() {
  return <div className="h-4 w-full animate-pulse rounded bg-zinc-200" />;
}

const UTILITY_COLUMN_WIDTH = 44;

type DataTableContextMenuState<T extends object> =
  | {
      kind: "row";
      x: number;
      y: number;
      row: T;
      rowId: RowId;
    }
  | {
      kind: "column";
      x: number;
      y: number;
      column: NormalizedDataTableColumn<T>;
    }
  | null;

type GroupedRenderItem<T extends object> =
  | {
      kind: "group-header";
      key: string;
      level: 1 | 2;
      label: string;
      rowCount: number;
      value: unknown;
      column: NormalizedDataTableColumn<T>;
    }
  | {
      kind: "row";
      key: string;
      row: T;
      rowId: RowId;
      rowIndex: number;
    };

function getGroupValueKey(value: unknown) {
  if (value == null) {
    return "null";
  }

  if (value instanceof Date) {
    return `date:${value.toISOString()}`;
  }

  if (Array.isArray(value)) {
    return `array:${value.map((item) => String(item)).join("|")}`;
  }

  const valueType = typeof value;
  if (valueType === "string" || valueType === "number" || valueType === "boolean") {
    return `${valueType}:${String(value)}`;
  }

  try {
    return `object:${JSON.stringify(value)}`;
  } catch {
    return `object:${String(value)}`;
  }
}

function formatGroupLabelValue(value: unknown) {
  if (value == null || value === "") {
    return "Unspecified";
  }

  if (value instanceof Date) {
    return value.toLocaleDateString();
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "boolean") {
    return value ? "True" : "False";
  }

  return String(value);
}

function compareSortValues(
  leftValue: unknown,
  rightValue: unknown,
  sortHint?: string
) {
  if (leftValue == null && rightValue == null) {
    return 0;
  }
  if (leftValue == null) {
    return 1;
  }
  if (rightValue == null) {
    return -1;
  }

  if (typeof leftValue === "number" && typeof rightValue === "number") {
    return leftValue - rightValue;
  }

  if (typeof leftValue === "boolean" && typeof rightValue === "boolean") {
    return Number(leftValue) - Number(rightValue);
  }

  if (leftValue instanceof Date && rightValue instanceof Date) {
    return leftValue.getTime() - rightValue.getTime();
  }

  const leftText = Array.isArray(leftValue) ? leftValue.join(", ") : String(leftValue);
  const rightText = Array.isArray(rightValue)
    ? rightValue.join(", ")
    : String(rightValue);

  if (sortHint === "date") {
    const leftDate = Date.parse(leftText);
    const rightDate = Date.parse(rightText);
    if (!Number.isNaN(leftDate) && !Number.isNaN(rightDate)) {
      return leftDate - rightDate;
    }
  }

  const leftNumeric = Number(leftText);
  const rightNumeric = Number(rightText);
  if (
    leftText.trim() !== "" &&
    rightText.trim() !== "" &&
    !Number.isNaN(leftNumeric) &&
    !Number.isNaN(rightNumeric)
  ) {
    return leftNumeric - rightNumeric;
  }

  return leftText.localeCompare(rightText, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function resolveNextSortState(
  currentSortState: DataTableSortState | null,
  columnId: string
): DataTableSortState | null {
  if (!currentSortState || currentSortState.columnId !== columnId) {
    return {
      columnId,
      direction: "asc",
    };
  }

  if (currentSortState.direction === "asc") {
    return {
      columnId,
      direction: "desc",
    };
  }

  return null;
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
  rowActions = [],
  columnActions = [],
  onColumnOrderChange,
  onColumnResize,
  sortState,
  defaultSortState = null,
  onSortChange,
  sortingMode = "client",
  groupByColumnId = null,
  subgroupByColumnId = null,
  renderGroupHeader,
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

  const orderedColumnMap = React.useMemo(
    () => new Map(orderedColumns.map((column) => [column.id, column])),
    [orderedColumns]
  );

  const groupingColumn = React.useMemo(
    () => (groupByColumnId ? orderedColumnMap.get(groupByColumnId) : undefined),
    [groupByColumnId, orderedColumnMap]
  );

  const subgroupingColumn = React.useMemo(() => {
    if (!subgroupByColumnId || subgroupByColumnId === groupByColumnId) {
      return undefined;
    }

    return orderedColumnMap.get(subgroupByColumnId);
  }, [groupByColumnId, orderedColumnMap, subgroupByColumnId]);

  const [columnWidths, setColumnWidths] = React.useState<Record<string, number>>(
    {}
  );
  const [resizingColumn, setResizingColumn] = React.useState<{
    columnId: string;
    startX: number;
    startWidth: number;
  } | null>(null);
  const [contextMenuState, setContextMenuState] =
    React.useState<DataTableContextMenuState<T>>(null);

  const isSortControlled = sortState !== undefined;
  const [internalSortState, setInternalSortState] =
    React.useState<DataTableSortState | null>(defaultSortState);

  const effectiveSortState = isSortControlled
    ? (sortState ?? null)
    : internalSortState;

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

  const rowEntries = React.useMemo(
    () =>
      rows.map((row, rowIndex) => ({
        row,
        rowId: resolveRowId(row, rowIndex),
        originalIndex: rowIndex,
      })),
    [rows, resolveRowId]
  );

  const sortedRowEntries = React.useMemo(() => {
    if (sortingMode === "manual" || !effectiveSortState) {
      return rowEntries;
    }

    const sortableColumn = sortedVisibleColumns.find(
      (column) =>
        column.id === effectiveSortState.columnId && column.isSortable === true
    );
    if (!sortableColumn) {
      return rowEntries;
    }

    const directionMultiplier = effectiveSortState.direction === "asc" ? 1 : -1;

    return [...rowEntries].sort((leftEntry, rightEntry) => {
      const leftRecord = leftEntry.row as Record<string, unknown>;
      const rightRecord = rightEntry.row as Record<string, unknown>;
      const leftValue = leftRecord[sortableColumn.id];
      const rightValue = rightRecord[sortableColumn.id];
      const comparison = compareSortValues(
        leftValue,
        rightValue,
        sortableColumn.type
      );

      if (comparison === 0) {
        return leftEntry.originalIndex - rightEntry.originalIndex;
      }

      return comparison * directionMultiplier;
    });
  }, [effectiveSortState, rowEntries, sortedVisibleColumns, sortingMode]);

  const resolvedRowIds = React.useMemo(
    () => sortedRowEntries.map((entry) => entry.rowId),
    [sortedRowEntries]
  );

  const groupedRenderItems = React.useMemo(() => {
    const rowItems = sortedRowEntries.map((entry, index) => ({
      kind: "row" as const,
      key: `row-${String(entry.rowId)}`,
      row: entry.row,
      rowId: entry.rowId,
      rowIndex: index,
    }));

    if (!groupingColumn) {
      return rowItems satisfies GroupedRenderItem<T>[];
    }

    const groupBuckets = new Map<
      string,
      {
        value: unknown;
        rows: typeof sortedRowEntries;
      }
    >();

    sortedRowEntries.forEach((entry) => {
      const rowRecord = entry.row as Record<string, unknown>;
      const groupValue = rowRecord[groupingColumn.id];
      const groupKey = getGroupValueKey(groupValue);
      const bucket = groupBuckets.get(groupKey);

      if (bucket) {
        bucket.rows.push(entry);
        return;
      }

      groupBuckets.set(groupKey, {
        value: groupValue,
        rows: [entry],
      });
    });

    const items: GroupedRenderItem<T>[] = [];
    let rowCounter = 0;

    groupBuckets.forEach((groupBucket, groupKey) => {
      const groupLabelValue = formatGroupLabelValue(groupBucket.value);
      const groupLabel = `${groupingColumn.label}: ${groupLabelValue} (${groupBucket.rows.length})`;

      items.push({
        kind: "group-header",
        key: `group-${groupingColumn.id}-${groupKey}`,
        level: 1,
        label: groupLabel,
        rowCount: groupBucket.rows.length,
        value: groupBucket.value,
        column: groupingColumn,
      });

      if (!subgroupingColumn) {
        groupBucket.rows.forEach((entry) => {
          items.push({
            kind: "row",
            key: `row-${String(entry.rowId)}`,
            row: entry.row,
            rowId: entry.rowId,
            rowIndex: rowCounter,
          });
          rowCounter += 1;
        });
        return;
      }

      const subgroupBuckets = new Map<
        string,
        {
          value: unknown;
          rows: typeof sortedRowEntries;
        }
      >();

      groupBucket.rows.forEach((entry) => {
        const rowRecord = entry.row as Record<string, unknown>;
        const subgroupValue = rowRecord[subgroupingColumn.id];
        const subgroupKey = getGroupValueKey(subgroupValue);
        const subgroupBucket = subgroupBuckets.get(subgroupKey);

        if (subgroupBucket) {
          subgroupBucket.rows.push(entry);
          return;
        }

        subgroupBuckets.set(subgroupKey, {
          value: subgroupValue,
          rows: [entry],
        });
      });

      subgroupBuckets.forEach((subgroupBucket, subgroupKey) => {
        const subgroupLabelValue = formatGroupLabelValue(subgroupBucket.value);
        const subgroupLabel = `${subgroupingColumn.label}: ${subgroupLabelValue} (${subgroupBucket.rows.length})`;

        items.push({
          kind: "group-header",
          key: `subgroup-${groupingColumn.id}-${groupKey}-${subgroupingColumn.id}-${subgroupKey}`,
          level: 2,
          label: subgroupLabel,
          rowCount: subgroupBucket.rows.length,
          value: subgroupBucket.value,
          column: subgroupingColumn,
        });

        subgroupBucket.rows.forEach((entry) => {
          items.push({
            kind: "row",
            key: `row-${String(entry.rowId)}`,
            row: entry.row,
            rowId: entry.rowId,
            rowIndex: rowCounter,
          });
          rowCounter += 1;
        });
      });
    });

    return items;
  }, [groupingColumn, sortedRowEntries, subgroupingColumn]);

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

  const emitSortChange = React.useCallback(
    (nextSortState: DataTableSortState | null) => {
      if (!isSortControlled) {
        setInternalSortState(nextSortState);
      }
      onSortChange?.(nextSortState);
    },
    [isSortControlled, onSortChange]
  );

  const handleSortToggle = React.useCallback(
    (columnId: string) => {
      const targetColumn = sortedVisibleColumns.find(
        (column) => column.id === columnId
      );
      if (!targetColumn || targetColumn.isSortable !== true) {
        return;
      }

      const nextSortState = resolveNextSortState(effectiveSortState, columnId);
      emitSortChange(nextSortState);
    },
    [effectiveSortState, emitSortChange, sortedVisibleColumns]
  );

  React.useEffect(() => {
    if (!effectiveSortState || isSortControlled) {
      return;
    }

    const activeColumn = sortedVisibleColumns.find(
      (column) => column.id === effectiveSortState.columnId
    );
    if (!activeColumn || activeColumn.isSortable !== true) {
      setInternalSortState(null);
    }
  }, [effectiveSortState, isSortControlled, sortedVisibleColumns]);

  const handleRowContextMenu = React.useCallback(
    (event: React.MouseEvent, row: T, rowId: RowId) => {
      if (rowActions.length === 0) {
        return;
      }

      event.preventDefault();
      setContextMenuState({
        kind: "row",
        x: event.clientX,
        y: event.clientY,
        row,
        rowId,
      });
    },
    [rowActions.length]
  );

  const handleColumnContextMenu = React.useCallback(
    (event: React.MouseEvent, column: NormalizedDataTableColumn<T>) => {
      if (columnActions.length === 0) {
        return;
      }

      event.preventDefault();
      setContextMenuState({
        kind: "column",
        x: event.clientX,
        y: event.clientY,
        column,
      });
    },
    [columnActions.length]
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
    <DropdownMenu
      open={contextMenuState !== null}
      onOpenChange={(open) => {
        if (!open) {
          setContextMenuState(null);
        }
      }}
    >
      {contextMenuState ? (
        <DropdownMenuTrigger asChild>
          <div
            aria-hidden
            style={{
              position: "fixed",
              left: contextMenuState.x,
              top: contextMenuState.y,
              width: 1,
              height: 1,
              pointerEvents: "none",
            }}
          />
        </DropdownMenuTrigger>
      ) : null}
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
              sortState={effectiveSortState}
              onSortToggle={handleSortToggle}
              onColumnContextMenu={handleColumnContextMenu}
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
                ? groupedRenderItems.map((item) => {
                    if (item.kind === "group-header") {
                      const headerContent = renderGroupHeader
                        ? renderGroupHeader({
                            level: item.level,
                            column: item.column,
                            value: item.value,
                            label: item.label,
                            rowCount: item.rowCount,
                          })
                        : item.label;

                      return (
                        <DataTableRow
                          key={item.key}
                          data-group-header="true"
                          data-group-level={String(item.level)}
                          className={cn(
                            item.level === 1 ? classNames?.groupHeaderRow : classNames?.subgroupHeaderRow,
                            item.level === 1
                              ? "bg-zinc-100/90 hover:bg-zinc-100/90"
                              : "bg-zinc-50 hover:bg-zinc-50"
                          )}
                        >
                          <DataTableCell
                            colSpan={resolvedColumnCount}
                            className={cn(
                              "px-3 py-2 font-medium text-zinc-700",
                              item.level === 2 ? "pl-8 text-zinc-600" : "text-zinc-800",
                              classNames?.groupHeaderCell
                            )}
                          >
                            {headerContent}
                          </DataTableCell>
                        </DataTableRow>
                      );
                    }

                    const { row, rowId, rowIndex } = item;
                    const isSelected = effectiveSelectedRowIds.has(rowId);
                    return (
                      <DataTableRow
                        key={item.key}
                        data-row-id={String(rowId)}
                        data-selected={isSelected ? "true" : "false"}
                        className={cn(classNames?.row, isSelected ? "bg-zinc-50" : undefined)}
                        onContextMenu={(event) =>
                          handleRowContextMenu(event, row, rowId)
                        }
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
      {contextMenuState ? (
        <DropdownMenuContent
          align="start"
          sideOffset={2}
          className="min-w-44"
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          {contextMenuState.kind === "row"
            ? rowActions.map((action) => (
                <DropdownMenuItem
                  key={`${String(contextMenuState.rowId)}-ctx-${action.value}`}
                  onSelect={() => {
                    action.action(contextMenuState.row, {
                      row: contextMenuState.row,
                      rowId: contextMenuState.rowId,
                    });
                    setContextMenuState(null);
                  }}
                  className="cursor-pointer"
                >
                  {action.icon ? (
                    <span className="mr-2 inline-flex">{action.icon}</span>
                  ) : null}
                  {action.label}
                </DropdownMenuItem>
              ))
            : columnActions.map((action) => (
                <DropdownMenuItem
                  key={`${contextMenuState.column.id}-ctx-${action.value}`}
                  onSelect={() => {
                    action.action(contextMenuState.column, {
                      column: contextMenuState.column,
                    });
                    setContextMenuState(null);
                  }}
                  className="cursor-pointer"
                >
                  {action.icon ? (
                    <span className="mr-2 inline-flex">{action.icon}</span>
                  ) : null}
                  {action.label}
                </DropdownMenuItem>
              ))}
        </DropdownMenuContent>
      ) : null}
    </DropdownMenu>
  );
}
