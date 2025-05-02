import * as React from "react";
import { MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ColumnConfig } from "@/app/types/column"; // Assuming original path

interface ColumnActionsMenuProps<T> {
  column: ColumnConfig<T>;
  onColumnChange?: (updatedColumn: ColumnConfig<T>) => void;
  onColumnDelete?: (columnId: string) => void;
  setIsEditingColumn: (isEditing: boolean) => void;
  pinnedColumns: Record<string, boolean>;
  setPinnedColumns: (pinnedColumns: Record<string, boolean>) => void;
  stopPropagation: (e: React.MouseEvent | React.TouchEvent) => void;
}

export function ColumnActionsMenu<T>({
  column,
  onColumnChange,
  onColumnDelete,
  setIsEditingColumn,
  pinnedColumns,
  setPinnedColumns,
  stopPropagation,
}: ColumnActionsMenuProps<T>) {
  // Only render if there are actions available

  console.log({ pinnedColumns });

  if (!column.isEditable || !column.isDeletable) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onMouseDown={stopPropagation} // Prevent drag/sort activation
          onTouchStart={stopPropagation}
          aria-label="Column actions"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {column.isEditable && onColumnChange && (
          <DropdownMenuItem onSelect={() => setIsEditingColumn(true)}>
            Edit
          </DropdownMenuItem>
        )}
        {column.isEditable &&
          onColumnChange &&
          column.isDeletable &&
          onColumnDelete && <DropdownMenuSeparator />}
        {column.isDeletable && onColumnDelete && (
          <DropdownMenuItem
            onSelect={() => onColumnDelete(column.id)}
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            Delete
          </DropdownMenuItem>
        )}
        {/* Separator before Pin/Unpin if Edit or Delete are present */}
        {((column.isEditable && onColumnChange) ||
          (column.isDeletable && onColumnDelete)) && <DropdownMenuSeparator />}
        <DropdownMenuItem
          onSelect={() =>
            setPinnedColumns({
              ...pinnedColumns,
              [column.id]: !pinnedColumns[column.id],
            })
          }
        >
          {pinnedColumns?.[column.id] ? "Unpin" : "Pin"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
