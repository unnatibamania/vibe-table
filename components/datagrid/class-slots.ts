import type { DataGridClassNames } from "./types";

export const defaultDataGridClassNames: DataGridClassNames = {
  root: "vt-root w-full space-y-3",
  toolbar: "vt-toolbar flex items-center justify-between gap-2",
  tableWrapper: "vt-table-wrapper w-full overflow-auto rounded-lg border border-zinc-200",
  table: "vt-table min-w-full w-max border-separate border-spacing-0 text-left text-sm",
  thead: "vt-thead bg-zinc-50",
  headerRow: "vt-header-row",
  headerCell:
    "vt-header-cell sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50 px-3 py-2 font-medium text-zinc-700",
  body: "vt-body",
  row: "vt-row border-b border-zinc-100",
  cell: "vt-cell border-b border-zinc-100 px-3 py-2 align-middle text-zinc-900",
  pinnedLeft: "vt-pinned-left bg-white shadow-[1px_0_0_0_rgba(228,228,231,1)]",
  dragHandle: "vt-drag-handle cursor-grab select-none text-zinc-500",
  resizeHandle:
    "vt-resize-handle absolute right-0 top-0 h-full w-1.5 cursor-col-resize border-0 bg-transparent p-0 hover:bg-zinc-300",
  selectionCell: "vt-selection-cell w-11 min-w-11 text-center",
  actionsCell: "vt-actions-cell whitespace-nowrap",
  editorBase:
    "vt-editor-base w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm outline-none focus:border-zinc-500",
  editorText: "vt-editor-text",
  editorTextarea: "vt-editor-textarea min-h-16",
  editorSelect: "vt-editor-select",
  editorMultiSelect: "vt-editor-multiselect min-h-20",
  editorToggle: "vt-editor-toggle",
  editorCheckbox: "vt-editor-checkbox h-4 w-4",
  editorNumber: "vt-editor-number",
  editorRating: "vt-editor-rating inline-flex items-center gap-1",
  editorDate: "vt-editor-date",
  errorText: "vt-error-text mt-1 text-xs text-red-600",
  emptyState: "vt-empty-state px-4 py-8 text-center text-zinc-500",
  pagination: "vt-pagination flex items-center justify-between gap-3",
  paginationButton:
    "vt-pagination-button rounded-md border border-zinc-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50",
};

export function mergeClassNames(
  overrides?: Partial<DataGridClassNames>,
): DataGridClassNames {
  return {
    ...defaultDataGridClassNames,
    ...overrides,
  };
}

export function cx(...values: Array<string | undefined | false | null>): string {
  return values.filter(Boolean).join(" ");
}
