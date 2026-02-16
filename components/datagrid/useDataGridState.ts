"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { reorderList } from "./dnd";
import type { DataGridColumn, DataGridProps, SortState } from "./types";

interface DataGridState<TData> {
  columns: DataGridColumn<TData>[];
  setColumns: (next: DataGridColumn<TData>[]) => void;
  orderedColumns: DataGridColumn<TData>[];
  columnOrder: string[];
  reorderColumns: (fromId: string, toId: string) => void;
  resetColumnOrder: () => void;
  sorting: SortState[];
  toggleSort: (columnId: string) => void;
  setColumnSort: (columnId: string, direction: "asc" | "desc" | null) => void;
  rows: TData[];
  rowIds: string[];
  totalRows: number;
  visibleRowCount: number;
  hasMoreRows: boolean;
  isLoadingMoreRows: boolean;
  loadMoreRows: () => void;
  reorderRows: (fromId: string, toId: string) => void;
  pinnedColumnIds: string[];
  setPinnedColumn: (columnId: string, pinState: "left" | false) => void;
  selectedRowIdSet: Set<string>;
  isAllVisibleSelected: boolean;
  isSomeVisibleSelected: boolean;
  toggleRowSelection: (rowId: string) => void;
  toggleAllVisibleSelection: () => void;
  columnWidths: Record<string, number | undefined>;
  setColumnWidth: (columnId: string, width: number) => void;
}

const DEFAULT_INITIAL_VISIBLE_ROWS = 25;

