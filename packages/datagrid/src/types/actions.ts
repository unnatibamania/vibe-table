import type React from "react";
import type { DataTableColumn } from "./column";

export interface DataTableActionContext<T> {
  row?: T;
  rowId?: string | number;
  column?: DataTableColumn<T>;
}

export interface DataTableRowAction<T> {
  label: string;
  value: string;
  icon?: React.ReactNode;
  action: (row: T, context: DataTableActionContext<T>) => void;
}

export interface DataTableColumnAction<T> {
  label: string;
  value: string;
  icon?: React.ReactNode;
  action: (
    column: DataTableColumn<T>,
    context: DataTableActionContext<T>
  ) => void;
}
