"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowUp, ArrowUpDown, GripVertical } from "lucide-react";
import { cn } from "../lib/cn";
import type { DataTableColumnAction } from "../types/actions";
import type { NormalizedDataTableColumn } from "../types/column";
import type { DataTableSortDirection } from "../types/table";
import { ColumnActionsMenu } from "./column-actions-menu";
import { DataTableColumn } from "./DataTableColumn";

interface DraggableHeaderColumnProps<T extends object> {
  column: NormalizedDataTableColumn<T>;
  className?: string;
  columnActions: DataTableColumnAction<T>[];
  width?: number;
  isResizing?: boolean;
  onResizeStart?: (columnId: string, startX: number, startWidth: number) => void;
  onColumnWidthMeasure?: (columnId: string, width: number) => void;
  pinSide?: "left" | "right" | null;
  pinOffset?: number;
  isSortable?: boolean;
  sortDirection?: DataTableSortDirection | null;
  onSortToggle?: (columnId: string) => void;
}

export function DraggableHeaderColumn<T extends object>({
  column,
  className,
  columnActions,
  width,
  isResizing = false,
  onResizeStart,
  onColumnWidthMeasure,
  pinSide = null,
  pinOffset = 0,
  isSortable = false,
  sortDirection = null,
  onSortToggle,
}: DraggableHeaderColumnProps<T>) {
  const columnRef = React.useRef<HTMLTableCellElement | null>(null);
  const [columnWidth, setColumnWidth] = React.useState<number | null>(null);

  const isPinned = pinSide === "left" || pinSide === "right";
  const isDraggable = !isPinned && column.isDraggable !== false;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: column.id,
      disabled: !isDraggable,
    });

  const setRefs = React.useCallback(
    (node: HTMLTableCellElement | null) => {
      columnRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef]
  );

  React.useLayoutEffect(() => {
    if (!columnRef.current) {
      return;
    }
    const nextWidth = columnRef.current.getBoundingClientRect().width;
    if (nextWidth > 0) {
      onColumnWidthMeasure?.(column.id, nextWidth);
    }
    setColumnWidth(nextWidth);
  }, [column.id, isDragging, onColumnWidthMeasure]);

  const isResizable = column.isResizable !== false;
  const effectiveWidth = width ?? columnWidth;
  const isPinnedLeft = pinSide === "left";
  const isPinnedRight = pinSide === "right";
  const pinnedOffset = pinOffset ?? 0;

  const style: React.CSSProperties = {
    transform: transform
      ? CSS.Translate.toString({
          x: transform.x,
          y: 0,
          scaleX: 1,
          scaleY: 1,
        })
      : undefined,
    transition,
    position: isPinned ? "sticky" : "relative",
    left: isPinnedLeft ? `${pinnedOffset}px` : undefined,
    right: isPinnedRight ? `${pinnedOffset}px` : undefined,
    zIndex: isDragging ? 40 : isPinned ? 30 : undefined,
    backgroundColor: isPinned ? "rgb(250 250 250)" : undefined,
  };

  if (effectiveWidth && effectiveWidth > 0) {
    style.width = `${effectiveWidth}px`;
    style.minWidth = `${effectiveWidth}px`;
    style.maxWidth = `${effectiveWidth}px`;
  }

  const ariaSortValue = isSortable
    ? sortDirection === "asc"
      ? "ascending"
      : sortDirection === "desc"
        ? "descending"
        : "none"
    : undefined;

  const sortIcon = !isSortable ? null : sortDirection === "asc" ? (
    <ArrowUp className="h-3.5 w-3.5 text-zinc-700" />
  ) : sortDirection === "desc" ? (
    <ArrowDown className="h-3.5 w-3.5 text-zinc-700" />
  ) : (
    <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400" />
  );

  return (
    <DataTableColumn
      ref={setRefs}
      minWidth={column.minWidth}
      maxWidth={column.maxWidth}
      className={cn(
        className,
        isPinned ? "bg-zinc-50" : undefined,
        isDragging ? "bg-zinc-100/70 shadow-md" : undefined
      )}
      style={style}
      data-draggable={isDraggable ? "true" : "false"}
      data-pin-side={pinSide ?? undefined}
      aria-sort={ariaSortValue as React.AriaAttributes["aria-sort"]}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1">
          {isDraggable ? (
            <button
              type="button"
              className="inline-flex h-5 w-5 cursor-grab touch-none items-center justify-center rounded text-zinc-500 hover:bg-zinc-200 active:cursor-grabbing"
              aria-label={`Drag column ${column.label}`}
              data-testid={`drag-handle-${column.id}`}
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-3.5 w-3.5" />
            </button>
          ) : null}
          {isSortable ? (
            <button
              type="button"
              className="inline-flex min-w-0 items-center gap-2 rounded px-1 py-0.5 text-left hover:bg-zinc-100"
              onClick={() => onSortToggle?.(column.id)}
              data-testid={`sort-trigger-${column.id}`}
            >
              <span className="truncate">{column.header ?? column.label}</span>
              {sortIcon}
            </button>
          ) : (
            <span className="truncate">{column.header ?? column.label}</span>
          )}
        </div>
        {column.showColumnActions === false ? null : (
          <ColumnActionsMenu column={column} actions={columnActions} />
        )}
      </div>
      {isResizable ? (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={`Resize column ${column.label}`}
          data-testid={`resize-handle-${column.id}`}
          className={cn(
            "absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent transition-colors hover:bg-zinc-300",
            isResizing ? "bg-zinc-400" : undefined
          )}
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            const measuredWidth = columnRef.current?.getBoundingClientRect().width;
            const startWidth =
              measuredWidth && measuredWidth > 0
                ? measuredWidth
                : (width ?? column.minWidth ?? 120);
            onResizeStart?.(column.id, event.clientX, startWidth);
          }}
        />
      ) : null}
    </DataTableColumn>
  );
}
