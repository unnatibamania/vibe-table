import { ColumnConfig } from "@/app/types/column";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import type { DataGridClassNames } from "../data-grid/types";

interface PinnedTableProps<T> {
  pinnedColumns: ColumnConfig<T>[];
  rows: T[];
  classNames?: DataGridClassNames;
}

export function PinnedTable<T>({
  pinnedColumns,
  rows,
  classNames,
}: PinnedTableProps<T>) {
  console.log({ pinnedColumns });
  return (
    <div className="absolute top-0 z-30 left-0 h-full">
      <Table className={cn("w-full border-collapse", classNames?.table)}>
        <TableHeader>
          <TableRow
            className={cn(
              "bg-muted hover:bg-muted/80",
              classNames?.header?.row
            )}
          >
            {pinnedColumns.map((column) => (
              <TableHead
                style={{ width: column.minWidth }}
                className={cn("group relative", classNames?.header?.cell)}
                key={column.id}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              className={cn(
                "h-10 py-2",
                classNames?.body?.row
                // isSelected && classNames?.body?.selectedRow
              )}
            >
              {pinnedColumns.map((column) => (
                <TableCell
                  className={cn(
                    "overflow-hidden whitespace-nowrap text-ellipsis align-middle",
                    classNames?.body?.cell
                  )}
                  key={column.id}
                >
                  {row[column.id]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
