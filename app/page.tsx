"use client";

import * as React from "react";
import {
  DataTable,
  type DataTableColumnAction,
  type DataTableColumnConfig,
  type DataTableRowAction,
  type DataTableSortState,
  type RowId,
} from "@/packages/datagrid/src";
import { initialRows, type DemoRow } from "./demo-rows";
import {
  Activity,
  Calendar,
  Check,
  Flag,
  Hash,
  Star,
  Tag,
  User,
  Users,
} from "lucide-react";


const LIBRARY_TABLE_COLUMNS_IDS = {
  STATUS: "status",
  NAME: "name",
  AGE: "age",
  ACTIVE: "active",
  FEATURED: "featured",
  UPDATED_AT: "updatedAt",
  UPLOADED_BY: "uploadedBy",
  PRIORITY: "priority",
  TAGS: "tags",
  RATING: "rating",
} as const;

const initialColumns: DataTableColumnConfig<DemoRow>[] = [
  {
    id: LIBRARY_TABLE_COLUMNS_IDS.STATUS,
    label: "Status",
    Icon: Activity,
    header: (
      <div className="flex items-center gap-2">
        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
        <span>Status</span>
      </div>
    ),
    minWidth: 140,
    maxWidth: 190,
    isResizable: false,
    isHidden: false,
    isDraggable: false,
    isEditable: false,
    isDeletable: false,
    isSortable: false,
    showColumnActions: false,
    cell: (row) => (
      <div className="flex h-full w-full items-center justify-start">
        <span className="rounded bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
          {row.status}
        </span>
      </div>
    ),
    type: "custom",
    skeleton: <div className="ml-1 h-4 w-16 rounded bg-zinc-200" />,
  },
  {
    id: LIBRARY_TABLE_COLUMNS_IDS.NAME,
    label: "Name",
    Icon: User,
    header: "Name",
    minWidth: 160,
    maxWidth: 500,
    isEditable: true,
    isSortable: true,
    type: "text",
  },
  {
    id: LIBRARY_TABLE_COLUMNS_IDS.AGE,
    label: "Age",
    Icon: Hash,
    header: "Age",
    minWidth: 100,
    isEditable: true,
    isSortable: true,
    type: "number",
  },
  {
    id: LIBRARY_TABLE_COLUMNS_IDS.ACTIVE,
    label: "Active",
    Icon: Check,
    header: "Active",
    minWidth: 100,
    isEditable: true,
    type: "boolean",
  },
  {
    id: LIBRARY_TABLE_COLUMNS_IDS.FEATURED,
    label: "Featured",
    Icon: Star,
    header: "Featured",
    minWidth: 120,
    isEditable: true,
    type: "toggle",
  },
  {
    id: LIBRARY_TABLE_COLUMNS_IDS.UPDATED_AT,
    label: "Updated",
    Icon: Calendar,
    header: "Updated",
    minWidth: 140,
    isEditable: true,
    isSortable: true,
    type: "date",
  },
  {
    id: LIBRARY_TABLE_COLUMNS_IDS.UPLOADED_BY,
    label: "Uploaded By",
    Icon: Users,
    header: "Uploaded By",
    minWidth: 180,
    isSortable: true,
    type: "text",
  },
  {
    id: LIBRARY_TABLE_COLUMNS_IDS.PRIORITY,
    label: "Priority",
    Icon: Flag,
    header: "Priority",
    minWidth: 130,
    isEditable: true,
    isSortable: true,
    type: "select",
    selectOptions: [
      { label: "Low", value: "low" },
      { label: "Medium", value: "medium" },
      { label: "High", value: "high" },
    ],
  },
  {
    id: LIBRARY_TABLE_COLUMNS_IDS.TAGS,
    label: "Tags",
    Icon: Tag,
    header: "Tags",
    minWidth: 200,
    isEditable: true,
    type: "multi-select",
    multiSelectOptions: [
      { label: "Frontend", value: "frontend" },
      { label: "Backend", value: "backend" },
      { label: "API", value: "api" },
      { label: "Ops", value: "ops" },
    ],
  },
  {
    id: LIBRARY_TABLE_COLUMNS_IDS.RATING,
    label: "Rating",
    Icon: Star,
    header: "Rating",
    minWidth: 170,
    isEditable: true,
    isSortable: true,
    type: "rating",
    maxRating: 5,
  },
];

