import { cn } from "../lib/cn";
import type { DataTableHeaderProps } from "../types/table";
import { DataTableColumn } from "./DataTableColumn";
import { DataTableRow } from "./DataTableRow";
import { DraggableHeaderColumn } from "./draggable-header-column";
import { Checkbox } from "./ui/checkbox";
import { MoreHorizontal } from "lucide-react";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

export function DataTableHeader<T extends object>({
  columns,
  classNames,
  enableRowSelection = false,
  headerSelectionState = false,
  onToggleSelectAll,
  showRowActionsColumn = false,
  columnActions = [],
  columnWidths = {},
  resizingColumnId = null,
  onResizeStart,
  onColumnWidthMeasure,
  leftPinnedOffsets = {},
  rightPinnedOffsets = {},
  stickySelectionColumn = false,
  stickyRowActionsColumn = false,
  sortState = null,
  onSortToggle,
  onColumnContextMenu,
}: DataTableHeaderProps<T>) {
  return (
    <thead className={cn("bg-zinc-50", classNames?.thead)}>
      <SortableContext
        items={columns.map((column) => column.id)}
        strategy={horizontalListSortingStrategy}
      >
        <DataTableRow className={cn("h-11", classNames?.headerRow)}>
          {enableRowSelection ? (
            <DataTableColumn
              className={cn(
                "w-11 min-w-11 max-w-11 px-2 py-2",
                classNames?.selectionHeaderCell
              )}
              style={
                stickySelectionColumn
                  ? {
                      position: "sticky",
                      left: "0px",
                      zIndex: 35,
                      backgroundColor: "rgb(250 250 250)",
                    }
                  : undefined
              }
            >
              <div className="flex items-center justify-center">
                <Checkbox
                  checked={headerSelectionState}
                  onCheckedChange={onToggleSelectAll}
                  aria-label="Select all rows"
                />
              </div>
            </DataTableColumn>
          ) : null}
          {columns.map((column) => (
            <DraggableHeaderColumn
              key={column.id}
              column={column}
              className={cn(classNames?.headerCell)}
              columnActions={columnActions}
              width={columnWidths[column.id]}
              isResizing={resizingColumnId === column.id}
              onResizeStart={onResizeStart}
              onColumnWidthMeasure={onColumnWidthMeasure}
              pinSide={column.pin ?? null}
              pinOffset={
                column.pin === "left"
                  ? leftPinnedOffsets[column.id]
                  : column.pin === "right"
                    ? rightPinnedOffsets[column.id]
                    : undefined
              }
              isSortable={column.isSortable === true}
              sortDirection={
                sortState?.columnId === column.id ? sortState.direction : null
              }
              onSortToggle={onSortToggle}
              classNames={classNames}
              onColumnContextMenu={onColumnContextMenu}
            />
          ))}
          {showRowActionsColumn ? (
            <DataTableColumn
              className={cn(
                "w-11 min-w-11 max-w-11 px-2 py-2",
                classNames?.rowActionsHeaderCell
              )}
              style={
                stickyRowActionsColumn
                  ? {
                      position: "sticky",
                      right: "0px",
                      zIndex: 35,
                      backgroundColor: "rgb(250 250 250)",
                    }
                  : undefined
              }
            >
              <div className="flex items-center justify-center">
                <MoreHorizontal className="h-4 w-4 text-zinc-500" />
              </div>
            </DataTableColumn>
          ) : null}
        </DataTableRow>
      </SortableContext>
    </thead>
  );
}
