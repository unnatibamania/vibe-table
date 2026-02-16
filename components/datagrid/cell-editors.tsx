"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";

import { cx } from "./class-slots";
import type { DataGridClassNames, DataGridColumn, EditorConfig } from "./types";

interface DataGridCellEditorProps<TData> {
  value: unknown;
  row: TData;
  rowIndex: number;
  column: DataGridColumn<TData>;
  classNames: DataGridClassNames;
  onCommit: (value: unknown) => void;
}

export function DataGridCellEditor<TData>({
  value,
  row,
  rowIndex,
  column,
  classNames,
  onCommit,
}: DataGridCellEditorProps<TData>) {
  const editor = column.editor;
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);

  if (!editor) {
    return <span>{toDisplayString(value)}</span>;
  }

  const disabled =
    typeof editor.disabled === "function" ? editor.disabled(row) : editor.disabled;

  const commit = (next: unknown) => {
    const validationError = editor.validate?.(next, row) ?? null;
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onCommit(next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commit(draft);
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setDraft(value);
      setError(null);
    }
  };

  const sharedClassName = cx(classNames.editorBase, editorClass(editor, classNames));
  const options = editor.options ?? [];

  if (editor.type === "custom" && editor.renderCustomEditor) {
    return (
      <>
        {editor.renderCustomEditor({
          value: draft,
          onChange: setDraft,
          onCommit: commit,
          row,
          rowIndex,
          column,
        })}
        {error ? <div className={classNames.errorText}>{error}</div> : null}
      </>
    );
  }

  let control: React.ReactNode;
  switch (editor.type) {
    case "textarea":
      control = (
        <textarea
          className={sharedClassName}
          value={String(draft ?? "")}
          placeholder={editor.placeholder}
          disabled={disabled}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => commit(draft)}
          onKeyDown={onKeyDown}
        />
      );
      break;
    case "select":
      control = (
        <select
          className={sharedClassName}
          value={String(draft ?? "")}
          disabled={disabled}
          onChange={(event) => {
            setDraft(event.target.value);
            commit(event.target.value);
          }}
          onKeyDown={onKeyDown}
        >
          <option value="">Select</option>
          {options.map((option) => (
            <option key={String(option.value)} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
      );
      break;
    case "multiselect":
      control = (
        <select
          multiple
          className={sharedClassName}
          value={toArrayValue(draft).map((item) => String(item))}
          disabled={disabled}
          onChange={(event) => {
            const next = Array.from(event.target.selectedOptions).map(
              (option) => option.value,
            );
            setDraft(next);
            commit(next);
          }}
        >
          {options.map((option) => (
            <option key={String(option.value)} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
      );
      break;
    case "toggle":
    case "checkbox":
      control = (
        <input
          type="checkbox"
          checked={Boolean(draft)}
          disabled={disabled}
          className={cx(
            classNames.editorCheckbox,
            editor.type === "toggle" ? classNames.editorToggle : undefined,
          )}
          onChange={(event) => {
            setDraft(event.target.checked);
            commit(event.target.checked);
          }}
        />
      );
      break;
    case "number":
      control = (
        <input
          type="number"
          className={sharedClassName}
          value={toTextValue(draft)}
          min={editor.min}
          max={editor.max}
          step={editor.step}
          disabled={disabled}
          onChange={(event) => setDraft(Number(event.target.value))}
          onBlur={() => commit(draft)}
          onKeyDown={onKeyDown}
        />
      );
      break;
    case "rating":
      control = (
        <div className={classNames.editorRating}>
          {Array.from({ length: editor.max ?? 5 }).map((_, index) => {
            const star = index + 1;
            const active = Number(draft ?? 0) >= star;
            return (
              <button
                key={star}
                type="button"
                className={cx(
                  "text-lg leading-none",
                  active ? "text-amber-500" : "text-zinc-300",
                )}
                disabled={disabled}
                onClick={() => {
                  setDraft(star);
                  commit(star);
                }}
              >
                ★
              </button>
            );
          })}
        </div>
      );
      break;
    case "date":
      control = (
        <input
          type="date"
          className={sharedClassName}
          value={toDateValue(draft)}
          disabled={disabled}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => commit(draft)}
          onKeyDown={onKeyDown}
        />
      );
      break;
    case "text":
    default:
      control = (
        <input
          type="text"
          className={sharedClassName}
          value={toTextValue(draft)}
          placeholder={editor.placeholder}
          disabled={disabled}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => commit(draft)}
          onKeyDown={onKeyDown}
        />
      );
  }

  return (
    <>
      {control}
      {error ? <div className={classNames.errorText}>{error}</div> : null}
    </>
  );
}

function editorClass<TData>(
  editor: EditorConfig<TData>,
  classNames: DataGridClassNames,
): string | undefined {
  switch (editor.type) {
    case "textarea":
      return classNames.editorTextarea;
    case "select":
      return classNames.editorSelect;
    case "multiselect":
      return classNames.editorMultiSelect;
    case "toggle":
      return classNames.editorToggle;
    case "checkbox":
      return classNames.editorCheckbox;
    case "number":
      return classNames.editorNumber;
    case "rating":
      return classNames.editorRating;
    case "date":
      return classNames.editorDate;
    case "text":
      return classNames.editorText;
    default:
      return undefined;
  }
}

function toArrayValue(value: unknown): Array<string | number> {
  if (Array.isArray(value)) {
    return value as Array<string | number>;
  }
  return [];
}

function toTextValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

function toDateValue(value: unknown): string {
  if (typeof value === "string") {
    return value.slice(0, 10);
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return "";
}

function toDisplayString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "boolean") {
    return value ? "True" : "False";
  }
  return String(value);
}
