"use client";

import { useRef } from "react";
import type { CSSProperties, DragEvent, MouseEvent } from "react";

import { cx } from "./class-slots";
import type { DataGridClassNames, DataGridColumn, SortState } from "./types";

interface DataGridColumnHeaderProps<TData> {
  column: DataGridColumn<TData>;
  classNames: DataGridClassNames;
  isPinned: boolean;
  pinnedStyle?: CSSProperties;
  isSortable: boolean;
  activeSort?: SortState;
  onSortChange: (direction: "asc" | "desc" | null) => void;
  canPin: boolean;
  onPinToggle: () => void;
  enableColumnDrag: boolean;
  onDragStart: (event: DragEvent<HTMLElement>) => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
  enableColumnResize: boolean;
  canResize: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  onResize: (width: number) => void;
}

export function DataGridColumnHeader<TData>({
  column,
  classNames,
  isPinned,
  pinnedStyle,
  isSortable,
  activeSort,
  onSortChange,
  canPin,
  onPinToggle,
  enableColumnDrag,
  onDragStart,
  onDragOver,
  onDrop,
  enableColumnResize,
  canResize,
  width,
  minWidth,
  maxWidth,
  onResize,
}: DataGridColumnHeaderProps<TData>) {
  const headerRef = useRef<HTMLTableCellElement>(null);

  const onResizeStart = (event: MouseEvent<HTMLButtonElement>) => {
    if (!enableColumnResize || !canResize) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startWidth = width ?? headerRef.current?.getBoundingClientRect().width ?? 180;
    const resolvedMinWidth = minWidth ?? 80;
    const resolvedMaxWidth = maxWidth ?? Number.POSITIVE_INFINITY;

    const onMove = (moveEvent: globalThis.MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const rawWidth = startWidth + deltaX;
      const nextWidth = Math.max(
        resolvedMinWidth,
        Math.min(resolvedMaxWidth, rawWidth),
      );
      onResize(nextWidth);
    };

    const onEnd = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
  };

  return (
    <th
      ref={headerRef}
      scope="col"
      className={cx(
        classNames.headerCell,
        isPinned && classNames.pinnedLeft,
        "relative",
        column.headerClassName,
      )}
      style={{
        ...pinnedStyle,
        width,
        minWidth,
        maxWidth,
      }}
      onDragOver={enableColumnDrag ? onDragOver : undefined}
      onDrop={enableColumnDrag ? onDrop : undefined}
    >
      <div className="flex items-center gap-2 pr-2">
        {enableColumnDrag ? (
          <span
            className={classNames.dragHandle}
            aria-label="Drag column"
            draggable
            onDragStart={onDragStart}
          >
            ::
          </span>
        ) : null}
        <span className="min-w-0 flex-1 truncate">{column.header}</span>
        {activeSort ? (
          <span className="text-xs text-zinc-500">
            {activeSort.desc ? "▼" : "▲"}
          </span>
        ) : null}
        {(isSortable || canPin) ? (
          <details className="relative">
            <summary
              className="list-none cursor-pointer rounded px-1 text-base leading-none text-zinc-600 hover:bg-zinc-200"
              aria-label={`Open column actions for ${column.id}`}
            >
              ⋯
            </summary>
            <div className="absolute right-0 z-20 mt-1 min-w-44 rounded-md border border-zinc-200 bg-white p-1 shadow-lg">
              {isSortable ? (
                <>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs hover:bg-zinc-100"
                    onClick={() => onSortChange("asc")}
                  >
                    <span>Sort ascending</span>
                    {activeSort && !activeSort.desc ? <span>✓</span> : null}
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs hover:bg-zinc-100"
                    onClick={() => onSortChange("desc")}
                  >
                    <span>Sort descending</span>
                    {activeSort?.desc ? <span>✓</span> : null}
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center rounded px-2 py-1.5 text-left text-xs hover:bg-zinc-100"
                    onClick={() => onSortChange(null)}
                  >
                    Clear sorting
                  </button>
                </>
              ) : null}
              {canPin ? (
                <button
                  type="button"
                  className="flex w-full items-center rounded px-2 py-1.5 text-left text-xs hover:bg-zinc-100"
                  onClick={onPinToggle}
                >
                  {isPinned ? "Unpin column" : "Pin column"}
                </button>
              ) : null}
            </div>
          </details>
        ) : null}
      </div>
      {enableColumnResize && canResize ? (
        <button
          type="button"
          className={classNames.resizeHandle}
          onMouseDown={onResizeStart}
          aria-label={`Resize ${column.id}`}
        />
      ) : null}
    </th>
  );
}
