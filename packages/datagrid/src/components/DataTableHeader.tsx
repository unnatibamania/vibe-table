import { cn } from "../lib/cn";
import type { DataTableHeaderProps } from "../types/table";
import { ColumnActionsMenu } from "./column-actions-menu";
import { DataTableColumn } from "./DataTableColumn";
import { DataTableRow } from "./DataTableRow";
import { Checkbox } from "./ui/checkbox";
import { MoreHorizontal } from "lucide-react";

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
    <thead className={cn("bg-zinc-100", classNames?.thead)}>
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
          <DataTableColumn
            key={column.id}
            minWidth={column.minWidth}
            maxWidth={column.maxWidth}
            className={cn(classNames?.headerCell)}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate">{column.header ?? column.label}</span>
              {column.showColumnActions === false ? null : (
                <ColumnActionsMenu column={column} actions={columnActions} />
              )}
            </div>
          </DataTableColumn>
        ))}
        {showRowActionsColumn ? (
          <DataTableColumn className={cn("w-11 min-w-11 max-w-11 px-2 py-2")}>
            <div className="flex items-center justify-center">
              <MoreHorizontal className="h-4 w-4 text-zinc-500" />
            </div>
          </DataTableColumn>
        ) : null}
      </DataTableRow>
    </thead>
  );
}
