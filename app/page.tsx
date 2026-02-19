import { DataTable, type DataTableColumnConfig } from "@/packages/datagrid/src";

const LIBRARY_TABLE_COLUMNS_IDS = {
  STATUS: "status",
  NAME: "name",
  UPDATED_AT: "updatedAt",
} as const;

type DemoRow = {
  id: number;
  name: string;
  status: string;
  updatedAt: string;
};

const rows: DemoRow[] = [
  { id: 1, name: "Alpha", status: "Ready", updatedAt: "2026-02-19" },
  { id: 2, name: "Beta", status: "In Review", updatedAt: "2026-02-18" },
  { id: 3, name: "Gamma", status: "Draft", updatedAt: "2026-02-17" },
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
    minWidth: 120,
    maxWidth: 180,
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
    minWidth: 180,
    isResizable: false,
    isHidden: false,
    isDraggable: false,
    isEditable: false,
    isDeletable: false,
    isSortable: false,
    showColumnActions: false,
    type: "text",
    cell: (row) => row.name,
  },
  {
    id: LIBRARY_TABLE_COLUMNS_IDS.UPDATED_AT,
    label: "Updated",
    header: "Updated",
    minWidth: 140,
    isResizable: false,
    isHidden: false,
    isDraggable: false,
    isEditable: false,
    isDeletable: false,
    isSortable: false,
    showColumnActions: false,
    type: "date",
    cell: (row) => row.updatedAt,
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-4 text-2xl font-semibold">DataTable Step 1 Demo</h1>
      <DataTable rows={rows} columns={columns} />
    </main>
  );
}
