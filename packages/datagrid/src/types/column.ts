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

export type CellValue =
  | string
  | number
  | boolean
  | Date
  | string[]
  | null
  | undefined;

export interface SelectOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface BaseDataTableColumn<T> {
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
  maxRating?: number;
  cell?: (row: T) => React.ReactNode;
  skeleton?: React.ReactNode;
}

type SelectColumnConfig<T> = BaseDataTableColumn<T> & {
  type: "select";
  selectOptions: SelectOption[];
  multiSelectOptions?: never;
};

type MultiSelectColumnConfig<T> = BaseDataTableColumn<T> & {
  type: "multi-select";
  selectOptions?: never;
  multiSelectOptions: SelectOption[];
};

type BaseTypeColumnConfig<T> = BaseDataTableColumn<T> & {
  type: Exclude<ColumnType, "select" | "multi-select">;
  selectOptions?: never;
  multiSelectOptions?: never;
};

export type DataTableColumn<T> =
  | SelectColumnConfig<T>
  | MultiSelectColumnConfig<T>
  | BaseTypeColumnConfig<T>;

export type NormalizedDataTableColumn<T> = DataTableColumn<T> & {
  isVisible: boolean;
};