export function useDataGridState<TData>(
  props: DataGridProps<TData>,
): DataGridState<TData> {
  const {
    data,
    columns: externalColumns,
    getRowId,
    sortingMode = "client",
    sortingState,
    defaultSortingState,
    onSortingChange,
    initialVisibleRowCount = DEFAULT_INITIAL_VISIBLE_ROWS,
    visibleRowIncrement,
    hasMoreRows: hasMoreRowsFromServer,
    isLoadingMoreRows: externalIsLoadingMoreRows,
    onLoadMoreRows,
    onRowOrderChange,
    onColumnOrderChange,
    onColumnsChange,
    onColumnResize,
    maxPinnedColumns,
    onPinLimitExceeded,
    selectedRowIds,
    defaultSelectedRowIds,
    onSelectedRowIdsChange,
  } = props;

  const resolvedInitialVisibleRowCount = Math.max(1, initialVisibleRowCount);
  const resolvedVisibleRowIncrement = Math.max(
    1,
    visibleRowIncrement ?? resolvedInitialVisibleRowCount,
  );

  const [columns, setInternalColumns] =
    useState<DataGridColumn<TData>[]>(externalColumns);
  const [internalSorting, setInternalSorting] = useState<SortState[]>(
    defaultSortingState ?? [],
  );
  const [visibleRowCount, setVisibleRowCount] = useState(
    resolvedInitialVisibleRowCount,
  );
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    externalColumns.map((column) => column.id),
  );
  const [pinnedColumnIds, setPinnedColumnIds] = useState<string[]>([]);
  const [rowOrder, setRowOrder] = useState<string[]>(() =>
    data.map((row, index) => getRowId(row, index)),
  );
  const [isInternalLoadingMoreRows, setIsInternalLoadingMoreRows] =
    useState(false);
  const [internalSelectedRowIds, setInternalSelectedRowIds] = useState<string[]>(
    defaultSelectedRowIds ?? [],
  );
  const [columnWidths, setInternalColumnWidths] = useState<
    Record<string, number | undefined>
  >(() => {
    return Object.fromEntries(
      externalColumns.map((column) => [column.id, column.width]),
    );
  });

  useEffect(() => {
    setInternalColumns(externalColumns);
  }, [externalColumns]);

  useEffect(() => {
    const validIds = new Set(columns.map((column) => column.id));
    setColumnOrder((prev) => {
      const kept = prev.filter((id) => validIds.has(id));
      const missing = columns
        .map((column) => column.id)
        .filter((id) => !kept.includes(id));
      return [...kept, ...missing];
    });
  }, [columns]);

  useEffect(() => {
    const ids = data.map((row, index) => getRowId(row, index));
    setRowOrder((prev) => {
      const kept = prev.filter((id) => ids.includes(id));
      const missing = ids.filter((id) => !kept.includes(id));
      return [...kept, ...missing];
    });
  }, [data, getRowId]);

  useEffect(() => {
    const validIds = new Set(columns.map((column) => column.id));
    setPinnedColumnIds((prev) => prev.filter((id) => validIds.has(id)));
  }, [columns]);

  useEffect(() => {
    setInternalColumnWidths((prev) => {
      const next: Record<string, number | undefined> = {};
      for (const column of columns) {
        next[column.id] = prev[column.id] ?? column.width;
      }
      return next;
    });
  }, [columns]);

  const sorting = sortingState ?? internalSorting;
  const resolvedSelectedRowIds = selectedRowIds ?? internalSelectedRowIds;

  const setColumns = useCallback(
    (next: DataGridColumn<TData>[]) => {
      setInternalColumns(next);
      onColumnsChange?.(next);
    },
    [onColumnsChange],
  );

  const setSorting = useCallback(
    (next: SortState[]) => {
      if (sortingState === undefined) {
        setInternalSorting(next);
      }
      onSortingChange?.(next);
    },
    [onSortingChange, sortingState],
  );

  const reorderColumns = useCallback(
    (fromId: string, toId: string) => {
      setColumnOrder((prev) => {
        const fromIndex = prev.indexOf(fromId);
        const toIndex = prev.indexOf(toId);
        if (fromIndex < 0 || toIndex < 0) {
          return prev;
        }
        const next = reorderList(prev, fromIndex, toIndex);
        onColumnOrderChange?.(next);
        return next;
      });
    },
    [onColumnOrderChange],
  );

  const resetColumnOrder = useCallback(() => {
    const nextOrder = columns.map((column) => column.id);
    setColumnOrder(nextOrder);
    onColumnOrderChange?.(nextOrder);
  }, [columns, onColumnOrderChange]);

  const orderedColumns = useMemo(() => {
    const columnMap = new Map(columns.map((column) => [column.id, column]));
    return columnOrder
      .map((id) => columnMap.get(id))
      .filter((column): column is DataGridColumn<TData> => !!column);
  }, [columnOrder, columns]);

  const toggleSort = useCallback(
    (columnId: string) => {
      const current = sorting.find((item) => item.id === columnId);
      if (!current) {
        setSorting([{ id: columnId, desc: false }]);
        return;
      }
      if (!current.desc) {
        setSorting([{ id: columnId, desc: true }]);
        return;
      }
      setSorting([]);
    },
    [setSorting, sorting],
  );

  const setColumnSort = useCallback(
    (columnId: string, direction: "asc" | "desc" | null) => {
      if (direction === null) {
        setSorting([]);
        return;
      }
      setSorting([{ id: columnId, desc: direction === "desc" }]);
    },
    [setSorting],
  );

  const entryMap = useMemo(() => {
    const map = new Map<string, { id: string; row: TData }>();
    data.forEach((row, index) => {
      const id = getRowId(row, index);
      map.set(id, { id, row });
    });
    return map;
  }, [data, getRowId]);

  const orderedEntries = useMemo(() => {
    return rowOrder
      .map((id) => entryMap.get(id))
      .filter((entry): entry is { id: string; row: TData } => entry !== undefined);
  }, [entryMap, rowOrder]);

  const sortedEntries = useMemo(() => {
    if (sortingMode !== "client" || sorting.length === 0) {
      return orderedEntries;
    }

    const sorted = [...orderedEntries];
    sorted.sort((leftEntry, rightEntry) => {
      for (const descriptor of sorting) {
        const column = orderedColumns.find((item) => item.id === descriptor.id);
        if (!column) {
          continue;
        }

        const leftValue = readColumnValue(leftEntry.row, column);
        const rightValue = readColumnValue(rightEntry.row, column);
        const comparison = compareValues(leftValue, rightValue);
        if (comparison === 0) {
          continue;
        }
        return descriptor.desc ? comparison * -1 : comparison;
      }
      return 0;
    });
    return sorted;
  }, [orderedColumns, orderedEntries, sorting, sortingMode]);

  useEffect(() => {
    setVisibleRowCount((prev) => {
      if (sortedEntries.length === 0) {
        return 0;
      }

      if (prev === 0) {
        return Math.min(resolvedInitialVisibleRowCount, sortedEntries.length);
      }

      if (prev > sortedEntries.length) {
        return sortedEntries.length;
      }

      return prev;
    });
  }, [resolvedInitialVisibleRowCount, sortedEntries.length]);

  const localHasMoreRows = visibleRowCount < sortedEntries.length;
  const shouldLoadFromServer =
    Boolean(onLoadMoreRows) && Boolean(hasMoreRowsFromServer);
  const hasMoreRows = localHasMoreRows || shouldLoadFromServer;
  const isLoadingMoreRows = externalIsLoadingMoreRows ?? isInternalLoadingMoreRows;

  const loadMoreRows = useCallback(() => {
    if (localHasMoreRows) {
      setVisibleRowCount((prev) =>
        Math.min(prev + resolvedVisibleRowIncrement, sortedEntries.length),
      );
      return;
    }

    if (!onLoadMoreRows || !hasMoreRowsFromServer || isLoadingMoreRows) {
      return;
    }

    const result = onLoadMoreRows();
    if (result && typeof (result as Promise<void>).then === "function") {
      setIsInternalLoadingMoreRows(true);
      void Promise.resolve(result).finally(() => {
        setIsInternalLoadingMoreRows(false);
      });
    }
  }, [
    hasMoreRowsFromServer,
    isLoadingMoreRows,
    localHasMoreRows,
    onLoadMoreRows,
    resolvedVisibleRowIncrement,
    sortedEntries.length,
  ]);

  const visibleEntries = useMemo(() => {
    return sortedEntries.slice(0, visibleRowCount);
  }, [sortedEntries, visibleRowCount]);

  const rowIds = useMemo(() => {
    return visibleEntries.map((entry) => entry.id);
  }, [visibleEntries]);

  const rows = useMemo(() => {
    return visibleEntries.map((entry) => entry.row);
  }, [visibleEntries]);

  const reorderRows = useCallback(
    (fromId: string, toId: string) => {
      setRowOrder((prev) => {
        const fromIndex = prev.indexOf(fromId);
        const toIndex = prev.indexOf(toId);
        if (fromIndex < 0 || toIndex < 0) {
          return prev;
        }
        const next = reorderList(prev, fromIndex, toIndex);
        const nextRows = next
          .map((id) => entryMap.get(id)?.row)
          .filter((row): row is TData => row !== undefined);
        onRowOrderChange?.(next, nextRows);
        return next;
      });
    },
    [entryMap, onRowOrderChange],
  );

  const pinLimit = maxPinnedColumns ?? Math.floor(orderedColumns.length / 2);
  const setPinnedColumn = useCallback(
    (columnId: string, pinState: "left" | false) => {
      setPinnedColumnIds((prev) => {
        if (pinState === false) {
          return prev.filter((id) => id !== columnId);
        }

        if (prev.includes(columnId)) {
          return prev;
        }

        if (prev.length >= pinLimit) {
          onPinLimitExceeded?.(pinLimit);
          return prev;
        }
        return [...prev, columnId];
      });
    },
    [onPinLimitExceeded, pinLimit],
  );

  const setSelectedRows = useCallback(
    (nextIds: string[]) => {
      const dedupedIds = Array.from(new Set(nextIds));
      if (selectedRowIds === undefined) {
        setInternalSelectedRowIds(dedupedIds);
      }
      const nextRows = dedupedIds
        .map((id) => entryMap.get(id)?.row)
        .filter((row): row is TData => row !== undefined);
      onSelectedRowIdsChange?.(dedupedIds, nextRows);
    },
    [entryMap, onSelectedRowIdsChange, selectedRowIds],
  );

  const selectedRowIdSet = useMemo(() => {
    return new Set(resolvedSelectedRowIds);
  }, [resolvedSelectedRowIds]);

  const toggleRowSelection = useCallback(
    (rowId: string) => {
      const next = selectedRowIdSet.has(rowId)
        ? resolvedSelectedRowIds.filter((id) => id !== rowId)
        : [...resolvedSelectedRowIds, rowId];
      setSelectedRows(next);
    },
    [resolvedSelectedRowIds, selectedRowIdSet, setSelectedRows],
  );

  const isAllVisibleSelected =
    rowIds.length > 0 && rowIds.every((id) => selectedRowIdSet.has(id));
  const isSomeVisibleSelected =
    rowIds.some((id) => selectedRowIdSet.has(id)) && !isAllVisibleSelected;

  const toggleAllVisibleSelection = useCallback(() => {
    if (rowIds.length === 0) {
      return;
    }

    if (isAllVisibleSelected) {
      const next = resolvedSelectedRowIds.filter((id) => !rowIds.includes(id));
      setSelectedRows(next);
      return;
    }

    setSelectedRows([...resolvedSelectedRowIds, ...rowIds]);
  }, [
    isAllVisibleSelected,
    resolvedSelectedRowIds,
    rowIds,
    setSelectedRows,
  ]);

  const setColumnWidth = useCallback(
    (columnId: string, width: number) => {
      const safeWidth = Math.max(1, Math.round(width));
      setInternalColumnWidths((prev) => {
        if (prev[columnId] === safeWidth) {
          return prev;
        }
        return {
          ...prev,
          [columnId]: safeWidth,
        };
      });
      onColumnResize?.(columnId, safeWidth);
    },
    [onColumnResize],
  );

  return {
    columns,
    setColumns,
    orderedColumns,
    columnOrder,
    reorderColumns,
    resetColumnOrder,
    sorting,
    toggleSort,
    setColumnSort,
    rows,
    rowIds,
    totalRows: sortedEntries.length,
    visibleRowCount,
    hasMoreRows,
    isLoadingMoreRows,
    loadMoreRows,
    reorderRows,
    pinnedColumnIds,
    setPinnedColumn,
    selectedRowIdSet,
    isAllVisibleSelected,
    isSomeVisibleSelected,
    toggleRowSelection,
    toggleAllVisibleSelection,
    columnWidths,
    setColumnWidth,
  };
}

function readColumnValue<TData>(
  row: TData,
  column: DataGridColumn<TData>,
): unknown {
  if (column.accessorFn) {
    return column.accessorFn(row);
  }
  if (column.accessorKey) {
    return row[column.accessorKey];
  }
  return undefined;
}

function compareValues(left: unknown, right: unknown): number {
  if (left == null && right == null) {
    return 0;
  }
  if (left == null) {
    return -1;
  }
  if (right == null) {
    return 1;
  }
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }
  if (left instanceof Date && right instanceof Date) {
    return left.getTime() - right.getTime();
  }
  return String(left).localeCompare(String(right));
}
