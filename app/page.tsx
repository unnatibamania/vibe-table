"use client";

import * as React from "react";
import {
  DataTable,
  type DataTableColumnAction,
  type DataTableColumnConfig,
  type DataTableRowAction,
  type ProgressCellValue,
  type ResolutionCellValue,
  type DataTableSortState,
  type RowId,
  type UserCellValue,
  type VideoCellValue,
} from "@/packages/datagrid/src";
import { initialRows, type DemoRow } from "./demo-rows";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Calendar,
  Check,
  Circle,
  Code2,
  Film,
  Flag,
  Gauge,
  Hash,
  Layout,
  Minus,
  Monitor,
  Server,
  Settings,
  Star,
  Tag,
  User,
  Users,
} from "lucide-react";

type DemoTableRow = DemoRow & {
  owner: UserCellValue;
  progress: ProgressCellValue;
  video: VideoCellValue;
  resolution: ResolutionCellValue;
};

const initialTableRows: DemoTableRow[] = initialRows.map((row) => ({
  ...row,
  owner: {
    name: row.uploadedBy,
    description: `${row.status} uploader`,
    image: `https://i.pravatar.cc/80?img=${(row.id % 70) + 1}`,
  },
  progress: {
    completed: row.rating,
    fullValue: 5,
  },
  video: {
    fileName: `${row.name.toLowerCase()}.mp4`,
    thumbnail: `https://picsum.photos/seed/video-${row.id}/160/90`,
  },
  resolution: row.featured
    ? { width: 3840, height: 2160 }
    : { width: 1920, height: 1080 },
}));

const LIBRARY_TABLE_COLUMNS_IDS = {
  STATUS: "status",
  NAME: "name",
  AGE: "age",
  ACTIVE: "active",
  FEATURED: "featured",
  UPDATED_AT: "updatedAt",
  UPLOADED_BY: "uploadedBy",
  OWNER: "owner",
  PROGRESS: "progress",
  VIDEO: "video",
  RESOLUTION: "resolution",
  PRIORITY: "priority",
  TAGS: "tags",
  RATING: "rating",
} as const;

const initialColumns: DataTableColumnConfig<DemoTableRow>[] = [
  {
    id: LIBRARY_TABLE_COLUMNS_IDS.STATUS,
    label: "Status",
    Icon: Activity,
    header: (
      <div className="flex items-center gap-2">
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
    cell: (row) => {
      const statusVariant =
        row.status === "Ready"
          ? "bg-emerald-500/10 text-emerald-700 border-emerald-200/60"
          : row.status === "In Review"
            ? "bg-amber-500/10 text-amber-700 border-amber-200/60"
            : "bg-slate-100 text-slate-600 border-slate-200/60";
      return (
        <div className="flex h-full w-full items-center justify-start">
          <span
            className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium tracking-tight ${statusVariant}`}
          >
            {row.status}
          </span>
        </div>
      );
    },
    type: "custom",
    skeleton: <div className="ml-1 h-5 w-16 animate-pulse rounded-md bg-slate-200/70" />,
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
    id: LIBRARY_TABLE_COLUMNS_IDS.OWNER,
    label: "Owner",
    Icon: User,
    header: "Owner",
    minWidth: 220,
    type: "user",
  },
  {
    id: LIBRARY_TABLE_COLUMNS_IDS.PROGRESS,
    label: "Progress",
    Icon: Gauge,
    header: "Progress",
    minWidth: 170,
    type: "progress",
  },
  {
    id: LIBRARY_TABLE_COLUMNS_IDS.VIDEO,
    label: "Video",
    Icon: Film,
    header: "Video",
    minWidth: 220,
    type: "video",
  },
  {
    id: LIBRARY_TABLE_COLUMNS_IDS.RESOLUTION,
    label: "Resolution",
    Icon: Monitor,
    header: "Resolution",
    minWidth: 150,
    type: "resolution",
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
      { label: "Low", value: "low", icon: <div className="h-2 w-2 bg-red-500 rounded-full border-solid" /> },
      { label: "Medium", value: "medium", icon: <div className="h-2 w-2 bg-yellow-500 rounded-full border-solid" /> },
      { label: "High", value: "high", icon: <div className="h-2 w-2 bg-green-700 rounded-full border-solid" /> },
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
      { label: "Frontend", value: "frontend", icon: <Layout className="h-4 w-4" /> },
      { label: "Backend", value: "backend", icon: <Server className="h-4 w-4" /> },
      { label: "API", value: "api", icon: <Code2 className="h-4 w-4" /> },
      { label: "Ops", value: "ops", icon: <Settings className="h-4 w-4" /> },
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
  const [rows, setRows] = React.useState<DemoTableRow[]>(initialTableRows);
  const [columns, setColumns] =
    React.useState<DataTableColumnConfig<DemoTableRow>[]>(initialColumns);
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
          row.id === rowId ? ({ ...row, [columnId]: newValue } as DemoTableRow) : row
        )
      );
    },
    []
  );

  const rowActions = React.useMemo<DataTableRowAction<DemoTableRow>[]>(
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

  const columnActions = React.useMemo<DataTableColumnAction<DemoTableRow>[]>(
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
    <main className="mx-auto max-w-7xl min-h-dvh px-4 py-8 md:px-8 md:py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          Library
        </h1>
        <p className="mt-1 text-base text-slate-600 leading-relaxed max-w-[65ch]">
          Manage your video assets, metadata, and status.
        </p>
      </header>

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
        emptyState="No rows yet"
      />
    </main>
  );
}
