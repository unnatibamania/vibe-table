import { cn } from "../lib/cn";
import type { DataTableHeaderProps } from "../types/table";
import { DataTableColumn } from "./DataTableColumn";
import { DataTableRow } from "./DataTableRow";

export function DataTableHeader<T extends object>({
  columns,
  classNames,
}: DataTableHeaderProps<T>) {
  return (
    <thead className={cn("bg-zinc-100", classNames?.thead)}>
      <DataTableRow className={cn("h-11", classNames?.headerRow)}>
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
