"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "../lib/cn";
import type { DataTableColumnAction } from "../types/actions";
import type { NormalizedDataTableColumn } from "../types/column";
import { ColumnActionsMenu } from "./column-actions-menu";
import { DataTableColumn } from "./DataTableColumn";

interface DraggableHeaderColumnProps<T extends object> {
  column: NormalizedDataTableColumn<T>;
  className?: string;
  columnActions: DataTableColumnAction<T>[];
}

export function DraggableHeaderColumn<T extends object>({
  column,
  className,
  columnActions,
}: DraggableHeaderColumnProps<T>) {
  const columnRef = React.useRef<HTMLTableCellElement | null>(null);
  const [columnWidth, setColumnWidth] = React.useState<number | null>(null);

  const isDraggable = column.isDraggable !== false;

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
    setColumnWidth(nextWidth);
  }, [column.id, isDragging]);

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
    position: "relative",
    zIndex: isDragging ? 10 : undefined,
    width: columnWidth ? `${columnWidth}px` : undefined,
  };

  return (
    <DataTableColumn
      ref={setRefs}
      minWidth={column.minWidth}
      maxWidth={column.maxWidth}
      className={cn(className, isDragging ? "bg-zinc-100/70" : undefined)}
      style={style}
      data-draggable={isDraggable ? "true" : "false"}
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
          <span className="truncate">{column.header ?? column.label}</span>
        </div>
        {column.showColumnActions === false ? null : (
          <ColumnActionsMenu column={column} actions={columnActions} />
        )}
      </div>
    </DataTableColumn>
  );
}
