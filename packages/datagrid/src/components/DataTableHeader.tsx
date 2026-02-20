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
}: DataTableHeaderProps<T>) {
  return (
    <thead className={cn("bg-zinc-50", classNames?.thead)}>
      <SortableContext
        items={columns.map((column) => column.id)}
        strategy={horizontalListSortingStrategy}
      >
        <DataTableRow className={cn("h-11", classNames?.headerRow)}>
          {enableRowSelection ? (
            <DataTableColumn className={cn("w-11 min-w-11 max-w-11 px-2 py-2")}>
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
            />
          ))}
          {showRowActionsColumn ? (
            <DataTableColumn className={cn("w-11 min-w-11 max-w-11 px-2 py-2")}>
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
