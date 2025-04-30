import * as React from "react";
import { TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { ColumnConfig, CellValue } from "@/app/types/column";
import type { DataGridClassNames } from "./types";
// Import specific cell components as needed
import { TextCell } from "@/components/cells/text-cell";
import { NumberCell } from "@/components/cells/number-cell";
import { BooleanCell } from "@/components/cells/boolean-cell";
import { DateCell } from "@/components/cells/date-cell";
import { SelectCell } from "@/components/cells/select-cell";
import { MultiSelectCell } from "@/components/cells/multi-select-cell";
import { ToggleCell } from "@/components/cells/toggle-cell";
import { RatingCell } from "@/components/cells/rating-cell";

// Define the props for DataGridBody
interface DataGridBodyProps<
  T extends { id: string | number; [key: string]: CellValue }
> {
  rows: T[];
  columns: ColumnConfig<T>[];
  selectedRowIds: Set<string | number>;
  handleSelectRow: (
    rowId: string | number,
    checked: boolean | "indeterminate"
  ) => void;
  handleSave: (rowIndex: number, columnId: string, newValue: unknown) => void;
  columnWidths: Record<string, number>;
  enableRowSelection: boolean;
  classNames?: DataGridClassNames;
}

export function DataGridBody<
  T extends { id: string | number; [key: string]: CellValue }
>({
  rows,
  columns,
  selectedRowIds,
  handleSelectRow,
  handleSave,
  columnWidths,
  enableRowSelection,
  classNames,
}: DataGridBodyProps<T>) {
  // Row rendering logic will go here
  return (
    <TableBody className={cn(classNames?.body?.wrapper)}>
      {rows.map((row, rowIndex) => {
        const isSelected = selectedRowIds.has(row.id);
        return (
          // Add visual indication for selected rows
          <TableRow
            key={row.id}
            data-state={isSelected ? "selected" : ""}
            className={cn(
              "h-10 py-2",
              classNames?.body?.row,
              isSelected && classNames?.body?.selectedRow
            )}
          >
            {/* Selection Cell */}
            {enableRowSelection && (
              <TableCell className={cn("p-0", classNames?.body?.cell)}>
                <div className="flex items-center justify-center h-full">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      handleSelectRow(row.id, checked)
                    }
                    aria-label={`Select row ${rowIndex + 1}`}
                    className={cn(classNames?.components?.checkbox)}
                  />
                </div>
              </TableCell>
            )}

            {columns.map((column) => {
              const initialValue = row[column.id];
              const cellStyle: React.CSSProperties = {
                width: columnWidths[column.id]
                  ? `${columnWidths[column.id]}px`
                  : undefined,
                minWidth: column.minWidth ? `${column.minWidth}px` : undefined,
                maxWidth: column.maxWidth ? `${column.maxWidth}px` : undefined,
              };
              return (
                <TableCell
                  key={column.id}
                  style={cellStyle}
                  className={cn(
                    "overflow-hidden whitespace-nowrap bg-zinc-50/50 text-ellipsis align-middle",
                    classNames?.body?.cell
                  )}
                >
                  {column.type === "text" ? (
                    <TextCell
                      initialValue={String(initialValue ?? "")}
                      onSave={(newValue: string) =>
                        handleSave(rowIndex, column.id, newValue)
                      }
                    />
                  ) : column.type === "number" ? (
                    <NumberCell
                      initialValue={
                        typeof initialValue === "number" ? initialValue : null
                      }
                      onSave={(newValue: number | null) =>
                        handleSave(rowIndex, column.id, newValue)
                      }
                    />
                  ) : column.type === "boolean" ||
                    column.type === "checkbox" ? (
                    <BooleanCell
                      initialValue={
                        typeof initialValue === "boolean" ? initialValue : null
                      }
                      isEditable={column.isEditable}
                      onSave={(newValue: boolean) =>
                        handleSave(rowIndex, column.id, newValue)
                      }
                      classNames={classNames?.components}
                    />
                  ) : column.type === "date" ? (
                    <DateCell
                      initialValue={
                        initialValue instanceof Date ? initialValue : null
                      }
                      isEditable={column.isEditable}
                      onSave={(newValue: Date | null) =>
                        handleSave(rowIndex, column.id, newValue)
                      }
                      classNames={classNames?.components}
                    />
                  ) : column.type === "select" ? (
                    <SelectCell
                      initialValue={
                        typeof initialValue === "string" ? initialValue : null
                      }
                      options={column.selectOptions || []}
                      isEditable={column.isEditable}
                      onSave={(newValue: string | null) =>
                        handleSave(rowIndex, column.id, newValue)
                      }
                      classNames={classNames?.components}
                    />
                  ) : column.type === "multi-select" ? (
                    <MultiSelectCell
                      initialValues={
                        Array.isArray(initialValue)
                          ? initialValue.filter(
                              (v): v is string => typeof v === "string"
                            )
                          : null
                      }
                      options={column.multiSelectOptions || []}
                      isEditable={column.isEditable}
                      onSave={(newValue: string[] | null) =>
                        handleSave(rowIndex, column.id, newValue)
                      }
                      classNames={classNames?.components}
                    />
                  ) : column.type === "toggle" ? (
                    <ToggleCell
                      initialValue={
                        typeof initialValue === "boolean" ? initialValue : null
                      }
                      isEditable={column.isEditable}
                      onSave={(newValue: boolean) =>
                        handleSave(rowIndex, column.id, newValue)
                      }
                      classNames={classNames?.components}
                    />
                  ) : column.type === "rating" ? (
                    <RatingCell
                      initialValue={
                        typeof initialValue === "number" ? initialValue : null
                      }
                      isEditable={column.isEditable}
                      onSave={(newValue: number | null) =>
                        handleSave(rowIndex, column.id, newValue)
                      }
                      classNames={classNames?.components}
                    />
                  ) : (
                    // Default case: Render directly, no extra div/padding needed
                    column.cell(row)
                  )}
                </TableCell>
              );
            })}
          </TableRow>
        );
      })}
    </TableBody>
  );
}
