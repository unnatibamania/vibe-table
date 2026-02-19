"use client";

import { MoreHorizontal } from "lucide-react";
import type { DataTableColumnAction } from "../types/actions";
import type { NormalizedDataTableColumn } from "../types/column";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface ColumnActionsMenuProps<T extends object> {
  column: NormalizedDataTableColumn<T>;
  actions: DataTableColumnAction<T>[];
}

export function ColumnActionsMenu<T extends object>({
  column,
  actions,
}: ColumnActionsMenuProps<T>) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          aria-label={`Column actions for ${column.label}`}
          data-testid={`column-actions-trigger-${column.id}`}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => (
          <DropdownMenuItem
            key={`${column.id}-${action.value}`}
            onSelect={() => action.action(column, { column })}
            className="cursor-pointer"
          >
            {action.icon ? <span className="mr-2 inline-flex">{action.icon}</span> : null}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
