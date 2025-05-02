"use client";

import React from "react";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Reverted path, assuming alias is correct
import type {
  ColumnConfig,
  CellValue /*, ColumnType*/,
} from "@/app/types/column"; // Import CellValue // Removed ColumnType

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
  // useSortable, // Removed unused import
} from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities"; // Removed unused import
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox
import { cn } from "@/lib/utils"; // Need cn for merging classes
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"; // Removed unused imports
import { DraggableTableHeader } from "./data-grid/draggable-table-header"; // <-- Import DraggableTableHeader
import type { DataGridClassNames, SortDirection } from "./data-grid/types"; // <-- Import types
import { DataGridBody } from "./data-grid/data-grid-body"; // <-- Import DataGridBody

// Helper function for throttling with requestAnimationFrame
// Specify generic arguments for the function type T
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function throttleWithRAF<Args extends any[], Result>(
  fn: (...args: Args) => Result
): (...args: Args) => void {
  let rafId: number | null = null;
  return (...args: Args) => {
    // Use Args here
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    rafId = requestAnimationFrame(() => {
      fn(...args);
      rafId = null; // Allow next call
    });
  };
}

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
  classNames?: DataGridClassNames; // Use imported type
  onColumnChange?: (updatedColumn: ColumnConfig<T>) => void; // Add prop definition
  onColumnDelete?: (columnId: string) => void; // <-- Add onColumnDelete prop
  isLoading?: boolean; // <-- Add isLoading prop
  skeletonComponent?: React.ReactNode; // <-- Add skeletonComponent prop
}

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
  onColumnDelete, // <-- Destructure prop,
  isLoading,
  skeletonComponent,
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

  const [columnWidths, setColumnWidths] = React.useState<
    Record<string, number>
  >(() =>
    initialColumns.reduce((acc, col) => {
      acc[col.id] = col.minWidth || 100;
      return acc;
    }, {} as Record<string, number>)
  );

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

  const tableRef = React.useRef<HTMLTableElement>(null);

  // Add back resizingColumn state
  const [resizingColumn, setResizingColumn] = React.useState<{
    id: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  console.log("[ColumnWidths]", columnWidths);

  // --- Add back Resize Handlers ---
  const handleResizeStart = React.useCallback(
    (columnId: string, startX: number) => {
      // console.log("[ResizeStart]", { columnId, startX });
      const initialCol = initialColumns.find((c) => c.id === columnId);
      const startWidth = columnWidths[columnId] || initialCol?.minWidth || 150; // Use state width first
      // console.log("[ResizeStart] Setting state:", { id: columnId, startX, startWidth });
      setResizingColumn({ id: columnId, startX, startWidth: startWidth });
    },
    [columnWidths, initialColumns] // Dependencies
  );

  const latestMouseEventRef = React.useRef<MouseEvent | null>(null);

  const performResize = React.useCallback(() => {
    if (!resizingColumn || !tableRef.current || !latestMouseEventRef.current) {
      return;
    }
    const event = latestMouseEventRef.current;
    const dx = event.clientX - resizingColumn.startX;
    let newWidth = resizingColumn.startWidth + dx;

    const columnConfig = initialColumns.find((c) => c.id === resizingColumn.id);
    const minWidth = columnConfig?.minWidth ?? 50; // Ensure a minimum width
    newWidth = Math.max(newWidth, minWidth);
    if (columnConfig?.maxWidth) {
      newWidth = Math.min(newWidth, columnConfig.maxWidth);
    }

    // Use setColumnWidths here - this was the missing link!
    setColumnWidths((prev) => ({ ...prev, [resizingColumn.id]: newWidth }));
  }, [resizingColumn, initialColumns, setColumnWidths]); // Add setColumnWidths dependency

  const throttledPerformResize = React.useMemo(
    () => throttleWithRAF(performResize),
    [performResize]
  );

  const handleRawMouseMove = React.useCallback(
    (event: MouseEvent) => {
      if (!resizingColumn) return;
      latestMouseEventRef.current = event;
      throttledPerformResize();
    },
    [resizingColumn, throttledPerformResize]
  );

  const handleMouseUp = React.useCallback(() => {
    if (!resizingColumn) return;
    // console.log("[ResizeEnd]", resizingColumn.id);
    latestMouseEventRef.current = null;
    setResizingColumn(null);
  }, [resizingColumn]);

  // Add back useEffect for listeners
  React.useEffect(() => {
    if (!resizingColumn) return;

    document.addEventListener("mousemove", handleRawMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleRawMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizingColumn, handleRawMouseMove, handleMouseUp]);

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
          suppressHydrationWarning
          style={{
            tableLayout: "fixed",
          }}
          className={cn("border-collapse", classNames?.table)}
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
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      column={column as ColumnConfig<any>}
                      tableHeight={tableRef.current?.clientHeight}
                      isSortable={isSortable}
                      currentDirection={currentDirection}
                      handleSort={handleSort}
                      onResizeStart={handleResizeStart}
                      isCurrentlyResizing={resizingColumn?.id === column.id}
                      width={columnWidths[column.id]}
                      classNames={classNames?.header}
                      onColumnChange={typedOnColumnChange}
                      onColumnDelete={handleColumnDelete}
                    />
                  );
                })}
              </TableRow>
            </SortableContext>
          </TableHeader>
          <DataGridBody
            rows={sortedRows}
            columns={columns}
            selectedRowIds={selectedRowIds}
            handleSelectRow={handleSelectRow}
            handleSave={handleSave}
            columnWidths={columnWidths}
            enableRowSelection={enableRowSelection}
            classNames={classNames}
            isLoading={isLoading}
            skeletonComponent={skeletonComponent}
          />
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
