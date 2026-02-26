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
  | "progress"
  | "video"
  | "resolution"
  | "custom";

export interface UserCellValue {
  image?: string | null;
  name: string;
  description?: string | null;
  desction?: string | null;
}

export type ProgressCellValue =
  | {
      completed: number;
      total: number;
      fullValue?: number;
    }
  | {
      completed: number;
      total?: number;
      fullValue: number;
    };

export interface VideoCellValue {
  thumbnail?: string | null;
  fileName: string;
}

export interface ResolutionCellValue {
  width: number;
  height: number;
}

export type CellValue =
  | string
  | number
  | boolean
  | Date
  | string[]
  | UserCellValue
  | ProgressCellValue
  | VideoCellValue
  | ResolutionCellValue
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
  Icon?: React.ComponentType<{ className?: string }>;
  minWidth?: number;
  maxWidth?: number;
  pin?: "left" | "right" | null;
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
