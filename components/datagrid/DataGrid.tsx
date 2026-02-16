"use client";

import { useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";

import { mergeClassNames, cx } from "./class-slots";
import { DataGridColumnHeader } from "./DataGridColumnHeader";
import { DataGridRow } from "./DataGridRow";
import { getPinnedCellStyle, getPinnedLeftOffsets } from "./pinning";
import type { DataGridProps, DataGridRef } from "./types";
import { useDataGridState } from "./useDataGridState";

export function DataGrid<TData>(props: DataGridProps<TData>) {
  const {
    getRowId,
    enableRowDrag = false,
    enableColumnDrag = false,
    enableColumnResize = false,
    defaultColumnMinWidth = 80,
    defaultColumnMaxWidth,
    enablePinning = false,
    isSelectionEnabled = false,
    infiniteScrollThreshold = 200,
    rowActions,
    rowActionsMode = "menu",
    classNames: classNamesOverride,
    rowClassName,
    tableClassName,
    style,
    gridRef,
  } = props;

  const classNames = useMemo(
    () => mergeClassNames(classNamesOverride),
    [classNamesOverride],
  );
  const state = useDataGridState(props);

  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [draggedRowId, setDraggedRowId] = useState<string | null>(null);
  const hasMoreRows = state.hasMoreRows;
  const isLoadingMoreRows = state.isLoadingMoreRows;
  const loadMoreRows = state.loadMoreRows;

  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
  const selectionHeaderCheckboxRef = useRef<HTMLInputElement>(null);

  const pinnedOffsets = useMemo(
    () =>
      getPinnedLeftOffsets(
        state.orderedColumns,
        state.pinnedColumnIds,
        state.columnWidths,
      ),
    [state.columnWidths, state.orderedColumns, state.pinnedColumnIds],
  );

  useEffect(() => {
    const selectionCheckbox = selectionHeaderCheckboxRef.current;
    if (!selectionCheckbox) {
      return;
    }

    selectionCheckbox.indeterminate =
      state.isSomeVisibleSelected && !state.isAllVisibleSelected;
  }, [state.isAllVisibleSelected, state.isSomeVisibleSelected]);

  useEffect(() => {
    const root = tableWrapperRef.current;
    const sentinel = loadMoreSentinelRef.current;

    if (!root || !sentinel || !hasMoreRows) {
      return;
    }

    const useWrapperAsRoot = root.scrollHeight > root.clientHeight + 1;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting || isLoadingMoreRows) {
          return;
        }
        loadMoreRows();
      },
      {
        root: useWrapperAsRoot ? root : null,
        rootMargin: `${infiniteScrollThreshold}px 0px`,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [
    hasMoreRows,
    isLoadingMoreRows,
    infiniteScrollThreshold,
    loadMoreRows,
  ]);

  useImperativeHandle(
    gridRef,
    (): DataGridRef<TData> => ({
      addColumn: (column) => {
        state.setColumns([...state.columns, column]);
      },
      removeColumn: (columnId) => {
        state.setColumns(state.columns.filter((column) => column.id !== columnId));
      },
      pinColumn: (columnId, pinState) => {
        state.setPinnedColumn(columnId, pinState);
      },
      resetColumnOrder: () => {
        state.resetColumnOrder();
      },
      setColumnWidth: (columnId, width) => {
        state.setColumnWidth(columnId, width);
      },
    }),
    [state],
  );

  const showActionsColumn = !!rowActions && rowActions.length > 0;
  const totalColumnCount =
    state.orderedColumns.length +
    (showActionsColumn ? 1 : 0) +
    (isSelectionEnabled ? 1 : 0);

  return (
    <div className={classNames.root} style={style}>
      <div ref={tableWrapperRef} className={classNames.tableWrapper}>
        <table className={cx(classNames.table, tableClassName)}>
          <thead className={classNames.thead}>
            <tr className={classNames.headerRow}>
              {isSelectionEnabled ? (
                <th
                  scope="col"
                  className={cx(classNames.headerCell, classNames.selectionCell)}
                >
                  <input
                    ref={selectionHeaderCheckboxRef}
                    type="checkbox"
                    className={classNames.editorCheckbox}
                    checked={state.isAllVisibleSelected}
                    onChange={state.toggleAllVisibleSelection}
                    aria-label="Select all visible rows"
                  />
                </th>
              ) : null}
              {state.orderedColumns.map((column) => {
                const isPinned = state.pinnedColumnIds.includes(column.id);
                const activeSort = state.sorting.find((item) => item.id === column.id);
                const isSortable =
                  column.sortable ?? Boolean(column.accessorKey || column.accessorFn);
                const width = state.columnWidths[column.id] ?? column.width;
                const minWidth =
                  column.resizeMinWidth ?? column.minWidth ?? defaultColumnMinWidth;
                const maxWidth =
                  column.resizeMaxWidth ?? column.maxWidth ?? defaultColumnMaxWidth;
                const canResize = column.resizable ?? true;

                return (
                  <DataGridColumnHeader
                    key={column.id}
                    column={column}
                    classNames={classNames}
                    isPinned={isPinned}
                    pinnedStyle={getPinnedCellStyle(column.id, pinnedOffsets)}
                    isSortable={isSortable}
                    activeSort={activeSort}
                    onSortChange={(direction) =>
                      state.setColumnSort(column.id, direction)
                    }
                    canPin={enablePinning && (column.pinnable ?? true)}
                    onPinToggle={() =>
                      state.setPinnedColumn(column.id, isPinned ? false : "left")
                    }
                    enableColumnDrag={enableColumnDrag}
                    onDragStart={(event) =>
                      onColumnDragStart(event, column.id, setDraggedColumnId)
                    }
                    onDragOver={onColumnDragOver}
                    onDrop={(event) =>
                      onColumnDrop(event, column.id, draggedColumnId, state.reorderColumns)
                    }
                    enableColumnResize={enableColumnResize}
                    canResize={canResize}
                    width={width}
                    minWidth={minWidth}
                    maxWidth={maxWidth}
                    onResize={(nextWidth) => state.setColumnWidth(column.id, nextWidth)}
                  />
                );
              })}
              {showActionsColumn ? (
                <th
                  scope="col"
                  className={cx(classNames.headerCell, classNames.actionsCell)}
                >
                  <span className="sr-only">Actions</span>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className={classNames.body}>
            {state.rows.length === 0 ? (
              <tr>
                <td
                  colSpan={totalColumnCount}
                  className={classNames.emptyState}
                >
                  {state.isLoadingMoreRows ? (
                    <span className="inline-flex items-center gap-2 text-zinc-500">
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
                      Loading rows...
                    </span>
                  ) : (
                    "No rows found."
                  )}
                </td>
              </tr>
            ) : (
              <>
                {state.rows.map((row, index) => {
                  const rowId = state.rowIds[index] ?? getRowId(row, index);
                  return (
                    <DataGridRow
                      key={rowId}
                      row={row}
                      rowIndex={index}
                      rowId={rowId}
                      columns={state.orderedColumns}
                      classNames={classNames}
                      pinnedColumnIds={state.pinnedColumnIds}
                      pinnedOffsets={pinnedOffsets}
                      columnWidths={state.columnWidths}
                      enableRowDrag={enableRowDrag}
                      onDragStart={(event) =>
                        onRowDragStart(event, rowId, setDraggedRowId)
                      }
                      onDragOver={onDragOver}
                      onDrop={(event) =>
                        onRowDrop(event, rowId, draggedRowId, state.reorderRows)
                      }
                      rowActions={rowActions}
                      rowActionsMode={rowActionsMode}
                      rowClassName={rowClassName?.(row)}
                      isSelectionEnabled={isSelectionEnabled}
                      isRowSelected={state.selectedRowIdSet.has(rowId)}
                      onToggleSelection={() => state.toggleRowSelection(rowId)}
                    />
                  );
                })}
                {state.isLoadingMoreRows ? (
                  <tr>
                    <td colSpan={totalColumnCount} className="px-3 py-3 text-center">
                      <span className="inline-flex items-center gap-2 text-xs text-zinc-500">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
                        Loading more rows...
                      </span>
                    </td>
                  </tr>
                ) : null}
              </>
            )}
          </tbody>
        </table>
        {hasMoreRows ? <div ref={loadMoreSentinelRef} className="h-1" /> : null}
      </div>
      <div className="flex items-center justify-between gap-3 text-xs text-zinc-600">
        <span>
          Showing {state.rows.length} of {state.totalRows} loaded rows
        </span>
        {state.isLoadingMoreRows ? (
          <span>Loading more rows...</span>
        ) : hasMoreRows ? (
          <span>Scroll to load more</span>
        ) : (
          <span>End of rows</span>
        )}
      </div>
    </div>
  );
}

function onDragOver(event: DragEvent<HTMLElement>) {
  event.preventDefault();
}

function onColumnDragOver(event: DragEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  if (event.clientY < rect.top || event.clientY > rect.bottom) {
    return;
  }
  event.preventDefault();
}

function onColumnDragStart(
  event: DragEvent<HTMLElement>,
  columnId: string,
  setDraggedColumnId: (id: string) => void,
) {
  event.dataTransfer.effectAllowed = "move";
  setDraggedColumnId(columnId);
}

function onColumnDrop(
  event: DragEvent<HTMLElement>,
  targetColumnId: string,
  draggedColumnId: string | null,
  reorderColumns: (fromId: string, toId: string) => void,
) {
  const rect = event.currentTarget.getBoundingClientRect();
  if (event.clientY < rect.top || event.clientY > rect.bottom) {
    return;
  }

  event.preventDefault();
  if (!draggedColumnId || draggedColumnId === targetColumnId) {
    return;
  }
  reorderColumns(draggedColumnId, targetColumnId);
}

function onRowDragStart(
  event: DragEvent<HTMLElement>,
  rowId: string,
  setDraggedRowId: (id: string) => void,
) {
  event.dataTransfer.effectAllowed = "move";
  setDraggedRowId(rowId);
}

function onRowDrop(
  event: DragEvent<HTMLElement>,
  targetRowId: string,
  draggedRowId: string | null,
  reorderRows: (fromId: string, toId: string) => void,
) {
  event.preventDefault();
  if (!draggedRowId || draggedRowId === targetRowId) {
    return;
  }
  reorderRows(draggedRowId, targetRowId);
}
