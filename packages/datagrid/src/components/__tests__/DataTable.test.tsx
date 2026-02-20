import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  uploadedBy?: string;
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

    expect(screen.getByRole("columnheader", { name: /Name/ })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Age/ })).toBeInTheDocument();
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

    expect(screen.queryByRole("columnheader", { name: /Hidden A/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: /Hidden B/ })).not.toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Visible Override/ })
    ).toBeInTheDocument();
  });

  it("applies minWidth and maxWidth styles to header and cells", () => {
    render(<DataTable rows={rows} columns={baseColumns} />);

    const header = screen.getByRole("columnheader", { name: /Name/ });
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

  it("calls row action handlers from three-dot row menu", async () => {
    const user = userEvent.setup();
    const onRowAction = vi.fn();

    render(
      <DataTable
        rows={rows}
        columns={baseColumns}
        rowActions={[
          {
            label: "Edit row",
            value: "edit",
            action: (row) => onRowAction(row.id),
          },
        ]}
      />
    );

    await user.click(screen.getByTestId("row-actions-trigger-1"));
    await user.click(await screen.findByText("Edit row"));

    expect(onRowAction).toHaveBeenCalledWith(1);
  });

  it("calls column action handlers from three-dot column menu", async () => {
    const user = userEvent.setup();
    const onColumnAction = vi.fn();

    render(
      <DataTable
        rows={rows}
        columns={baseColumns}
        columnActions={[
          {
            label: "Inspect column",
            value: "inspect",
            action: (column) => onColumnAction(column.id),
          },
        ]}
      />
    );

    await user.click(screen.getByTestId("column-actions-trigger-name"));
    await user.click(await screen.findByText("Inspect column"));

    expect(onColumnAction).toHaveBeenCalledWith("name");
  });

  it("calls row action handlers from right-click row context menu", async () => {
    const user = userEvent.setup();
    const onRowAction = vi.fn();

    render(
      <DataTable
        rows={rows}
        columns={baseColumns}
        rowActions={[
          {
            label: "Edit row",
            value: "edit",
            action: (row) => onRowAction(row.id),
          },
        ]}
      />
    );

    fireEvent.contextMenu(screen.getByText("Alice").closest("tr") as HTMLElement);
    await user.click(await screen.findByText("Edit row"));

    expect(onRowAction).toHaveBeenCalledWith(1);
  });

  it("calls column action handlers from right-click header context menu", async () => {
    const user = userEvent.setup();
    const onColumnAction = vi.fn();

    render(
      <DataTable
        rows={rows}
        columns={baseColumns}
        columnActions={[
          {
            label: "Inspect column",
            value: "inspect",
            action: (column) => onColumnAction(column.id),
          },
        ]}
      />
    );

    fireEvent.contextMenu(
      screen.getByRole("columnheader", {
        name: /Name/,
      })
    );
    await user.click(await screen.findByText("Inspect column"));

    expect(onColumnAction).toHaveBeenCalledWith("name");
  });

  it("renders group headers as full rows when grouped by a column", () => {
    const columns: DataTableColumn<Row>[] = [
      {
        id: "name",
        label: "Name",
        header: "Name",
        type: "text",
      },
      {
        id: "status",
        label: "Status",
        header: "Status",
        type: "text",
      },
    ];

    const groupedRows: Row[] = [
      { id: 1, name: "File A", age: 0, status: "Not Started" },
      { id: 2, name: "File B", age: 0, status: "Not Started" },
      { id: 3, name: "File C", age: 0, status: "Processed" },
    ];

    const { container } = render(
      <DataTable rows={groupedRows} columns={columns} groupByColumnId="status" />
    );

    expect(screen.getByText("Status: Not Started (2)")).toBeInTheDocument();
    expect(screen.getByText("Status: Processed (1)")).toBeInTheDocument();

    const groupCell = screen.getByText("Status: Not Started (2)").closest("td");
    expect(groupCell).toHaveAttribute("colspan", "2");

    const allRows = container.querySelectorAll("tbody tr");
    expect(allRows).toHaveLength(5);
  });

  it("renders subgroup headers as full rows when subgrouping is enabled", () => {
    const columns: DataTableColumn<Row>[] = [
      {
        id: "name",
        label: "Name",
        header: "Name",
        type: "text",
      },
      {
        id: "status",
        label: "Status",
        header: "Status",
        type: "text",
      },
      {
        id: "uploadedBy",
        label: "Uploaded By",
        header: "Uploaded By",
        type: "text",
      },
    ];

    const groupedRows: Row[] = [
      { id: 1, name: "A", age: 0, status: "Not Started", uploadedBy: "Nitin" },
      { id: 2, name: "B", age: 0, status: "Not Started", uploadedBy: "Unnati" },
      { id: 3, name: "C", age: 0, status: "Not Started", uploadedBy: "Unnati" },
      { id: 4, name: "D", age: 0, status: "Processed", uploadedBy: "Nitin" },
    ];

    render(
      <DataTable
        rows={groupedRows}
        columns={columns}
        groupByColumnId="status"
        subgroupByColumnId="uploadedBy"
      />
    );

    expect(screen.getByText("Status: Not Started (3)")).toBeInTheDocument();
    expect(screen.getByText("Status: Processed (1)")).toBeInTheDocument();
    expect(screen.getAllByText("Uploaded By: Nitin (1)")).toHaveLength(2);
    expect(screen.getByText("Uploaded By: Unnati (2)")).toBeInTheDocument();

    const subgroupHeader = screen
      .getByText("Uploaded By: Unnati (2)")
      .closest("tr") as HTMLTableRowElement;
    expect(subgroupHeader).toHaveAttribute("data-group-level", "2");
  });

  it("renders drag handles for draggable columns and hides when disabled", () => {
    const columns: DataTableColumn<Row>[] = [
      {
        id: "name",
        label: "Name",
        header: "Name",
        type: "text",
        isDraggable: true,
      },
      {
        id: "age",
        label: "Age",
        header: "Age",
        type: "number",
        isDraggable: false,
      },
    ];

    render(<DataTable rows={rows} columns={columns} />);

    expect(screen.getByTestId("drag-handle-name")).toBeInTheDocument();
    expect(screen.queryByTestId("drag-handle-age")).not.toBeInTheDocument();
  });

  it("keeps pinned columns at the left and right edges", () => {
    const columns: DataTableColumn<Row>[] = [
      {
        id: "name",
        label: "Name",
        header: "Name",
        type: "text",
      },
      {
        id: "age",
        label: "Age",
        header: "Age",
        type: "number",
        pin: "right",
        minWidth: 120,
      },
      {
        id: "status",
        label: "Status",
        header: "Status",
        type: "text",
        pin: "left",
        minWidth: 100,
      },
    ];

    render(<DataTable rows={rows} columns={columns} />);

    const headers = screen.getAllByRole("columnheader");
    expect(headers[0]).toHaveTextContent("Status");
    expect(headers[1]).toHaveTextContent("Name");
    expect(headers[2]).toHaveTextContent("Age");

    expect(headers[0]).toHaveStyle({ position: "sticky", left: "0px" });
    expect(headers[2]).toHaveStyle({ position: "sticky", right: "0px" });
    expect(screen.queryByTestId("drag-handle-status")).not.toBeInTheDocument();
    expect(screen.queryByTestId("drag-handle-age")).not.toBeInTheDocument();
  });

  it("computes cumulative left offsets for multiple pinned columns", () => {
    const columns: DataTableColumn<Row>[] = [
      {
        id: "a",
        label: "A",
        header: "A",
        type: "text",
        pin: "left",
        minWidth: 90,
        cell: () => "a",
      },
      {
        id: "b",
        label: "B",
        header: "B",
        type: "text",
        pin: "left",
        minWidth: 110,
        cell: () => "b",
      },
      {
        id: "name",
        label: "Name",
        header: "Name",
        type: "text",
      },
    ];

    render(<DataTable rows={rows} columns={columns} />);

    const headerA = screen.getByRole("columnheader", { name: /A/ });
    const headerB = screen.getByRole("columnheader", { name: /B/ });

    expect(headerA).toHaveStyle({ left: "0px" });
    expect(headerB).toHaveStyle({ left: "90px" });
  });

  it("renders resize handles only for resizable columns", () => {
    const columns: DataTableColumn<Row>[] = [
      {
        id: "name",
        label: "Name",
        header: "Name",
        type: "text",
        isResizable: true,
      },
      {
        id: "age",
        label: "Age",
        header: "Age",
        type: "number",
        isResizable: false,
      },
    ];

    render(<DataTable rows={rows} columns={columns} />);

    expect(screen.getByTestId("resize-handle-name")).toBeInTheDocument();
    expect(screen.queryByTestId("resize-handle-age")).not.toBeInTheDocument();
  });

  it("resizes columns with min/max clamping and emits onColumnResize", () => {
    const onColumnResize = vi.fn();
    const columns: DataTableColumn<Row>[] = [
      {
        id: "name",
        label: "Name",
        header: "Name",
        type: "text",
        minWidth: 100,
        maxWidth: 150,
        isResizable: true,
      },
    ];

    render(
      <DataTable rows={rows} columns={columns} onColumnResize={onColumnResize} />
    );

    const resizeHandle = screen.getByTestId("resize-handle-name");
    fireEvent.mouseDown(resizeHandle, { clientX: 100 });
    fireEvent.mouseMove(document, { clientX: 180 });
    fireEvent.mouseUp(document);

    expect(onColumnResize).toHaveBeenCalledWith("name", 150);

    const headerCell = screen
      .getByTestId("drag-handle-name")
      .closest("th") as HTMLTableCellElement;
    expect(headerCell).toHaveStyle({ width: "150px" });

    fireEvent.mouseDown(resizeHandle, { clientX: 150 });
    fireEvent.mouseMove(document, { clientX: -100 });
    fireEvent.mouseUp(document);

    expect(onColumnResize).toHaveBeenLastCalledWith("name", 100);
    expect(headerCell).toHaveStyle({ width: "100px" });
  });

  it("sorts rows in client mode and cycles asc, desc, none", () => {
    const sortableColumns: DataTableColumn<Row>[] = [
      {
        id: "name",
        label: "Name",
        header: "Name",
        type: "text",
      },
      {
        id: "age",
        label: "Age",
        header: "Age",
        type: "number",
        isSortable: true,
      },
    ];

    const { container } = render(<DataTable rows={rows} columns={sortableColumns} />);
    const sortTrigger = screen.getByTestId("sort-trigger-age");
    const ageHeader = screen.getByRole("columnheader", { name: /Age/ });

    const getRenderedNames = () =>
      Array.from(container.querySelectorAll("tbody tr")).map((row) =>
        row.querySelector("td")?.textContent?.trim()
      );

    expect(getRenderedNames()).toEqual(["Alice", "Bob"]);
    expect(ageHeader).toHaveAttribute("aria-sort", "none");

    fireEvent.click(sortTrigger);
    expect(ageHeader).toHaveAttribute("aria-sort", "ascending");
    expect(getRenderedNames()).toEqual(["Bob", "Alice"]);

    fireEvent.click(sortTrigger);
    expect(ageHeader).toHaveAttribute("aria-sort", "descending");
    expect(getRenderedNames()).toEqual(["Alice", "Bob"]);

    fireEvent.click(sortTrigger);
    expect(ageHeader).toHaveAttribute("aria-sort", "none");
    expect(getRenderedNames()).toEqual(["Alice", "Bob"]);
  });

  it("emits sort changes without reordering rows in manual mode", () => {
    const onSortChange = vi.fn();
    const sortableColumns: DataTableColumn<Row>[] = [
      {
        id: "name",
        label: "Name",
        header: "Name",
        type: "text",
      },
      {
        id: "age",
        label: "Age",
        header: "Age",
        type: "number",
        isSortable: true,
      },
    ];

    const { container } = render(
      <DataTable
        rows={rows}
        columns={sortableColumns}
        sortingMode="manual"
        onSortChange={onSortChange}
      />
    );

    fireEvent.click(screen.getByTestId("sort-trigger-age"));

    const renderedNames = Array.from(container.querySelectorAll("tbody tr")).map(
      (row) => row.querySelector("td")?.textContent?.trim()
    );

    expect(renderedNames).toEqual(["Alice", "Bob"]);
    expect(onSortChange).toHaveBeenCalledWith({
      columnId: "age",
      direction: "asc",
    });
  });
});
