import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataTable } from "../DataTable";
import type { DataTableColumn } from "../../types/column";

interface Row {
  id?: number;
  key?: string;
  name: string;
  age: number;
  status: string;
  hidden?: string;
}

const rows: Row[] = [
  { id: 1, name: "Alice", age: 31, status: "active", hidden: "x" },
  { id: 2, name: "Bob", age: 27, status: "paused", hidden: "y" },
];

const baseColumns: DataTableColumn<Row>[] = [
  {
    id: "name",
    label: "Name",
    header: "Name",
    type: "text",
    minWidth: 120,
    maxWidth: 220,
    cell: (row) => row.name,
  },
  {
    id: "age",
    label: "Age",
    header: "Age",
    type: "number",
    cell: (row) => row.age,
  },
  {
    id: "status",
    label: "Status",
    header: "Status",
    type: "custom",
    cell: (row) => <span data-testid={`status-${row.id}`}>{row.status}</span>,
  },
];

describe("DataTable", () => {
  it("renders headers and row data", () => {
    render(<DataTable rows={rows} columns={baseColumns} />);

    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Age" })).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("hides columns based on isVisible and isHidden", () => {
    const columns: DataTableColumn<Row>[] = [
      ...baseColumns,
      {
        id: "hiddenA",
        label: "Hidden A",
        header: "Hidden A",
        type: "text",
        isVisible: false,
        cell: () => "hidden-a",
      },
      {
        id: "hiddenB",
        label: "Hidden B",
        header: "Hidden B",
        type: "text",
        isHidden: true,
        cell: () => "hidden-b",
      },
      {
        id: "visibleOverride",
        label: "Visible Override",
        header: "Visible Override",
        type: "text",
        isHidden: true,
        isVisible: true,
        cell: () => "visible-override",
      },
    ];

    render(<DataTable rows={rows} columns={columns} />);

    expect(screen.queryByRole("columnheader", { name: "Hidden A" })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Hidden B" })).not.toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Visible Override" })
    ).toBeInTheDocument();
  });

  it("applies minWidth and maxWidth styles to header and cells", () => {
    render(<DataTable rows={rows} columns={baseColumns} />);

    const header = screen.getByRole("columnheader", { name: "Name" });
    expect(header).toHaveStyle({ minWidth: "120px", maxWidth: "220px" });

    const cell = screen.getByText("Alice").closest("td");
    expect(cell).toHaveStyle({ minWidth: "120px", maxWidth: "220px" });
  });

  it("uses custom cell renderer", () => {
    render(<DataTable rows={rows} columns={baseColumns} />);

    expect(screen.getByTestId("status-1")).toHaveTextContent("active");
    expect(screen.getByTestId("status-2")).toHaveTextContent("paused");
  });

  it("renders loading rows and skeletons", () => {
    const columns: DataTableColumn<Row>[] = [
      {
        id: "name",
        label: "Name",
        header: "Name",
        type: "text",
        skeleton: <div data-testid="name-skeleton" />,
      },
      {
        id: "age",
        label: "Age",
        header: "Age",
        type: "number",
      },
    ];

    const { container } = render(
      <DataTable rows={rows} columns={columns} isLoading loadingRowCount={2} />
    );

    expect(container.querySelectorAll("tbody tr")).toHaveLength(2);
    expect(screen.getAllByTestId("name-skeleton")).toHaveLength(2);
  });

  it("renders empty state when no rows", () => {
    const { container } = render(
      <DataTable rows={[]} columns={baseColumns} emptyState="Nothing here" />
    );

    expect(screen.getByText("Nothing here")).toBeInTheDocument();
    const emptyCell = container.querySelector("tbody td");
    expect(emptyCell).toHaveAttribute("colspan", "3");
  });

  it("uses fallback value when cell renderer is not provided", () => {
    const columns: DataTableColumn<Row>[] = [
      {
        id: "name",
        label: "Name",
        header: "Name",
        type: "text",
      },
    ];

    render(<DataTable rows={rows} columns={columns} />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("uses getRowId when provided", () => {
    const customRows = [
      { key: "row-a", name: "A", age: 20, status: "ok" },
      { key: "row-b", name: "B", age: 21, status: "ok" },
    ];

    const { container } = render(
      <DataTable
        rows={customRows}
        columns={baseColumns}
        getRowId={(row) => row.key as string}
      />
    );

    const renderedRows = container.querySelectorAll("tbody tr[data-row-id]");
    expect(renderedRows[0]).toHaveAttribute("data-row-id", "row-a");
    expect(renderedRows[1]).toHaveAttribute("data-row-id", "row-b");
  });

  it("calls onCellChange for editable text cells", () => {
    const onCellChange = vi.fn();
    const columns: DataTableColumn<Row>[] = [
      {
        id: "name",
        label: "Name",
        header: "Name",
        type: "text",
        isEditable: true,
      },
    ];

    render(<DataTable rows={rows} columns={columns} onCellChange={onCellChange} />);

    fireEvent.doubleClick(screen.getByRole("button", { name: "Alice" }));
    const input = screen.getByDisplayValue("Alice");
    fireEvent.change(input, { target: { value: "Alicia" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onCellChange).toHaveBeenCalledWith(1, "name", "Alicia");
  });

  it("supports uncontrolled row selection with row and header checkboxes", () => {
    const onSelectionChange = vi.fn();

    render(
      <DataTable
        rows={rows}
        columns={baseColumns}
        enableRowSelection
        onSelectionChange={onSelectionChange}
      />
    );

    const selectAll = screen.getByLabelText("Select all rows");
    const selectRow1 = screen.getByLabelText("Select row 1");
    const selectRow2 = screen.getByLabelText("Select row 2");

    expect(selectAll).toHaveAttribute("aria-checked", "false");
    expect(selectRow1).toHaveAttribute("aria-checked", "false");
    expect(selectRow2).toHaveAttribute("aria-checked", "false");

    fireEvent.click(selectRow1);
    expect(selectRow1).toHaveAttribute("aria-checked", "true");
    expect(selectAll).toHaveAttribute("aria-checked", "mixed");

    const firstSelection = onSelectionChange.mock.calls[0][0] as Set<number>;
    expect(Array.from(firstSelection)).toEqual([1]);

    fireEvent.click(selectAll);
    expect(selectRow1).toHaveAttribute("aria-checked", "true");
    expect(selectRow2).toHaveAttribute("aria-checked", "true");

    const secondSelection = onSelectionChange.mock.calls[1][0] as Set<number>;
    expect(Array.from(secondSelection)).toEqual([1, 2]);
  });

  it("supports controlled row selection", () => {
    const onSelectionChange = vi.fn();

    render(
      <DataTable
        rows={rows}
        columns={baseColumns}
        enableRowSelection
        selectedRowIds={new Set([1])}
        onSelectionChange={onSelectionChange}
      />
    );

    const selectRow1 = screen.getByLabelText("Select row 1");
    const selectRow2 = screen.getByLabelText("Select row 2");

    expect(selectRow1).toHaveAttribute("aria-checked", "true");
    expect(selectRow2).toHaveAttribute("aria-checked", "false");

    fireEvent.click(selectRow2);

    const nextSelection = onSelectionChange.mock.calls[0][0] as Set<number>;
    expect(Array.from(nextSelection)).toEqual([1, 2]);
  });

  it("uses defaultSelectedRowIds in uncontrolled mode", () => {
    render(
      <DataTable
        rows={rows}
        columns={baseColumns}
        enableRowSelection
        defaultSelectedRowIds={new Set([2])}
      />
    );

    expect(screen.getByLabelText("Select row 1")).toHaveAttribute(
      "aria-checked",
      "false"
    );
    expect(screen.getByLabelText("Select row 2")).toHaveAttribute(
      "aria-checked",
      "true"
    );
    expect(screen.getByLabelText("Select all rows")).toHaveAttribute(
      "aria-checked",
      "mixed"
    );
  });
});
