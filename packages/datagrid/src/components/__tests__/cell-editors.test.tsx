import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BooleanCellEditor } from "../cells/boolean-cell-editor";
import { DateCellEditor } from "../cells/date-cell-editor";
import { MultiSelectCellEditor } from "../cells/multi-select-cell-editor";
import { NumberCellEditor } from "../cells/number-cell-editor";
import { RatingCellEditor } from "../cells/rating-cell-editor";
import { SelectCellEditor } from "../cells/select-cell-editor";
import { TextCellEditor } from "../cells/text-cell-editor";
import { ToggleCellEditor } from "../cells/toggle-cell-editor";

describe("cell editors", () => {
  it("commits text edits on Enter and cancels on Escape", () => {
    const onCommit = vi.fn();

    render(<TextCellEditor value="Alpha" isEditable onCommit={onCommit} />);

    const displayButton = screen.getByRole("button", { name: "Alpha" });
    fireEvent.doubleClick(displayButton);

    const input = screen.getByDisplayValue("Alpha");
    fireEvent.change(input, { target: { value: "Beta" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onCommit).toHaveBeenCalledWith("Beta");

    fireEvent.doubleClick(screen.getByRole("button", { name: "Alpha" }));
    const secondInput = screen.getByDisplayValue("Alpha");
    fireEvent.change(secondInput, { target: { value: "Gamma" } });
    fireEvent.keyDown(secondInput, { key: "Escape" });

    expect(onCommit).toHaveBeenCalledTimes(1);
  });

  it("commits number edits on blur", () => {
    const onCommit = vi.fn();

    render(<NumberCellEditor value={10} isEditable onCommit={onCommit} />);

    fireEvent.doubleClick(screen.getByRole("button", { name: "10" }));
    const input = screen.getByDisplayValue("10");
    fireEvent.change(input, { target: { value: "24" } });
    fireEvent.blur(input);

    expect(onCommit).toHaveBeenCalledWith(24);
  });

  it("commits checkbox and toggle values", () => {
    const onBooleanCommit = vi.fn();
    const onToggleCommit = vi.fn();

    render(
      <>
        <BooleanCellEditor value={false} isEditable onCommit={onBooleanCommit} />
        <ToggleCellEditor value={false} isEditable onCommit={onToggleCommit} />
      </>
    );

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    const toggle = screen.getByRole("switch");
    fireEvent.click(toggle);

    expect(onBooleanCommit).toHaveBeenCalledWith(true);
    expect(onToggleCommit).toHaveBeenCalledWith(true);
  });

  it("commits date changes", () => {
    const onCommit = vi.fn();

    render(<DateCellEditor value={"2026-02-19"} isEditable onCommit={onCommit} />);

    const input = screen.getByDisplayValue("2026-02-19");
    fireEvent.change(input, { target: { value: "2026-02-20" } });

    expect(onCommit).toHaveBeenCalledWith("2026-02-20");
  });

  it("commits select and multi-select values", async () => {
    const user = userEvent.setup();
    const onSelectCommit = vi.fn();
    const onMultiSelectCommit = vi.fn();

    render(
      <>
        <SelectCellEditor
          value={"open"}
          options={[
            { label: "Open", value: "open" },
            { label: "Closed", value: "closed" },
          ]}
          isEditable
          onCommit={onSelectCommit}
        />
        <MultiSelectCellEditor
          value={["a"]}
          options={[
            { label: "A", value: "a" },
            { label: "B", value: "b" },
          ]}
          isEditable
          onCommit={onMultiSelectCommit}
        />
      </>
    );

    const selectTrigger = screen.getByLabelText("Select value");
    await user.click(selectTrigger);
    await user.click(await screen.findByText("Closed"));

    const multiSelectTrigger = screen.getAllByRole("combobox")[1];
    await user.click(multiSelectTrigger);
    await user.click(await screen.findByText("B"));

    expect(onSelectCommit).toHaveBeenCalledWith("closed");
    expect(onMultiSelectCommit).toHaveBeenCalledWith(["a", "b"]);
  });

  it("commits rating changes", () => {
    const onCommit = vi.fn();

    render(<RatingCellEditor value={2} isEditable onCommit={onCommit} maxRating={5} />);

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[3]);

    expect(onCommit).toHaveBeenCalledWith(4);
  });
});
