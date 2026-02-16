import type { CSSProperties, ReactNode, Ref } from "react";

export type SortingMode = "client" | "server";
export type RowActionsMode = "menu" | "inline" | "both";
export type PinState = "left" | false;

export type EditorType =
  | "text"
  | "textarea"
  | "select"
  | "multiselect"
  | "toggle"
  | "checkbox"
  | "number"
  | "rating"
  | "date"
  | "custom";

export interface SortState {
  id: string;
  desc: boolean;
}

export interface DataGridOption {
  label: string;
  value: string | number;
}

export interface CellRenderArgs<TData> {
  row: TData;
  rowIndex: number;
  value: unknown;
  column: DataGridColumn<TData>;
}

export interface EditorRenderArgs<TData> {
  value: unknown;
  onChange: (value: unknown) => void;
  onCommit: (value: unknown) => void;
  row: TData;
  rowIndex: number;
  column: DataGridColumn<TData>;
}

export interface EditorConfig<TData> {
  type: EditorType;
  options?: DataGridOption[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  disabled?: boolean | ((row: TData) => boolean);
  validate?: (value: unknown, row: TData) => string | null;
  renderCustomEditor?: (args: EditorRenderArgs<TData>) => ReactNode;
}

export interface DataGridColumn<TData> {
  id: string;
  header: ReactNode;
  accessorKey?: keyof TData & string;
  accessorFn?: (row: TData) => unknown;
  cell?: (args: CellRenderArgs<TData>) => ReactNode;
  editable?: boolean;
  editor?: EditorConfig<TData>;
  sortable?: boolean;
  pinnable?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  resizeMinWidth?: number;
  resizeMaxWidth?: number;
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
}

export interface RowAction<TData> {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: (row: TData) => void | Promise<void>;
  isVisible?: (row: TData) => boolean;
  isDisabled?: (row: TData) => boolean;
  className?: string;
}

export interface DataGridClassNames {
  root: string;
  toolbar: string;
  tableWrapper: string;
  table: string;
  thead: string;
  headerRow: string;
  headerCell: string;
  body: string;
  row: string;
  cell: string;
  pinnedLeft: string;
  dragHandle: string;
  resizeHandle: string;
  selectionCell: string;
  actionsCell: string;
  editorBase: string;
  editorText: string;
  editorTextarea: string;
  editorSelect: string;
  editorMultiSelect: string;
  editorToggle: string;
  editorCheckbox: string;
  editorNumber: string;
  editorRating: string;
  editorDate: string;
  errorText: string;
  emptyState: string;
  pagination: string;
  paginationButton: string;
}

export interface CellCommitArgs<TData> {
  rowId: string;
  columnId: string;
  value: unknown;
  row: TData;
}

export interface DataGridRef<TData> {
  addColumn: (column: DataGridColumn<TData>) => void;
  removeColumn: (columnId: string) => void;
  pinColumn: (columnId: string, side: PinState) => void;
  resetColumnOrder: () => void;
  setColumnWidth: (columnId: string, width: number) => void;
}

export interface DataGridProps<TData> {
  data: TData[];
  columns: DataGridColumn<TData>[];
  getRowId: (row: TData, index: number) => string;
  editable?: boolean;

  sortingMode?: SortingMode;
  sortingState?: SortState[];
  defaultSortingState?: SortState[];
  onSortingChange?: (state: SortState[]) => void;

  page?: number;
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  initialVisibleRowCount?: number;
  visibleRowIncrement?: number;
  infiniteScrollThreshold?: number;
  hasMoreRows?: boolean;
  isLoadingMoreRows?: boolean;
  onLoadMoreRows?: () => void | Promise<void>;

  enableRowDrag?: boolean;
  enableColumnDrag?: boolean;
  enableColumnResize?: boolean;
  defaultColumnMinWidth?: number;
  defaultColumnMaxWidth?: number;
  onRowOrderChange?: (orderedRowIds: string[], rows: TData[]) => void;
  onColumnOrderChange?: (orderedColumnIds: string[]) => void;
  onColumnsChange?: (columns: DataGridColumn<TData>[]) => void;
  onColumnResize?: (columnId: string, width: number) => void;

  enablePinning?: boolean;
  maxPinnedColumns?: number;
  onPinLimitExceeded?: (limit: number) => void;

  isSelectionEnabled?: boolean;
  selectedRowIds?: string[];
  defaultSelectedRowIds?: string[];
  onSelectedRowIdsChange?: (rowIds: string[], rows: TData[]) => void;

  rowActions?: RowAction<TData>[];
  rowActionsMode?: RowActionsMode;

  onCellCommit?: (args: CellCommitArgs<TData>) => void | Promise<void>;

  classNames?: Partial<DataGridClassNames>;
  rowClassName?: (row: TData) => string | undefined;
  tableClassName?: string;
  style?: CSSProperties;
  gridRef?: Ref<DataGridRef<TData>>;
}
