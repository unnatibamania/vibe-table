"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Reverted path, assuming alias is correct
import type { ColumnConfig, CellValue, ColumnType } from "@/app/types/column"; // Import CellValue and ColumnType
import { TextCell } from "@/components/cells/text-cell"; // Corrected import path
import { NumberCell } from "@/components/cells/number-cell"; // Added NumberCell
import { BooleanCell } from "@/components/cells/boolean-cell"; // Import BooleanCell
import { DateCell } from "@/components/cells/date-cell"; // Import DateCell
import { SelectCell } from "@/components/cells/select-cell"; // Import SelectCell
import { MultiSelectCell } from "@/components/cells/multi-select-cell"; // Import MultiSelectCell
import { ToggleCell } from "@/components/cells/toggle-cell"; // Import ToggleCell
import { RatingCell } from "@/components/cells/rating-cell"; // Import RatingCell
import { Button } from "@/components/ui/button"; // Import Button
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  GripVertical,
  MoreVertical,
} from "lucide-react"; // Import all needed sort icons
// --- dnd-kit imports ---
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  MeasuringStrategy,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox
import { cn } from "@/lib/utils"; // Need cn for merging classes
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// --- Class Name Definitions ---
interface DataGridClassNames {
  root?: string;
  table?: string;
  header?: {
    wrapper?: string;
    row?: string;
    cell?: string;
    dragHandle?: string;
    resizeHandle?: string;
  };
  body?: {
    wrapper?: string;
    row?: string;
    selectedRow?: string;
    cell?: string;
  };
  components?: {
    badge?: string;
    checkbox?: string;
    ratingStar?: string;
    toggleSwitch?: string;
    dateTrigger?: string;
    calendar?: string;
    selectTrigger?: string;
    selectContent?: string;
    selectItem?: string;
    multiSelectTrigger?: string;
    multiSelectContent?: string;
    multiSelectCommand?: string;
    multiSelectInput?: string;
    multiSelectItem?: string;
  };
}
// --- End Class Name Definitions ---

// Define the props for the DataGrid component
interface DataGridProps<
  T extends {
    id: string | number;
    [key: string]: CellValue;
  }
> {
  rows: T[];
  columns: ColumnConfig<T>[];
  onRowChange: (rowIndex: number, columnId: string, newValue: unknown) => void;
  enableRowSelection?: boolean; // Prop to enable/disable row selection
  onSelectionChange?: (selectedIds: Set<string | number>) => void; // Callback for selection changes
  classNames?: DataGridClassNames; // Add classNames prop
  onColumnChange?: (updatedColumn: ColumnConfig<T>) => void; // Add prop definition
  onColumnDelete?: (columnId: string) => void; // <-- Add onColumnDelete prop
}

// Define Sort Direction type
type SortDirection = "asc" | "desc";

