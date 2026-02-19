"use client";

import * as React from "react";
import { DataTable, type DataTableColumnConfig } from "@/packages/datagrid/src";

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

const columns: DataTableColumnConfig<DemoRow>[] = [
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
    type: "text",
  },
  {
    id: LIBRARY_TABLE_COLUMNS_IDS.AGE,
    label: "Age",
    header: "Age",
    minWidth: 100,
    isEditable: true,
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
    type: "date",
  },
  {
    id: LIBRARY_TABLE_COLUMNS_IDS.PRIORITY,
    label: "Priority",
    header: "Priority",
    minWidth: 130,
    isEditable: true,
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
    type: "rating",
    maxRating: 5,
  },
];

export default function Home() {
  const [rows, setRows] = React.useState(initialRows);

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

  return (
    <main className="mx-auto max-w-7xl p-8">
      <h1 className="mb-4 text-2xl font-semibold">DataTable Step 2 Demo</h1>
      <p className="mb-6 text-sm text-zinc-600">
        Editable cells are enabled for text, number, boolean, date, select,
        multi-select, toggle, and rating types.
      </p>
      <DataTable rows={rows} columns={columns} onCellChange={handleCellChange} />
    </main>
  );
}
