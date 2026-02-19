import type React from "react";

export type ColumnType =
  | "text"
  | "number"
  | "boolean"
  | "date"
  | "select"
  | "multi-select"
  | "toggle"
  | "rating"
  | "checkbox"
  | "user"
  | "custom";

export interface DataTableColumn<T> {
  id: string;
  label: string;
  header: React.ReactNode;
  minWidth?: number;
  maxWidth?: number;
  isResizable?: boolean;
  isHidden?: boolean;
  isVisible?: boolean;
  isDraggable?: boolean;
  isEditable?: boolean;
  isDeletable?: boolean;
  isSortable?: boolean;
  showColumnActions?: boolean;
  cell?: (row: T) => React.ReactNode;
  type: ColumnType;
  skeleton?: React.ReactNode;
}

export type NormalizedDataTableColumn<T> = DataTableColumn<T> & {
  isVisible: boolean;
};
