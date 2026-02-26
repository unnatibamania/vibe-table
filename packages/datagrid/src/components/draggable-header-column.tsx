"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../lib/cn";
import type { DataTableColumnAction } from "../types/actions";
import type { NormalizedDataTableColumn } from "../types/column";
import type { DataTableClassNames } from "../types/class-names";
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
  classNames?: DataTableClassNames;
  onColumnContextMenu?: (
    event: React.MouseEvent,
    column: NormalizedDataTableColumn<T>
  ) => void;
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
  classNames,
  onColumnContextMenu,
}: DraggableHeaderColumnProps<T>) {
  const columnRef = React.useRef<HTMLTableCellElement | null>(null);
  const [columnWidth, setColumnWidth] = React.useState<number | null>(null);

  const isPinned = pinSide === "left" || pinSide === "right";
  const isDraggable = !isPinned && column.isDraggable !== false;

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
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
    backgroundColor: isPinned ? "rgb(248 250 252)" : undefined,
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

  const sortIcon = !isSortable ? null : (
    <span className="inline-flex flex-col items-center leading-none">
      <ChevronUp
        className={cn(
          "h-3 w-3 transition-colors",
          sortDirection === "asc" ? "text-slate-700" : "text-slate-400"
        )}
      />
      <ChevronDown
        className={cn(
          "-mt-0.5 h-3 w-3 transition-colors",
          sortDirection === "desc" ? "text-slate-700" : "text-slate-400"
        )}
      />
    </span>
  );

  const HeaderIcon = column.Icon;
  const activatorProps = isDraggable
    ? {
        ...attributes,
        ...listeners,
        "data-testid": `drag-handle-${column.id}`,
      }
    : {};

  return (
    <DataTableColumn
      ref={setRefs}
      minWidth={column.minWidth}
      maxWidth={column.maxWidth}
      className={cn(
        className,
        isPinned ? "bg-slate-50/90" : undefined,
        isDragging ? "bg-white/95 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]" : undefined
      )}
      style={style}
      data-draggable={isDraggable ? "true" : "false"}
      data-pin-side={pinSide ?? undefined}
      aria-sort={ariaSortValue as React.AriaAttributes["aria-sort"]}
      onContextMenu={(event) => onColumnContextMenu?.(event, column)}
    >
      <div
        ref={isDraggable ? setActivatorNodeRef : undefined}
        className={cn(
          "flex items-center justify-between gap-2",
          isDraggable
            ? "cursor-grab touch-none active:cursor-grabbing"
            : undefined,
          isDraggable ? classNames?.dragHandle : undefined
        )}
        {...activatorProps}
      >
        <div className="flex min-w-0 items-center gap-1">
          {isSortable ? (
            <div className="inline-flex min-w-0 items-center gap-2 pl-3 pr-1 py-0.5 text-left">
              {HeaderIcon ? (
                <HeaderIcon className="h-3.5 w-3.5 shrink-0 text-slate-500" />
              ) : null}
              <span className="truncate">{column.header ?? column.label}</span>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center justify-center rounded-sm p-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400",
                  classNames?.sortTrigger
                )}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => onSortToggle?.(column.id)}
                data-testid={`sort-trigger-${column.id}`}
                aria-label={`Sort by ${column.label}`}
              >
                {sortIcon}
              </button>
            </div>
          ) : (
            <span className="inline-flex min-w-0 items-center gap-1 truncate pl-3 font-medium text-slate-700">
              {HeaderIcon ? (
                <HeaderIcon className="h-3.5 w-3.5 shrink-0 text-slate-500" />
              ) : null}
              <span className="truncate">{column.header ?? column.label}</span>
            </span>
          )}
        </div>
        {column.showColumnActions === false ? null : (
          <ColumnActionsMenu
            column={column}
            actions={columnActions}
            triggerClassName={classNames?.columnActionsTrigger}
          />
        )}
      </div>
      {isResizable ? (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={`Resize column ${column.label}`}
          data-testid={`resize-handle-${column.id}`}
          className={cn(
            "absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent transition-colors duration-200 hover:bg-slate-300/80",
            isResizing ? "bg-teal-500/60" : undefined,
            classNames?.resizeHandle
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
