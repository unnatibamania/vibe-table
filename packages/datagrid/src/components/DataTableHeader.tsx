import { cn } from "../lib/cn";
import type { DataTableHeaderProps } from "../types/table";
import { DataTableColumn } from "./DataTableColumn";
import { DataTableRow } from "./DataTableRow";
import { Checkbox } from "./ui/checkbox";

export function DataTableHeader<T extends object>({
  columns,
  classNames,
  enableRowSelection = false,
  headerSelectionState = false,
  onToggleSelectAll,
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
            {column.header ?? column.label}
          </DataTableColumn>
        ))}
      </DataTableRow>
    </thead>
  );
}