export default function Home() {
  const [rows, setRows] = React.useState(initialRows);
  const [columns, setColumns] =
    React.useState<DataTableColumnConfig<DemoRow>[]>(initialColumns);
  const [selectedRowIds, setSelectedRowIds] = React.useState<Set<RowId>>(
    new Set()
  );
  const [lastAction, setLastAction] = React.useState<string>("none");
  const [columnOrder, setColumnOrder] = React.useState<string[]>(
    initialColumns.map((column) => column.id)
  );
  const [lastResize, setLastResize] = React.useState<string>("none");
  const [sortState, setSortState] = React.useState<DataTableSortState | null>(
    null
  );
  const [groupByColumnId] = React.useState<string | null>(
    null
  );
  const [subgroupByColumnId] = React.useState<string | null>(
    null
  );

  const handleCellChange = React.useCallback(
    (rowId: string | number, columnId: string, newValue: unknown) => {
      setRows((currentRows) =>
        currentRows.map((row) =>
          row.id === rowId ? ({ ...row, [columnId]: newValue } as DemoRow) : row
        )
      );
    },
    []
  );

  const rowActions = React.useMemo<DataTableRowAction<DemoRow>[]>(
    () => [
      {
        label: "Mark as ready",
        value: "mark_ready",
        action: (row) => {
          setRows((currentRows) =>
            currentRows.map((item) =>
              item.id === row.id ? { ...item, status: "Ready" } : item
            )
          );
          setLastAction(`row:${row.id}:mark_ready`);
        },
      },
      {
        label: "Set high priority",
        value: "set_high_priority",
        action: (row) => {
          setRows((currentRows) =>
            currentRows.map((item) =>
              item.id === row.id ? { ...item, priority: "high" } : item
            )
          );
          setLastAction(`row:${row.id}:set_high_priority`);
        },
      },
    ],
    []
  );

  const setColumnPin = React.useCallback(
    (columnId: string, pin: "left" | "right" | null) => {
      setColumns((currentColumns) =>
        currentColumns.map((column) =>
          column.id === columnId ? { ...column, pin } : column
        )
      );
    },
    []
  );

  const columnActions = React.useMemo<DataTableColumnAction<DemoRow>[]>(
    () => [
      {
        label: "Log column id",
        value: "log_column",
        action: (column) => {
          setLastAction(`column:${column.id}:log_column`);
        },
      },
      {
        label: "Pin left",
        value: "pin_left",
        action: (column) => {
          setColumnPin(column.id, "left");
          setLastAction(`column:${column.id}:pin_left`);
        },
      },
      {
        label: "Pin right",
        value: "pin_right",
        action: (column) => {
          setColumnPin(column.id, "right");
          setLastAction(`column:${column.id}:pin_right`);
        },
      },
      {
        label: "Remove pin",
        value: "remove_pin",
        action: (column) => {
          setColumnPin(column.id, null);
          setLastAction(`column:${column.id}:remove_pin`);
        },
      },
    ],
    [setColumnPin]
  );

  return (
    <main className="mx-auto max-w-7xl min-h-dvh p-8">

      <DataTable
        rows={rows}
        columns={columns}
        onCellChange={handleCellChange}
        enableRowSelection
        selectedRowIds={selectedRowIds}
        onSelectionChange={setSelectedRowIds}
        rowActions={rowActions}
        columnActions={columnActions}
        onColumnOrderChange={setColumnOrder}
        onColumnResize={(columnId, width) =>
          setLastResize(`${columnId}: ${Math.round(width)}px`)
        }
        
        sortState={sortState}
        onSortChange={setSortState}
        groupByColumnId={groupByColumnId}
        subgroupByColumnId={subgroupByColumnId}
      />
    </main>
  );
}
