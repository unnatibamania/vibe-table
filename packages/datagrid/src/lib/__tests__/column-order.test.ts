import { describe, expect, it } from "vitest";
import { mergeColumnOrder, reorderColumnIds } from "../column-order";

describe("column-order", () => {
  it("keeps existing order for matching ids and appends new ids", () => {
    const next = mergeColumnOrder(["b", "a"], ["a", "b", "c"]);
    expect(next).toEqual(["b", "a", "c"]);
  });

  it("removes ids that no longer exist", () => {
    const next = mergeColumnOrder(["b", "a", "x"], ["a", "b"]);
    expect(next).toEqual(["b", "a"]);
  });

  it("reorders ids when active and over are valid", () => {
    const next = reorderColumnIds(["a", "b", "c"], "a", "c");
    expect(next).toEqual(["b", "c", "a"]);
  });

  it("returns same order when ids are invalid", () => {
    const current = ["a", "b", "c"];
    const next = reorderColumnIds(current, "a", "z");
    expect(next).toBe(current);
  });
});
