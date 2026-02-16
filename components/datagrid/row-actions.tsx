"use client";

import { cx } from "./class-slots";
import type { DataGridClassNames, RowAction } from "./types";

interface RowActionsMenuProps<TData> {
  row: TData;
  actions: RowAction<TData>[];
  classNames: DataGridClassNames;
}

export function RowActionsMenu<TData>({
  row,
  actions,
  classNames,
}: RowActionsMenuProps<TData>) {
  const visibleActions = actions.filter((action) =>
    action.isVisible ? action.isVisible(row) : true,
  );

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <details className="relative">
      <summary
        className="list-none cursor-pointer rounded border border-zinc-300 px-2 py-1 text-base leading-none hover:bg-zinc-100"
        aria-label="Open row actions"
      >
        ⋯
      </summary>
      <div className="absolute right-0 z-20 mt-1 min-w-40 rounded-md border border-zinc-200 bg-white p-1 shadow-lg">
        {visibleActions.map((action) => (
          <button
            key={action.id}
            type="button"
            className={cx(
              "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-zinc-100 disabled:opacity-50",
              classNames.actionsCell,
              action.className,
            )}
            disabled={action.isDisabled ? action.isDisabled(row) : false}
            onClick={() => void action.onClick(row)}
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </details>
  );
}
