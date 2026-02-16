"use client";

import type { DragEvent } from "react";

import { cx } from "./class-slots";
import { DataGridCell } from "./DataGridCell";
import { getPinnedCellStyle } from "./pinning";
import { RowActionsMenu } from "./row-actions";
import type {
  CellRenderArgs,
  DataGridClassNames,
  DataGridColumn,
  RowAction,
  RowActionsMode,
} from "./types";

interface DataGridRowProps<TData> {
  row: TData;
  rowIndex: number;
  rowId: string;
  columns: DataGridColumn<TData>[];
  classNames: DataGridClassNames;
  pinnedColumnIds: string[];
  pinnedOffsets: Record<string, number>;
  columnWidths: Record<string, number | undefined>;
  enableRowDrag: boolean;
  onDragStart: (event: DragEvent<HTMLElement>) => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
  rowActions?: RowAction<TData>[];
  rowActionsMode: RowActionsMode;
  rowClassName?: string;
  isSelectionEnabled: boolean;
  isRowSelected: boolean;
  onToggleSelection: () => void;
}

export function DataGridRow<TData>({
  row,
  rowIndex,
  rowId,
  columns,
  classNames,
  pinnedColumnIds,
  pinnedOffsets,
  columnWidths,
  enableRowDrag,
  onDragStart,
  onDragOver,
  onDrop,
  rowActions,
  rowActionsMode,
  rowClassName,
  isSelectionEnabled,
  isRowSelected,
  onToggleSelection,
}: DataGridRowProps<TData>) {
  const menuActionsEnabled =
    rowActionsMode === "menu" || rowActionsMode === "both" || rowActionsMode === "inline";
  const visibleActions = (rowActions ?? []).filter((action) =>
    action.isVisible ? action.isVisible(row) : true,
  );

  return (
    <tr
      className={cx(classNames.row, rowClassName)}
      draggable={enableRowDrag}
      onDragStart={enableRowDrag ? onDragStart : undefined}
      onDragOver={enableRowDrag ? onDragOver : undefined}
      onDrop={enableRowDrag ? onDrop : undefined}
    >
      {isSelectionEnabled ? (
        <td className={cx(classNames.cell, classNames.selectionCell)}>
          <input
            type="checkbox"
            className={classNames.editorCheckbox}
            checked={isRowSelected}
            onChange={onToggleSelection}
            aria-label={`Select row ${rowId}`}
          />
        </td>
      ) : null}
      {columns.map((column) => {
        const isPinned = pinnedColumnIds.includes(column.id);
        const value = readColumnValue(row, column);
        const width = columnWidths[column.id] ?? column.width;
        const minWidth = column.resizeMinWidth ?? column.minWidth;
        const maxWidth = column.resizeMaxWidth ?? column.maxWidth;
        const cellArgs: CellRenderArgs<TData> = {
          row,
          rowIndex,
          value,
          column,
        };
        return (
          <DataGridCell
            key={`${rowId}-${column.id}`}
            classNames={classNames}
            className={column.cellClassName}
            isPinned={isPinned}
            pinnedStyle={getPinnedCellStyle(column.id, pinnedOffsets)}
            style={{
              width,
              minWidth,
              maxWidth,
            }}
          >
            {column.cell ? column.cell(cellArgs) : toDisplayString(value)}
          </DataGridCell>
        );
      })}
      {menuActionsEnabled && visibleActions.length > 0 ? (
        <td className={cx(classNames.cell, classNames.actionsCell)}>
          <div className="flex items-center justify-end gap-2">
            <RowActionsMenu
              row={row}
              actions={visibleActions}
              classNames={classNames}
            />
          </div>
        </td>
      ) : null}
    </tr>
  );
}

function readColumnValue<TData>(row: TData, column: DataGridColumn<TData>): unknown {
  if (column.accessorFn) {
    return column.accessorFn(row);
  }
  if (column.accessorKey) {
    return row[column.accessorKey];
  }
  return undefined;
}

function toDisplayString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "boolean") {
    return value ? "True" : "False";
  }
  return String(value);
}
