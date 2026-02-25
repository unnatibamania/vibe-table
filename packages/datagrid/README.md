# @vibe-tables/datagrid

Highly customizable DataTable/DataGrid primitives for React.

## Installation

```bash
npm i @vibe-tables/datagrid
```

## Peer dependencies

- `react` >= 18
- `react-dom` >= 18

## Basic usage

```tsx
import { DataTable, type DataTableColumnConfig } from "@vibe-tables/datagrid";

type Row = {
  id: number;
  name: string;
  status: string;
};

const columns: DataTableColumnConfig<Row>[] = [
  { id: "name", label: "Name", header: "Name", type: "text" },
  { id: "status", label: "Status", header: "Status", type: "text" },
];

const rows: Row[] = [
  { id: 1, name: "Alpha", status: "Ready" },
  { id: 2, name: "Beta", status: "Draft" },
];

export function Example() {
  return <DataTable rows={rows} columns={columns} />;
}
```

## Features

- Rich cell types and editable cells
- Row selection
- Row and column actions
- Draggable and resizable columns
- Pinned columns
- Client/manual sorting
- Right-click context menu
- Grouping and subgrouping
- Extensive class-slot customization
