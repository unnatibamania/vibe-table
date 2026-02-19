"use client";

import { MoreHorizontal } from "lucide-react";
import type { DataTableRowAction } from "../types/actions";
import type { RowId } from "../types/table";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface RowActionsMenuProps<T extends object> {
  row: T;
  rowId: RowId;
  actions: DataTableRowAction<T>[];
}

export function RowActionsMenu<T extends object>({
  row,
  rowId,
  actions,
}: RowActionsMenuProps<T>) {
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
          aria-label={`Row actions for ${String(rowId)}`}
          data-testid={`row-actions-trigger-${String(rowId)}`}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => (
          <DropdownMenuItem
            key={`${String(rowId)}-${action.value}`}
            onSelect={() => action.action(row, { row, rowId })}
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
