import { describe, expect, it } from "vitest";
import { getVisibleColumns, normalizeColumns } from "../normalize-columns";
import type { DataTableColumn } from "../../types/column";

type Row = { id: number; name: string };

const baseColumn = {
  label: "Name",
  header: "Name",
  type: "text" as const,
};

describe("normalizeColumns", () => {
  it("hides the column when isVisible is false", () => {
    const columns: DataTableColumn<Row>[] = [
      { ...baseColumn, id: "name", isVisible: false, isHidden: false },
    ];

    const [column] = normalizeColumns(columns);
    expect(column.isVisible).toBe(false);
  });

  it("respects explicit isVisible true even when isHidden is true", () => {
    const columns: DataTableColumn<Row>[] = [
      { ...baseColumn, id: "name", isVisible: true, isHidden: true },
    ];

    const [column] = normalizeColumns(columns);
    expect(column.isVisible).toBe(true);
  });

  it("derives visibility from isHidden when isVisible is undefined", () => {
    const columns: DataTableColumn<Row>[] = [
      { ...baseColumn, id: "name", isHidden: true },
    ];

    const [column] = normalizeColumns(columns);
    expect(column.isVisible).toBe(false);
  });

  it("defaults to visible when both isVisible and isHidden are undefined", () => {
    const columns: DataTableColumn<Row>[] = [{ ...baseColumn, id: "name" }];

    const [column] = normalizeColumns(columns);
    expect(column.isVisible).toBe(true);
  });

  it("returns only visible columns from getVisibleColumns", () => {
    const columns: DataTableColumn<Row>[] = [
      { ...baseColumn, id: "name" },
      {
        ...baseColumn,
        id: "hidden_col",
        label: "Hidden",
        header: "Hidden",
        isVisible: false,
      },
    ];

    const visible = getVisibleColumns(columns);
    expect(visible).toHaveLength(1);
    expect(visible[0].id).toBe("name");
  });
});
