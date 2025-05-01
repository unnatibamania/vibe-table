"use client"; // Required for useState and event handlers

import * as React from "react";
import { DataGrid } from "@/components/data-grid"; // Reverted to alias path
import type { ColumnConfig, CellValue } from "@/app/types/column"; // Reverted to alias path
import { Button } from "@/components/ui/button"; // Import Button
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"; // Import Dialog components
import { EditColumnForm } from "@/components/edit-column-form"; // Import the new form
import { cn } from "@/lib/utils";

import { hrColumns, hrData, HRRow } from "@/constants/hr";
// Define the structure of our sample data

export default function Home() {
  const [rows, setRows] = React.useState<HRRow[]>(hrData);
  const [selected, setSelected] = React.useState<Set<string | number>>(
    new Set()
  );
  const [columns, setColumns] =
    React.useState<ColumnConfig<HRRow>[]>(hrColumns);

  const [isAddingColumn, setIsAddingColumn] = React.useState(false); // State for Add Column dialog

  const handleRowChange = (
    rowIndex: number,
    columnId: string,
    newValue: unknown
  ) => {
    console.log("Row changed:", { rowIndex, columnId, newValue });

    const column = columns.find((col) => col.id === columnId);
    if (!column) return;

    setRows((prevRows) => {
      const updatedRows = [...prevRows];
      const rowToUpdate = { ...updatedRows[rowIndex] };
      const key = columnId as keyof HRRow;

      if (!(key in rowToUpdate)) {
        console.error(`Invalid key "${key}" for row update.`);
        return prevRows;
      }

      // Type-safe update based on column type and HRRow keys
      if (column.type === "text" || key === "phone") {
        // Treat phone as text for updates
        if (
          (key === "firstName" ||
            key === "lastName" ||
            key === "phone" ||
            key === "image") &&
          typeof newValue === "string"
        ) {
          rowToUpdate[key] = newValue;
        } else {
          console.error(
            `Type mismatch: Cannot assign text value to key "${key}".`
          );
        }
      } else if (column.type === "number") {
        if (typeof newValue === "number" || newValue === null) {
          if (key === "id" && typeof newValue === "number") {
            // ID cannot be null
            rowToUpdate[key] = newValue;
          } else if (key === "age") {
            // Age can be number or null
            rowToUpdate[key] = newValue;
          } else {
            console.error(
              `Type mismatch or unhandled number key: Cannot assign number/null to key "${key}".`
            );
          }
        } else {
          console.error(
            `Invalid value type for number column "${key}". Expected number or null.`
          );
        }
      }
      // Handle rating type
      else if (column.type === "rating") {
        if (
          key === "test_rating" &&
          (typeof newValue === "number" || newValue === null)
        ) {
          rowToUpdate[key] = newValue;
        } else {
          console.error(
            `Type mismatch or unhandled rating key: Cannot assign number/null to key "${key}".`
          );
        }
      } else if (
        column.type === "boolean" ||
        column.type === "toggle" ||
        column.type === "checkbox"
      ) {
        // Only handle 'readyToHire' which is part of HRRow
        if (key === "readyToHire" && typeof newValue === "boolean") {
          rowToUpdate[key] = newValue;
        } else {
          console.error(
            `Type mismatch: Cannot assign boolean to key "${key}" (Expected 'readyToHire').`
          );
        }
      } else if (
        column.type === "date" &&
        (newValue instanceof Date || newValue === null)
      ) {
        // Only handle 'birthDate' which is part of HRRow
        if (key === "birthDate") {
          rowToUpdate[key] = newValue;
        } else {
          console.error(
            `Type mismatch: Cannot assign Date/null to key "${key}" (Expected 'birthDate').`
          );
        }
      } else if (
        column.type === "select" &&
        (typeof newValue === "string" || newValue === null)
      ) {
        // Only handle 'department' which is part of HRRow
        if (key === "department") {
          rowToUpdate[key] = newValue;
        } else {
          console.error(
            `Type mismatch: Cannot assign select value (string/null) to key "${key}" (Expected 'department').`
          );
        }
      } else if (
        column.type === "multi-select" &&
        (Array.isArray(newValue) || newValue === null)
      ) {
        // Only handle 'skills' which is part of HRRow
        if (key === "skills") {
          const validValues = Array.isArray(newValue)
            ? newValue.filter((v): v is string => typeof v === "string")
            : null;
          rowToUpdate[key] =
            validValues && validValues.length > 0 ? validValues : null;
        } else {
          console.error(
            `Type mismatch: Cannot assign multi-select value (string[]/null) to key "${key}" (Expected 'skills').`
          );
        }
      }
      // Handle custom cell type if needed, although updates might not be typical here
      else if (column.type === "custom") {
        // Custom types might not have direct updates handled this way
        // For the 'firstName' custom column, the update is handled by the 'text' check above if columnId matches.
        console.log(
          `Update logic for custom column type "${key}" may need specific handling.`
        );
      }

      updatedRows[rowIndex] = rowToUpdate;
      return updatedRows;
    });
  };

  // --- Add Row Logic ---
  const handleAddRow = () => {
    const newRowId = Date.now();
    // Create new row based on HRRow interface
    const newRow: HRRow = {
      id: newRowId,
      firstName: "",
      lastName: "", // Assuming lastName might be added later or is needed
      image: "", // Default image path or empty string
      phone: "", // Default phone
      age: null,
      birthDate: null,
      department: null,
      skills: null,
      test_rating: null,
      readyToHire: false, // Default boolean value
    };

    // Ensure dynamic column keys exist (though less likely with static columns)
    columns.forEach((col) => {
      if (!(col.id in newRow)) {
        // Assign default based on type if the key wasn't in the initial HRRow definition
        const key = col.id as keyof HRRow;
        switch (col.type) {
          case "number":
          case "rating":
            newRow[key] = null;
            break;
          case "boolean":
          case "checkbox":
          case "toggle":
            newRow[key] = false;
            break;
          case "date":
            newRow[key] = null;
            break;
          case "select":
            newRow[key] = null;
            break;
          case "multi-select":
            newRow[key] = null;
            break;
          case "text":
          case "custom": // Add custom type here
          default:
            newRow[key] = ""; // Default text/custom to empty string
            break;
        }
      }
    });

    setRows((prevRows) => [...prevRows, newRow]);
  };
  // --- End Add Row Logic ---

  // Handler for selection changes
  const handleSelectionChange = (selectedIds: Set<string | number>) => {
    console.log("Selected Row IDs:", selectedIds);
    setSelected(selectedIds);
  };

  // --- Handler for Column Changes ---
  const handleColumnChange = (updatedColumn: ColumnConfig<HRRow>) => {
    console.log("Column changed:", updatedColumn);
    setColumns((currentColumns) =>
      currentColumns.map((col) =>
        col.id === updatedColumn.id ? updatedColumn : col
      )
    );
  };

  // --- Handler for Deleting Columns ---
  const handleDeleteColumn = (columnIdToDelete: string) => {
    console.log("Deleting column:", columnIdToDelete);
    setColumns((prevColumns) =>
      prevColumns.filter((col) => col.id !== columnIdToDelete)
    );
    // Also remove the corresponding data from all rows
    setRows((prevRows) =>
      prevRows.map((row) => {
        const newRow = { ...row };
        // Use keyof HRRow for type safety, though deleting arbitrary keys is tricky
        const key = columnIdToDelete as keyof HRRow;
        if (key in newRow) {
          delete newRow[key];
        }
        return newRow;
      })
    );
  };
  // --- End Handler for Deleting Columns ---

  // --- Handler for Saving New Columns ---
  const handleSaveNewColumn = (newColumnConfig: ColumnConfig<HRRow>) => {
    console.log("Adding new column:", newColumnConfig);
    if (columns.some((col) => col.header === newColumnConfig.header)) {
      alert(`Column header "${newColumnConfig.header}" already exists.`);
      return;
    }

    setColumns((prevColumns) => [...prevColumns, newColumnConfig]);

    // Add default value for the new column to all existing rows
    setRows((prevRows) =>
      prevRows.map((row) => {
        let defaultValue: CellValue;
        switch (newColumnConfig.type) {
          case "number":
          case "rating":
            defaultValue = null;
            break;
          case "boolean":
          case "checkbox":
          case "toggle":
            defaultValue = false;
            break;
          case "date":
            defaultValue = null;
            break;
          case "select":
            defaultValue = null;
            break;
          case "multi-select":
            defaultValue = null;
            break;
          case "text":
          case "custom": // Add custom type
          default:
            defaultValue = "";
            break;
        }
        // Use keyof HRRow for type safety when adding new key
        const key = newColumnConfig.id as keyof HRRow;
        return { ...row, [key]: defaultValue };
      })
    );

    setIsAddingColumn(false);
  };
  // --- End Handler for Saving New Columns ---

  return (
    <div className="z-20 relative w-screen  h-screen ">
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
          "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]"
        )}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>

      <section className="z-20 mt-40 relative px-8">
        <div className="flex justify-center flex-col items-center">
          <h1 className="text-4xl font-bold mb-4">
            Tabloo: A data grid for the web
          </h1>
          <p className="mb-2 text-lg text-muted-foreground">
            Coming soon to npm registry.
          </p>
        </div>

        {/* --- Add Row/Column Buttons --- */}
        <div className="flex space-x-2 w-full justify-end mb-4">
          {/* Add Column Dialog Trigger and Content */}
          <Dialog open={isAddingColumn} onOpenChange={setIsAddingColumn}>
            <DialogTrigger>
              <Button variant="outline">Add Column</Button>
            </DialogTrigger>
            <DialogContent className="w-full">
              <DialogHeader>
                <DialogTitle>Add New Column</DialogTitle>
                <DialogDescription>
                  Add a new column to the grid.
                </DialogDescription>
              </DialogHeader>
              <EditColumnForm<HRRow>
                onSave={handleSaveNewColumn}
                onCancel={() => setIsAddingColumn(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
        {/* --- End Buttons --- */}

        <DataGrid<HRRow>
          rows={rows}
          columns={columns}
          onRowChange={handleRowChange}
          enableRowSelection={true}
          onSelectionChange={handleSelectionChange}
          onColumnChange={handleColumnChange}
          onColumnDelete={handleDeleteColumn}
          classNames={{}}
        />

        <div className="flex items-center gap-3 justify-start mt-4">
          <Button onClick={handleAddRow}>Add Row</Button>
          <p className="text-sm  text-muted-foreground">
            {selected.size} row(s) selected.
          </p>
        </div>
      </section>
    </div>
  );
}
