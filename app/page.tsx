"use client";

import { useMemo, useRef, useState } from "react";

import {
  DataGrid,
  type DataGridColumn,
  type DataGridRef,
  type SortState,
  type SortingMode,
} from "@/components/datagrid";

type Status = "active" | "paused" | "archived";

interface PersonRow {
  id: string;
  name: string;
  age: number;
  status: Status;
  city: string;
}

const BASE_COLUMNS: DataGridColumn<PersonRow>[] = [
  {
    id: "name",
    header: "Name",
    accessorKey: "name",
    sortable: true,
    width: 200,
  },
  {
    id: "age",
    header: "Age",
    accessorKey: "age",
    sortable: true,
    width: 120,
    resizable: true,
    resizeMinWidth: 100,
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    sortable: true,
    width: 160,
    cell: ({ value }) => (
      <span className="rounded bg-zinc-100 px-2 py-1 text-xs capitalize">
        {String(value)}
      </span>
    ),
  },
  {
    id: "city",
    header: "City",
    accessorKey: "city",
    sortable: true,
    width: 200,
  },
];

const COUNTRY_COLUMN: DataGridColumn<PersonRow> = {
  id: "country",
  header: "Country",
  accessorFn: () => "India",
  sortable: true,
  width: 200,
};

const BASE_DATA: PersonRow[] = Array.from({ length: 120 }, (_, index) => ({
  id: `row-${index + 1}`,
  name: `User ${index + 1}`,
  age: 20 + (index % 25),
  status: (["active", "paused", "archived"] as Status[])[index % 3],
  city: ["Ahmedabad", "Mumbai", "Pune", "Bengaluru"][index % 4],
}));

export default function Home() {
  const gridRef = useRef<DataGridRef<PersonRow>>(null);
  const [columns, setColumns] = useState(BASE_COLUMNS);
  const [data, setData] = useState(BASE_DATA);
  const [sortingMode, setSortingMode] = useState<SortingMode>("client");
  const [sortingState, setSortingState] = useState<SortState[]>([]);

  const resolvedData = useMemo(() => {
    if (sortingMode !== "server" || sortingState.length === 0) {
      return data;
    }
    const [first] = sortingState;
    if (!first) {
      return data;
    }
    const sorted = [...data];
    sorted.sort((left, right) => {
      const leftValue = left[first.id as keyof PersonRow];
      const rightValue = right[first.id as keyof PersonRow];
      if (leftValue === rightValue) {
        return 0;
      }
      const comparison = String(leftValue).localeCompare(String(rightValue));
      return first.desc ? comparison * -1 : comparison;
    });
    return sorted;
  }, [data, sortingMode, sortingState]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 px-6 py-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-zinc-900">Vibe DataGrid v1</h1>
        <p className="text-sm text-zinc-600">
          Pure HTML table tags + typed reusable grid primitives.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
          onClick={() => {
            const alreadyExists = columns.some((column) => column.id === "country");
            if (alreadyExists) {
              return;
            }
            setColumns((prev) => [...prev, COUNTRY_COLUMN]);
          }}
        >
          Add Country Column
        </button>
        <button
          type="button"
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
          onClick={() =>
            setColumns((prev) => prev.filter((column) => column.id !== "country"))
          }
        >
          Remove Country Column
        </button>
        <button
          type="button"
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
          onClick={() => gridRef.current?.pinColumn("name", "left")}
        >
          Pin Name
        </button>
        <button
          type="button"
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
          onClick={() => gridRef.current?.pinColumn("name", false)}
        >
          Unpin Name
        </button>
        <button
          type="button"
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
          onClick={() =>
            setSortingMode((prev) => (prev === "client" ? "server" : "client"))
          }
        >
          Sorting Mode: {sortingMode}
        </button>
      </div>

      <DataGrid<PersonRow>
        data={resolvedData}
        columns={columns}
        getRowId={(row) => row.id}
        sortingMode={sortingMode}
        sortingState={sortingMode === "server" ? sortingState : undefined}
        onSortingChange={(next) => {
          setSortingState(next);
        }}
        enableColumnDrag
        enableRowDrag
        enableColumnResize
        enablePinning
        isSelectionEnabled
        initialVisibleRowCount={20}
        visibleRowIncrement={20}
        rowActionsMode="menu"
        rowActions={[
          {
            id: "log",
            label: "Log Row",
            onClick: (row) => {
              console.log("Row clicked", row);
            },
          },
          {
            id: "delete",
            label: "Delete",
            onClick: (row) => {
              setData((prev) => prev.filter((item) => item.id !== row.id));
            },
            isDisabled: (row) => row.status === "archived",
          },
        ]}
        onColumnsChange={setColumns}
        gridRef={gridRef}
      />
    </main>
  );
}
