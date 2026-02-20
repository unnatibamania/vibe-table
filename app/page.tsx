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

const LIBRARY_TABLE_COLUMNS_IDS = {
  STATUS: "status",
  NAME: "name",
  AGE: "age",
  ACTIVE: "active",
  FEATURED: "featured",
  UPDATED_AT: "updatedAt",
  PRIORITY: "priority",
  TAGS: "tags",
  RATING: "rating",
} as const;

type DemoRow = {
  id: number;
  status: string;
  name: string;
  age: number;
  active: boolean;
  featured: boolean;
  updatedAt: string;
  priority: string;
  tags: string[];
  rating: number;
};

const initialRows: DemoRow[] = [
  {
    id: 1,
    status: "Ready",
    name: "Alpha",
    age: 29,
    active: true,
    featured: false,
    updatedAt: "2026-02-19",
    priority: "high",
    tags: ["frontend"],
    rating: 4,
  },
  {
    id: 2,
    status: "In Review",
    name: "Beta",
    age: 34,
    active: false,
    featured: true,
    updatedAt: "2026-02-18",
    priority: "medium",
    tags: ["backend", "api"],
    rating: 3,
  },
  {
    id: 3,
    status: "Draft",
    name: "Gamma",
    age: 25,
    active: true,
    featured: false,
    updatedAt: "2026-02-17",
    priority: "low",
    tags: ["ops"],
    rating: 2,
  },
];

const initialColumns: DataTableColumnConfig<DemoRow>[] = [
  {
    id: LIBRARY_TABLE_COLUMNS_IDS.STATUS,
    label: "Status",
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
    header: "Name",
    minWidth: 160,
    isEditable: true,
    isSortable: true,
    type: "text",
  },
  {
    id: LIBRARY_TABLE_COLUMNS_IDS.AGE,
    label: "Age",
    header: "Age",
    minWidth: 100,
    isEditable: true,
    isSortable: true,
    type: "number",
  },
  {
    id: LIBRARY_TABLE_COLUMNS_IDS.ACTIVE,
    label: "Active",
    header: "Active",
    minWidth: 100,
    isEditable: true,
    type: "boolean",
  },
  {
    id: LIBRARY_TABLE_COLUMNS_IDS.FEATURED,
    label: "Featured",
    header: "Featured",
    minWidth: 120,
    isEditable: true,
    type: "toggle",
  },
  {
    id: LIBRARY_TABLE_COLUMNS_IDS.UPDATED_AT,
    label: "Updated",
    header: "Updated",
    minWidth: 140,
    isEditable: true,
    isSortable: true,
    type: "date",
  },
  {
    id: LIBRARY_TABLE_COLUMNS_IDS.PRIORITY,
    label: "Priority",
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
    <main className="mx-auto max-w-7xl p-8">
      <h1 className="mb-4 text-2xl font-semibold">DataTable Step 8 Demo</h1>
      <p className="mb-6 text-sm text-zinc-600">
        Editable cells are enabled for text, number, boolean, date, select,
        multi-select, toggle, and rating types with pinning and sorting support.
      </p>
      <p className="mb-4 text-sm text-zinc-600">
        Selected rows: {selectedRowIds.size}
      </p>
      <p className="mb-4 text-sm text-zinc-600">Last action: {lastAction}</p>
      <p className="mb-4 text-sm text-zinc-600">
        Column order: {columnOrder.join(" > ")}
      </p>
      <p className="mb-4 text-sm text-zinc-600">Last resize: {lastResize}</p>
      <p className="mb-4 text-sm text-zinc-600">
        Sort state:{" "}
        {sortState ? `${sortState.columnId} (${sortState.direction})` : "none"}
      </p>
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
      />
    </main>
  );
}
