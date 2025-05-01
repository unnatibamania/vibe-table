import * as React from "react";
import { TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ChevronUp,
  ChevronDown,
  GripVertical,
  MoreVertical,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditColumnForm } from "./edit-column-form"; // Import the form component
import type { ColumnConfig } from "@/app/types/column"; // Assuming original path for now
import type { DataGridClassNames, SortDirection } from "./types"; // Adjusted import

// --- DraggableTableHeader needs to revert generic T and use any for ColumnConfig ---
interface DraggableTableHeaderProps<T> {
  column: ColumnConfig<T>;
  isSortable: boolean;
  currentDirection: SortDirection | null;
  handleSort: (columnId: string) => void;
  onResizeStart: (columnId: string, startX: number) => void;
  width?: number;
  classNames?: DataGridClassNames["header"];
  onColumnChange?: (updatedColumn: ColumnConfig<T>) => void;
  onColumnDelete?: (columnId: string) => void; // <-- Add onColumnDelete prop
  pinnedColumns: Record<string, boolean>;
  setPinnedColumns: (pinnedColumns: Record<string, boolean>) => void;
}

export function DraggableTableHeader<T>({
  // Export the component
  column,
  isSortable,
  currentDirection,
  handleSort,
  onResizeStart,
  width,
  classNames,
  onColumnChange,
  onColumnDelete, // <-- Destructure prop
  pinnedColumns,
  setPinnedColumns,
}: DraggableTableHeaderProps<T>) {
  const {
    attributes,
    listeners: dndListeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    disabled: !column.isDraggable,
  });

  const [isEditingColumn, setIsEditingColumn] = React.useState(false);

  const handleMouseDown = (event: React.MouseEvent) => {
    if (!column.isResizable) return;
    // Prevent dnd starting if clicking resizer
    event.preventDefault();
    event.stopPropagation();
    onResizeStart(column.id, event.clientX);
  };

  const thRef = React.useRef<HTMLTableCellElement>(null); // Ref for TH element
  React.useEffect(() => {
    setNodeRef(thRef.current);
  }, [setNodeRef, thRef]);

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative", // Needed for absolute positioning of handle
    width: width ? `${width}px` : undefined, // Apply width from state
    minWidth: column.minWidth ? `${column.minWidth}px` : undefined,
    maxWidth: column.maxWidth ? `${column.maxWidth}px` : undefined,
    // cursor and touchAction handled by elements inside
  };

  const handleEditSave = (updatedConfig: ColumnConfig<T>) => {
    // Use any
    if (onColumnChange) {
      onColumnChange(updatedConfig);
    }
    setIsEditingColumn(false);
  };

  // Prevent dropdown trigger from activating row drag/sort
  const stopPropagation = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
  };

  return (
    <TableHead
      ref={thRef}
      style={style}
      {...attributes}
      className={cn("group relative bg-zinc-100", classNames?.cell)}
    >
      {/* Dialog for Editing Column (replaces Popover) */}
      <Dialog open={isEditingColumn} onOpenChange={setIsEditingColumn}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Edit Column:{" "}
              {typeof column.header === "string" ? column.header : column.id}
            </DialogTitle>
          </DialogHeader>
          <EditColumnForm column={column} onSave={handleEditSave} />
        </DialogContent>
      </Dialog>

      <div className="flex items-center h-full justify-between">
        {/* Left side: Drag Handle + Content + Sort */}
        <div className="flex items-center flex-grow overflow-hidden mr-1">
          {column.isDraggable && (
            <span
              {...dndListeners} // dnd listeners ONLY on the handle
              className={cn(
                "p-1 cursor-grab touch-none mr-1 self-stretch flex items-center",
                classNames?.dragHandle
              )}
              aria-label="Drag to reorder column"
              onMouseDown={stopPropagation} // Prevent text selection/drag conflict
              onTouchStart={stopPropagation}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/70" />
            </span>
          )}
          <div className="flex-grow overflow-hidden">
            {isSortable ? (
              <Button
                variant="ghost"
                onClick={() => handleSort(column.id)}
                className={cn(
                  "px-1 py-1 h-auto flex items-center w-full justify-start text-left",
                  classNames?.cell
                )}
                {...(!column.isDraggable ? dndListeners : {})}
              >
                {column.icon ? <div className="mr-1">{column.icon}</div> : null}
                {/* Header Content */}
                <span className="truncate">{column.header}</span>
                {/* Sort Icon */}
                <div className="ml-auto  cursor-pointer flex flex-col ">
                  <ChevronUp
                    size={8}
                    className={cn(
                      " text-zinc-500",
                      currentDirection === "asc" && "text-zinc-800"
                    )}
                  />
                  <ChevronDown
                    size={8}
                    className={cn(
                      " text-zinc-500",
                      currentDirection === "desc" && "text-zinc-800"
                    )}
                  />
                </div>
              </Button>
            ) : (
              <div
                className={cn(
                  "px-2 py-1 h-full flex items-center",
                  classNames?.cell
                )}
                {...(!column.isDraggable ? dndListeners : {})}
              >
                {column.icon ? <div className="mr-2">{column.icon}</div> : null}
                {column.header}
              </div>
            )}
          </div>
        </div>

        {/* Right side: Actions Menu + Resize Handle */}
        <div className="flex items-center flex-shrink-0 ml-1 space-x-1">
          {/* Actions Dropdown Menu */}
          {(column.isEditable || column.isDeletable) &&
            (onColumnChange || onColumnDelete) && (
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
                  <DropdownMenuItem
                    onSelect={() =>
                      setPinnedColumns({
                        ...pinnedColumns,
                        [column.id]: !pinnedColumns[column.id],
                      })
                    }
                  >
                    {pinnedColumns[column.id] ? "Unpin" : "Pin"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

          {/* Resize Handle (conditionally rendered outside dropdown) */}
          {column.isResizable && (
            <div
              onMouseDown={handleMouseDown}
              className={cn(
                `absolute top-0 bottom-0 -right-1 w-0.5 cursor-col-resize group-hover:bg-zinc-500 select-none touch-none z-10`,
                classNames?.resizeHandle
              )}
              aria-label="Resize column"
            />
          )}
        </div>
      </div>
    </TableHead>
  );
}
// --- End DraggableTableHeader ---