// --- Edit Column Form Component ---
const EditColumnForm = <T,>({
  column,
  onSave,
}: {
  column: ColumnConfig<T>;
  onSave: (config: ColumnConfig<T>) => void;
}) => {
  // Store individual fields in state
  const [headerText, setHeaderText] = React.useState(
    typeof column.header === "string" ? column.header : column.id
  );
  const [selectedType, setSelectedType] = React.useState<ColumnType>(
    column.type
  );
  const [isEditable, setIsEditable] = React.useState(!!column.isEditable);
  const [isSortable, setIsSortable] = React.useState(!!column.isSortable);
  const [isResizable, setIsResizable] = React.useState(!!column.isResizable);
  const [isDraggable, setIsDraggable] = React.useState(!!column.isDraggable);
  const [isDeletable, setIsDeletable] = React.useState(!!column.isDeletable);
  const [isHidden, setIsHidden] = React.useState(!!column.isHidden);

  const availableTypes: Exclude<ColumnType, "user">[] = [
    "text",
    "number",
    "date",
    "boolean",
    "select",
    "multi-select",
    "rating",
    "toggle",
    "checkbox",
  ];

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Construct config and assert its type
    const updatedConfig = {
      ...column,
      header: headerText,
      type: selectedType,
      isEditable,
      isSortable,
      isResizable,
      isDraggable,
      isDeletable,
      isHidden,
      selectOptions:
        selectedType === "select" ? column.selectOptions || [] : undefined,
      multiSelectOptions:
        selectedType === "multi-select"
          ? column.multiSelectOptions || []
          : undefined,
    } as ColumnConfig<T>; // Assert the final constructed object's type
    onSave(updatedConfig);
  };

  const renderToggle = (
    label: string,
    checked: boolean,
    onCheckedChange: (checked: boolean) => void
  ) => (
    <div className="flex items-center space-x-2 mb-2">
      <Switch
        id={`${column.id}-${label.toLowerCase().replace(" ", "-")}`}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <Label htmlFor={`${column.id}-${label.toLowerCase().replace(" ", "-")}`}>
        {label}
      </Label>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 w-64">
      {/* Column Header (Name) Input */}
      <div>
        <Label htmlFor={`${column.id}-header`}>Header Text</Label>
        <Input
          id={`${column.id}-header`}
          value={headerText}
          onChange={(e) => setHeaderText(e.target.value)}
          placeholder="Column Name"
        />
      </div>

      {/* Column Type Select */}
      <div>
        <Label htmlFor={`${column.id}-type`}>Column Type</Label>
        <Select
          value={selectedType}
          onValueChange={(value) => setSelectedType(value as ColumnType)}
        >
          <SelectTrigger id={`${column.id}-type`}>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {availableTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Boolean Toggles */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2">
        {renderToggle("Cell Editable", isEditable, setIsEditable)}
        {renderToggle("Sortable", isSortable, setIsSortable)}
        {renderToggle("Resizable", isResizable, setIsResizable)}
        {renderToggle("Draggable", isDraggable, setIsDraggable)}
        {renderToggle("Deletable", isDeletable, setIsDeletable)}
        {renderToggle("Hidden", isHidden, setIsHidden)}
      </div>

      {/* TODO: Add inputs for minWidth, maxWidth, options based on type */}

      <Button type="submit" size="sm">
        Save Changes
      </Button>
    </form>
  );
};
// --- End Edit Column Form Component ---

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
}

