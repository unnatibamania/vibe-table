import type React from "react";
import type {
  DataTableColumn,
  NormalizedDataTableColumn,
} from "./column";
import type { DataTableClassNames } from "./class-names";
import type { DataTableColumnAction, DataTableRowAction } from "./actions";

export type RowId = string | number;
export type DataTableSortDirection = "asc" | "desc";

export interface DataTableSortState {
  columnId: string;
  direction: DataTableSortDirection;
}

export interface DataTableGroupHeaderContext<T extends object> {
  level: 1 | 2;
  column: DataTableColumn<T>;
  value: unknown;
  label: string;
  rowCount: number;
}

export interface DataTableProps<T extends object> {
  rows: T[];
  columns: DataTableColumn<T>[];
  getRowId?: (row: T, index: number) => RowId;
  onCellChange?: (rowId: RowId, columnId: string, newValue: unknown) => void;
  classNames?: DataTableClassNames;
  isLoading?: boolean;
  loadingRowCount?: number;
  emptyState?: React.ReactNode;

  // Step 3+: selection
  enableRowSelection?: boolean;
  selectedRowIds?: Set<RowId>;
  defaultSelectedRowIds?: Set<RowId>;
  onSelectionChange?: (selectedIds: Set<RowId>) => void;

  // Step 4+: actions
  rowActions?: DataTableRowAction<T>[];
  columnActions?: DataTableColumnAction<T>[];

  // Step 5+: draggable columns
  onColumnOrderChange?: (columnIds: string[]) => void;

  // Step 6+: resizable columns
  onColumnResize?: (columnId: string, width: number) => void;

  // Step 7+: pinning
  // onColumnPin?: (columnId: string, side: "left" | "right" | null) => void;

  // Step 8+: sorting
  sortState?: DataTableSortState | null;
  defaultSortState?: DataTableSortState | null;
  onSortChange?: (nextSortState: DataTableSortState | null) => void;
  sortingMode?: "client" | "manual";

  // Step 9+: right-click context menu
  // contextMenu?: unknown;

  // Step 10+: grouping and subgrouping
  groupByColumnId?: string | null;
  subgroupByColumnId?: string | null;
  renderGroupHeader?: (
    context: DataTableGroupHeaderContext<T>
  ) => React.ReactNode;
}

export interface DataTableHeaderProps<T extends object> {
  columns: NormalizedDataTableColumn<T>[];
  classNames?: DataTableClassNames;
  enableRowSelection?: boolean;
  headerSelectionState?: boolean | "indeterminate";
  onToggleSelectAll?: (checked: boolean | "indeterminate") => void;
  showRowActionsColumn?: boolean;
  columnActions?: DataTableColumnAction<T>[];
  columnWidths?: Record<string, number>;
  resizingColumnId?: string | null;
  onResizeStart?: (columnId: string, startX: number, startWidth: number) => void;
  onColumnWidthMeasure?: (columnId: string, width: number) => void;
  leftPinnedOffsets?: Record<string, number>;
  rightPinnedOffsets?: Record<string, number>;
  stickySelectionColumn?: boolean;
  stickyRowActionsColumn?: boolean;
  sortState?: DataTableSortState | null;
  onSortToggle?: (columnId: string) => void;
  onColumnContextMenu?: (
    event: React.MouseEvent,
    column: NormalizedDataTableColumn<T>
  ) => void;
}

export interface DataTableColumnProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  minWidth?: number;
  maxWidth?: number;
}

export type DataTableRowProps = React.HTMLAttributes<HTMLTableRowElement>;

export interface DataTableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  minWidth?: number;
  maxWidth?: number;
}

export type {
  DataTableClassNames,
  DataTableColumn,
  DataTableColumnAction,
  DataTableRowAction,
};