function DraggableTableHeader<T>({
  column,
  isSortable,
  currentDirection,
  handleSort,
  onResizeStart,
  width,
  classNames,
  onColumnChange,
  onColumnDelete, // <-- Destructure prop
}: DraggableTableHeaderProps<T>) {
  // Removed <T>
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
      className={cn("group relative", classNames?.cell)}
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
                {/* Header Content */}
                <span className="truncate">{column.header}</span>
                {/* Sort Icon */}
                <span className="ml-auto h-4 w-4 flex-shrink-0">
                  {currentDirection === "asc" && (
                    <ChevronUp className="h-4 w-4 text-foreground" />
                  )}
                  {currentDirection === "desc" && (
                    <ChevronDown className="h-4 w-4 text-foreground" />
                  )}
                  {currentDirection === null && (
                    <ChevronsUpDown className="h-4 w-4 text-muted-foreground/50" />
                  )}
                </span>
              </Button>
            ) : (
              <div
                className={cn(
                  "px-2 py-1 h-full flex items-center",
                  classNames?.cell
                )}
                {...(!column.isDraggable ? dndListeners : {})}
              >
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

// The main DataGrid component
export function DataGrid<
  T extends {
    id: string | number;
    [key: string]: CellValue;
  }
>({
  rows,
  columns: initialColumns,
  onRowChange,
  enableRowSelection = false, // Default to false
  onSelectionChange,
  classNames,
  onColumnChange,
  onColumnDelete, // <-- Destructure prop
}: DataGridProps<T>) {
  // --- Sorting State ---
  const [sortColumnId, setSortColumnId] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] =
    React.useState<SortDirection | null>(null);

  // --- Column Order State ---
  const [columnOrder, setColumnOrder] = React.useState<string[]>(() =>
    initialColumns.map((col) => col.id)
  );

  // Add a useEffect to sync columnOrder if initialColumns change externally
  // This is crucial if columns can be added/deleted from the parent
  React.useEffect(() => {
    const currentColumnIds = new Set(initialColumns.map((col) => col.id));
    // Filter out IDs that no longer exist in initialColumns
    // Add new IDs from initialColumns that weren't in columnOrder
    setColumnOrder((prevOrder) => {
      const newOrder = prevOrder.filter((id) => currentColumnIds.has(id));
      initialColumns.forEach((col) => {
        if (!newOrder.includes(col.id)) {
          // Simple approach: add new columns to the end.
          // More complex logic could try to insert them based on initial position.
          newOrder.push(col.id);
        }
      });
      // Prevent unnecessary state updates if the order hasn't actually changed
      if (JSON.stringify(newOrder) !== JSON.stringify(prevOrder)) {
        return newOrder;
      }
      return prevOrder;
    });
  }, [initialColumns]);

  // --- Active Dragged Header State ---
  const [activeId, setActiveId] = React.useState<string | null>(null);

  // --- Row Selection State ---
  const [selectedRowIds, setSelectedRowIds] = React.useState<
    Set<string | number>
  >(new Set());

  // --- Notify parent on selection change ---
  React.useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedRowIds);
    }
    // Intentionally only run when selectedRowIds changes, not onSelectionChange identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRowIds]);

  // Memoize columns based on order
  const columns = React.useMemo(() => {
    const columnMap = initialColumns.reduce((acc, col) => {
      acc[col.id] = col;
      return acc;
    }, {} as Record<string, ColumnConfig<T>>);
    return columnOrder.map((id) => columnMap[id]).filter(Boolean); // Filter out potentially missing IDs
  }, [initialColumns, columnOrder]);

  // Function to handle saving cell changes
  const handleSave = (
    rowIndex: number,
    columnId: string,
    newValue: unknown
  ) => {
    onRowChange(rowIndex, columnId, newValue);
    // Here you might also want to update local state if managing rows internally,
    // or rely on the parent component to pass updated rows.
  };

  // --- Sorting Logic ---
  const sortedRows = React.useMemo(() => {
    if (!sortColumnId || !sortDirection) {
      return rows; // No sort applied
    }

    // Find the column definition for type checking (optional but good practice)
    const sortColumn = columns.find((col) => col.id === sortColumnId);
    if (!sortColumn) {
      return rows; // Should not happen if sortColumnId is valid
    }

    const sorted = [...rows].sort((a, b) => {
      const valueA = a[sortColumnId];
      const valueB = b[sortColumnId];

      // Handle null/undefined comparisons
      if (valueA == null && valueB == null) return 0;
      if (valueA == null) return sortDirection === "asc" ? -1 : 1; // nulls first in asc
      if (valueB == null) return sortDirection === "asc" ? 1 : -1; // nulls first in asc

      // Type-specific comparisons
      if (typeof valueA === "string" && typeof valueB === "string") {
        return (
          valueA.localeCompare(valueB) * (sortDirection === "asc" ? 1 : -1)
        );
      }
      if (typeof valueA === "number" && typeof valueB === "number") {
        return (valueA - valueB) * (sortDirection === "asc" ? 1 : -1);
      }
      if (typeof valueA === "boolean" && typeof valueB === "boolean") {
        // false comes before true
        return (
          (Number(valueA) - Number(valueB)) * (sortDirection === "asc" ? 1 : -1)
        );
      }
      if (valueA instanceof Date && valueB instanceof Date) {
        return (
          (valueA.getTime() - valueB.getTime()) *
          (sortDirection === "asc" ? 1 : -1)
        );
      }

      // Add comparisons for other types (like arrays for multi-select) if needed
      // For multi-select, you might sort by array length or first element, etc.
      if (Array.isArray(valueA) && Array.isArray(valueB)) {
        // Example: sort by number of items
        // return (valueA.length - valueB.length) * (sortDirection === 'asc' ? 1 : -1);
        // Example: sort by first item alphabetically (if strings)
        const firstA = valueA[0];
        const firstB = valueB[0];
        if (typeof firstA === "string" && typeof firstB === "string") {
          return (
            firstA.localeCompare(firstB) * (sortDirection === "asc" ? 1 : -1)
          );
        }
        return 0; // Fallback for arrays if no specific logic
      }

      // Fallback if types are mixed or unhandled
      console.warn(`Unhandled sort comparison between:`, valueA, valueB);
      return 0;
    });

    return sorted;
  }, [rows, sortColumnId, sortDirection, columns]); // Add columns to dependency array

  // --- Handle Header Click for Sorting ---
  const handleSort = (columnId: string) => {
    if (sortColumnId === columnId) {
      // Cycle direction: asc -> desc -> null
      setSortDirection((current) =>
        current === "asc" ? "desc" : current === "desc" ? null : "asc"
      );
      if (sortDirection === "desc") {
        // If cycling from desc to null
        setSortColumnId(null);
      }
    } else {
      // New column to sort
      setSortColumnId(columnId);
      setSortDirection("asc");
    }
  };

  // --- dnd-kit Sensors ---
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require the mouse to move by 10 pixels before starting a drag
      // Helps prevent sorting click activating drag accidentally
      activationConstraint: {
        distance: 10,
      },
    })
  );

  // --- dnd-kit Drag Handlers ---
  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null); // Reset active ID

    if (over && active.id !== over.id) {
      setColumnOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Get the currently dragged column for the overlay
  const activeColumn = React.useMemo(() => {
    return initialColumns.find((col) => col.id === activeId);
  }, [activeId, initialColumns]);

  // --- Row Selection Logic ---
  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      const allIds = new Set(rows.map((row) => row.id));
      setSelectedRowIds(allIds);
    } else {
      setSelectedRowIds(new Set());
    }
  };

  const handleSelectRow = (
    rowId: string | number,
    checked: boolean | "indeterminate"
  ) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (checked === true) {
        next.add(rowId);
      } else {
        next.delete(rowId);
      }
      return next;
    });
  };

  const numRows = rows.length;
  const numSelected = selectedRowIds.size;
  const isAllSelected = numRows > 0 && numSelected === numRows;
  const isIndeterminate = numSelected > 0 && numSelected < numRows;
  const headerCheckboxState = isAllSelected
    ? true
    : isIndeterminate
    ? "indeterminate"
    : false;
  // --- End Row Selection Logic ---

  // --- Column Width State ---
  const [columnWidths, setColumnWidths] = React.useState<
    Record<string, number>
  >({});
  const [resizingColumn, setResizingColumn] = React.useState<{
    id: string;
    startX: number;
    startWidth: number;
  } | null>(null);
  const tableRef = React.useRef<HTMLTableElement>(null);

  // --- Resize Handlers ---
  const handleResizeStart = React.useCallback(
    (columnId: string, startX: number) => {
      console.log("[ResizeStart]", { columnId, startX });
      const initialCol = initialColumns.find((c) => c.id === columnId);
      // Get width from state, fallback to minWidth or default
      const startWidth = columnWidths[columnId] || initialCol?.minWidth || 150;
      console.log("[ResizeStart] Setting state:", {
        id: columnId,
        startX,
        startWidth,
      });
      setResizingColumn({ id: columnId, startX, startWidth: startWidth });
    },
    [columnWidths, initialColumns]
  );

  const handleMouseMove = React.useCallback(
    (event: MouseEvent) => {
      if (!resizingColumn || !tableRef.current) return;
      console.log("[ResizeMove] Event ClientX:", event.clientX);

      const dx = event.clientX - resizingColumn.startX;
      let newWidth = resizingColumn.startWidth + dx;
      console.log("[ResizeMove] dx:", dx, "Raw newWidth:", newWidth);

      // Apply constraints (min/max width from column config)
      const columnConfig = initialColumns.find(
        (c) => c.id === resizingColumn.id
      );
      if (columnConfig?.minWidth) {
        newWidth = Math.max(newWidth, columnConfig.minWidth);
      }
      if (columnConfig?.maxWidth) {
        newWidth = Math.min(newWidth, columnConfig.maxWidth);
      }
      console.log("[ResizeMove] Constrained newWidth:", newWidth);

      setColumnWidths((prev) => ({ ...prev, [resizingColumn.id]: newWidth }));
    },
    [resizingColumn, initialColumns]
  );

  const handleMouseUp = React.useCallback(() => {
    if (!resizingColumn) return;
    console.log("[ResizeEnd] Resizing finished for:", resizingColumn.id);
    // Optional: Could trigger a callback here (onColumnResize)
    setResizingColumn(null);
  }, [resizingColumn]);

  // Add/Remove global listeners for mouse move/up during resize
  React.useEffect(() => {
    if (!resizingColumn) return;

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizingColumn, handleMouseMove, handleMouseUp]);

  // Type assertion needed when passing handler down
  const typedOnColumnChange = onColumnChange as (
    updatedColumn: ColumnConfig<T>
  ) => void | undefined;

  // --- Column Deletion Handler ---
  const handleColumnDelete = (columnId: string) => {
    if (onColumnDelete) {
      // Call the parent handler
      onColumnDelete(columnId);
      // Optionally, immediately remove from local columnOrder state
      // This provides faster visual feedback, but the parent is the source of truth
      // setColumnOrder(prev => prev.filter(id => id !== columnId));
      // ^^ Commented out: Let parent update initialColumns which triggers useEffect
    }
  };
  // --- End Column Deletion Handler ---

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }} // Helps with table layout measurement
    >
      <div
        className={cn("rounded-md border overflow-x-auto", classNames?.root)}
      >
        <Table
          ref={tableRef}
          className={cn("w-full border-collapse", classNames?.table)}
        >
          <TableHeader className={cn(classNames?.header?.wrapper)}>
            <SortableContext
              items={columnOrder}
              strategy={horizontalListSortingStrategy}
            >
              <TableRow
                className={cn(
                  "bg-muted hover:bg-muted/80",
                  classNames?.header?.row
                )}
              >
                {/* Selection Header */}
                {enableRowSelection && (
                  <TableHead
                    style={{ width: "50px", minWidth: "50px" }}
                    className={cn("relative p-0", classNames?.header?.cell)}
                  >
                    <div className="flex items-center justify-center h-full">
                      <Checkbox
                        checked={headerCheckboxState}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all rows"
                        className={cn(classNames?.components?.checkbox)}
                      />
                    </div>
                  </TableHead>
                )}

                {/* Draggable & Resizable Column Headers */}
                {columns.map((column) => {
                  const isSortable = !!column.isSortable;
                  const isCurrentSortColumn = sortColumnId === column.id;
                  const currentDirection = isCurrentSortColumn
                    ? sortDirection
                    : null;

                  // Use DraggableTableHeader component here
                  // We need to pass down props and the actual TH rendering logic
                  return (
                    <DraggableTableHeader
                      key={column.id}
                      column={column as ColumnConfig<T>}
                      isSortable={isSortable}
                      currentDirection={currentDirection}
                      handleSort={handleSort}
                      onResizeStart={handleResizeStart}
                      width={columnWidths[column.id]}
                      classNames={classNames?.header}
                      onColumnChange={typedOnColumnChange}
                      onColumnDelete={handleColumnDelete} // <-- Pass handler
                    />
                  );
                })}
              </TableRow>
            </SortableContext>
          </TableHeader>
          <TableBody className={cn(classNames?.body?.wrapper)}>
            {sortedRows.map((row, rowIndex) => {
              const isSelected = selectedRowIds.has(row.id);
              return (
                // Add visual indication for selected rows
                <TableRow
                  key={row.id}
                  data-state={isSelected ? "selected" : ""}
                  className={cn(
                    "h-10 py-2",
                    classNames?.body?.row,
                    isSelected && classNames?.body?.selectedRow
                  )}
                >
                  {/* Selection Cell */}
                  {enableRowSelection && (
                    <TableCell className={cn("p-0", classNames?.body?.cell)}>
                      <div className="flex items-center justify-center h-full">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleSelectRow(row.id, checked)
                          }
                          aria-label={`Select row ${rowIndex + 1}`}
                          className={cn(classNames?.components?.checkbox)}
                        />
                      </div>
                    </TableCell>
                  )}

                  {columns.map((column) => {
                    const initialValue = row[column.id];
                    const cellStyle: React.CSSProperties = {
                      width: columnWidths[column.id]
                        ? `${columnWidths[column.id]}px`
                        : undefined,
                      minWidth: column.minWidth
                        ? `${column.minWidth}px`
                        : undefined,
                      maxWidth: column.maxWidth
                        ? `${column.maxWidth}px`
                        : undefined,
                    };
                    return (
                      <TableCell
                        key={column.id}
                        style={cellStyle}
                        className={cn(
                          "overflow-hidden whitespace-nowrap text-ellipsis align-middle",
                          classNames?.body?.cell
                        )}
                      >
                        {column.type === "text" ? (
                          <TextCell
                            initialValue={String(initialValue ?? "")}
                            onSave={(newValue: string) =>
                              handleSave(rowIndex, column.id, newValue)
                            }
                          />
                        ) : column.type === "number" ? (
                          <NumberCell
                            initialValue={
                              typeof initialValue === "number"
                                ? initialValue
                                : null
                            }
                            onSave={(newValue: number | null) =>
                              handleSave(rowIndex, column.id, newValue)
                            }
                          />
                        ) : column.type === "boolean" ||
                          column.type === "checkbox" ? (
                          <BooleanCell
                            initialValue={
                              typeof initialValue === "boolean"
                                ? initialValue
                                : null
                            }
                            isEditable={column.isEditable}
                            onSave={(newValue: boolean) =>
                              handleSave(rowIndex, column.id, newValue)
                            }
                            classNames={classNames?.components}
                          />
                        ) : column.type === "date" ? (
                          <DateCell
                            initialValue={
                              initialValue instanceof Date ? initialValue : null
                            }
                            isEditable={column.isEditable}
                            onSave={(newValue: Date | null) =>
                              handleSave(rowIndex, column.id, newValue)
                            }
                            classNames={classNames?.components}
                          />
                        ) : column.type === "select" ? (
                          <SelectCell
                            initialValue={
                              typeof initialValue === "string"
                                ? initialValue
                                : null
                            }
                            options={column.selectOptions || []}
                            isEditable={column.isEditable}
                            onSave={(newValue: string | null) =>
                              handleSave(rowIndex, column.id, newValue)
                            }
                            classNames={classNames?.components}
                          />
                        ) : column.type === "multi-select" ? (
                          <MultiSelectCell
                            initialValues={
                              Array.isArray(initialValue)
                                ? initialValue.filter(
                                    (v): v is string => typeof v === "string"
                                  )
                                : null
                            }
                            options={column.multiSelectOptions || []}
                            isEditable={column.isEditable}
                            onSave={(newValue: string[] | null) =>
                              handleSave(rowIndex, column.id, newValue)
                            }
                            classNames={classNames?.components}
                          />
                        ) : column.type === "toggle" ? (
                          <ToggleCell
                            initialValue={
                              typeof initialValue === "boolean"
                                ? initialValue
                                : null
                            }
                            isEditable={column.isEditable}
                            onSave={(newValue: boolean) =>
                              handleSave(rowIndex, column.id, newValue)
                            }
                            classNames={classNames?.components}
                          />
                        ) : column.type === "rating" ? (
                          <RatingCell
                            initialValue={
                              typeof initialValue === "number"
                                ? initialValue
                                : null
                            }
                            isEditable={column.isEditable}
                            onSave={(newValue: number | null) =>
                              handleSave(rowIndex, column.id, newValue)
                            }
                            classNames={classNames?.components}
                          />
                        ) : (
                          // Default case: Render directly, no extra div/padding needed
                          column.cell(row)
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {/* Drag Overlay for visual feedback */}
      <DragOverlay>
        {activeId && activeColumn ? (
          // Render a representation of the header being dragged
          // Needs styling to look like a table header
          <div
            style={{
              opacity: 0.9,
              backgroundColor: "white",
              padding: "8px 12px",
              borderRadius: "4px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              minWidth: activeColumn.minWidth,
              maxWidth: activeColumn.maxWidth,
            }}
          >
            {activeColumn.header}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
