"use client"; // Required for useState and event handlers

import * as React from "react";
import { DataGrid } from "@/components/data-grid"; // Reverted to alias path
import type { ColumnConfig, CellValue } from "@/app/types/column"; // Reverted to alias path
import { format, isValid } from "date-fns"; // Import format for cell display
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
// Define the structure of our sample data
interface SampleRow {
  id: number; // Keep id as non-nullable number
  firstName: string;
  lastName: string;
  age: number | null; // Allow age to be null
  isActive: boolean; // Add boolean field
  birthDate: Date | null; // Add date field
  department: string | null; // Add select field
  skills: string[] | null; // Add multi-select field
  isFeatured: boolean; // Add toggle field
  agreedToTerms: boolean; // Add checkbox field
  satisfaction: number | null; // Add rating field (e.g., 1-5)
  [key: string]: CellValue;
}

const departmentOptions = ["Engineering", "Sales", "Marketing", "HR"];
const skillOptions = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "CSS",
  "HTML",
  "SQL",
  "Docker",
];

// Sample data for the grid (ensure initial ages are numbers or null)
const initialRows: SampleRow[] = [
  {
    id: 1,
    firstName: "Jane",
    lastName: "Doe",
    age: 28,
    isActive: true,
    birthDate: new Date(1996, 5, 10),
    department: "Engineering",
    skills: ["JavaScript", "React", "CSS"],
    isFeatured: false,
    agreedToTerms: true,
    satisfaction: 5,
  }, // Month is 0-indexed
  {
    id: 2,
    firstName: "John",
    lastName: "Smith",
    age: 35,
    isActive: false,
    birthDate: new Date(1989, 2, 21),
    department: "Sales",
    skills: ["SQL"],
    isFeatured: true,
    agreedToTerms: false,
    satisfaction: 3,
  },
  {
    id: 3,
    firstName: "Peter",
    lastName: "Jones",
    age: null,
    isActive: true,
    birthDate: null,
    department: null,
    skills: null,
    isFeatured: false,
    agreedToTerms: true,
    satisfaction: null,
  }, // Example with null date and select
  {
    id: 4,
    firstName: "Alice",
    lastName: "Williams",
    age: 41,
    isActive: true,
    birthDate: new Date(1983, 8, 5),
    department: "Marketing",
    skills: ["CSS", "HTML"],
    isFeatured: true,
    agreedToTerms: true,
    satisfaction: 4,
  },
  {
    id: 5,
    firstName: "Bob",
    lastName: "Brown",
    age: 22,
    isActive: false,
    birthDate: new Date(2002, 1, 15),
    department: "Engineering",
    skills: ["JavaScript", "Node.js", "Docker"],
    isFeatured: false,
    agreedToTerms: false,
    satisfaction: 5,
  },
  {
    id: 6,
    firstName: "Charlie",
    lastName: "Davis",
    age: 30,
    isActive: true,
    birthDate: new Date(1994, 11, 30),
    department: "HR",
    skills: [],
    isFeatured: false,
    agreedToTerms: true,
    satisfaction: 2,
  },
  {
    id: 7,
    firstName: "Diana",
    lastName: "Miller",
    age: 56,
    isActive: true,
    birthDate: new Date(1968, 6, 2),
    department: "Sales",
    skills: ["SQL", "React"],
    isFeatured: true,
    agreedToTerms: true,
    satisfaction: 4,
  },
  {
    id: 8,
    firstName: "Ethan",
    lastName: "Garcia",
    age: 29,
    isActive: false,
    birthDate: new Date(1995, 3, 12),
    department: "Marketing",
    skills: ["SQL", "HTML", "Node.js"],
    isFeatured: false,
    agreedToTerms: true,
    satisfaction: 3,
  },
  {
    id: 9,
    firstName: "Olivia",
    lastName: "Rodriguez",
    age: 38,
    isActive: true,
    birthDate: new Date(1986, 7, 25),
    department: "Engineering",
    skills: ["React", "TypeScript", "Docker"],
    isFeatured: true,
    agreedToTerms: false,
    satisfaction: 5,
  },
  {
    id: 10,
    firstName: "Noah",
    lastName: "Martinez",
    age: null,
    isActive: false,
    birthDate: null,
    department: "Sales",
    skills: null,
    isFeatured: false,
    agreedToTerms: false,
    satisfaction: null,
  },
];

// Define columns for the grid
const initialColumnsConfig: ColumnConfig<SampleRow>[] = [
  {
    id: "firstName",
    header: "First Name",
    type: "text",
    isEditable: true,
    isSortable: true,
    isDraggable: true,
    isResizable: true,
    minWidth: 200,
    cell: (row) => row.firstName,
    isDeletable: true,
  },
  {
    id: "lastName",
    header: "Last Name",
    type: "text",
    isEditable: true,
    isSortable: true,
    isDraggable: true,
    isResizable: true,
    minWidth: 200,
    cell: (row) => row.lastName,
    isDeletable: true,
  },
  {
    id: "age",
    header: "Age",
    type: "number",
    isEditable: true,
    isSortable: true,
    isResizable: true,
    minWidth: 200,
    maxWidth: 300,
    cell: (row) => (row.age !== null ? row.age : "N/A"),
    isDeletable: true,
  },
  {
    id: "isActive",
    header: "Active",
    type: "boolean",
    isEditable: true,
    isSortable: true,
    isDraggable: true,
    cell: (row) => (row.isActive ? "Yes" : "No"),
    minWidth: 100,
    isDeletable: true,
  },
  {
    id: "birthDate",
    header: "Birth Date",
    type: "date",
    isEditable: true,
    isSortable: true,
    isDraggable: true,
    cell: (row) =>
      row.birthDate && isValid(row.birthDate)
        ? format(row.birthDate, "yyyy-MM-dd")
        : "N/A",
    minWidth: 250,
    maxWidth: 400,
    isDeletable: true,
  },
  {
    id: "department",
    header: "Department",
    type: "select",
    selectOptions: departmentOptions.map((option) => ({
      label: option,
      value: option,
    })),
    isEditable: true,
    isSortable: true,
    isDraggable: true,
    cell: (row) => row.department || "N/A",
    minWidth: 250,
    maxWidth: 400,
    isDeletable: true,
  },
  {
    id: "skills",
    header: "Skills",
    type: "multi-select",
    multiSelectOptions: skillOptions.map((option) => ({
      label: option,
      value: option,
    })),
    isEditable: true,
    isSortable: true,
    isDraggable: true,
    isResizable: true,
    minWidth: 300,
    maxWidth: 600,
    cell: (row) => row.skills?.join(", ") || "N/A",
    isDeletable: true,
  },
  {
    id: "isFeatured",
    header: "Featured",
    type: "toggle",
    isEditable: true,
    isSortable: true,
    isDraggable: true,
    cell: (row) => (row.isFeatured ? "Yes" : "No"),
    minWidth: 100,
    maxWidth: 200,
    isDeletable: true,
  },
  {
    id: "agreedToTerms",
    header: "Agreed Terms",
    type: "checkbox",
    isEditable: true,
    isSortable: true,
    isDraggable: true,
    cell: (row) => (row.agreedToTerms ? "Yes" : "No"),
    minWidth: 100,
    maxWidth: 200,
    isDeletable: true,
  },
  {
    id: "satisfaction",
    header: "Satisfaction",
    type: "rating",
    isEditable: true,
    isSortable: true,
    isDraggable: true,
    isResizable: false,
    cell: (row) => (row.satisfaction ? `${row.satisfaction}/5` : "N/A"),
    minWidth: 120,
    isDeletable: true,
  },
];

export default function Home() {
  const [rows, setRows] = React.useState<SampleRow[]>(initialRows);
  const [selected, setSelected] = React.useState<Set<string | number>>(
    new Set()
  );
  const [columns, setColumns] =
    React.useState<ColumnConfig<SampleRow>[]>(initialColumnsConfig);
  const [isAddingColumn, setIsAddingColumn] = React.useState(false); // State for Add Column dialog

  const handleRowChange = (
    rowIndex: number,
    columnId: string,
    newValue: unknown
  ) => {
    console.log("Row changed:", { rowIndex, columnId, newValue });

    // Find the column definition to check the type
    const column = columns.find((col) => col.id === columnId);
    if (!column) return; // Column not found, should not happen

    setRows((prevRows) => {
      const updatedRows = [...prevRows];
      // Create a mutable copy
      const rowToUpdate = { ...updatedRows[rowIndex] };

      const key = columnId as keyof SampleRow;

      // Ensure the key exists on the object before trying to assign
      if (!(key in rowToUpdate)) {
        console.error(`Invalid key "${key}" for row update.`);
        return prevRows; // Return previous state if key is invalid
      }

      // Type-safe update based on column type
      if (column.type === "text" && typeof newValue === "string") {
        if (
          (key === "firstName" || key === "lastName") &&
          typeof newValue === "string"
        ) {
          rowToUpdate[key] = newValue;
        } else {
          console.error(
            `Type mismatch: Cannot assign text value to key "${key}".`
          );
        }
      }
      // Update number handling
      else if (column.type === "number" || column.type === "rating") {
        if (typeof newValue === "number" || newValue === null) {
          // Handle 'id' (cannot be null)
          if (key === "id") {
            if (typeof newValue === "number") {
              rowToUpdate[key] = newValue;
            } else {
              console.error("Cannot assign null to id");
            }
          }
          // Handle 'age' or 'satisfaction' (can be number or null)
          else if (key === "age" || key === "satisfaction") {
            rowToUpdate[key] = newValue;
          } else {
            console.error(
              `Type mismatch or unhandled number/rating key: Cannot assign number/null to key "${key}".`
            );
          }
        } else {
          console.error(
            `Invalid value type for number/rating column "${key}". Expected number or null.`
          );
        }
      }
      // Update boolean handling to include agreedToTerms
      else if (
        column.type === "boolean" ||
        column.type === "toggle" ||
        column.type === "checkbox"
      ) {
        if (
          typeof newValue === "boolean" &&
          (key === "isActive" ||
            key === "isFeatured" ||
            key === "agreedToTerms")
        ) {
          rowToUpdate[key] = newValue;
        } else {
          console.error(
            `Type mismatch: Cannot assign boolean to key "${key}" for type ${column.type}.`
          );
        }
      }
      // Add handling for date type
      else if (
        column.type === "date" &&
        (newValue instanceof Date || newValue === null)
      ) {
        if (key === "birthDate") {
          // Add other date keys if any
          rowToUpdate[key] = newValue;
        } else {
          console.error(
            `Type mismatch: Cannot assign Date/null to key "${key}".`
          );
        }
      }
      // Add handling for select type
      else if (
        column.type === "select" &&
        (typeof newValue === "string" || newValue === null)
      ) {
        if (key === "department") {
          // Add other select keys if any
          rowToUpdate[key] = newValue;
        } else {
          console.error(
            `Type mismatch: Cannot assign select value (string/null) to key "${key}".`
          );
        }
      }
      // Add handling for multi-select type
      else if (
        column.type === "multi-select" &&
        (Array.isArray(newValue) || newValue === null)
      ) {
        if (key === "skills") {
          // Add other multi-select keys if any
          // Ensure saved value is string array or null
          const validValues = Array.isArray(newValue)
            ? newValue.filter((v): v is string => typeof v === "string")
            : null;
          rowToUpdate[key] =
            validValues && validValues.length > 0 ? validValues : null;
        } else {
          console.error(
            `Type mismatch: Cannot assign multi-select value (string[]/null) to key "${key}".`
          );
        }
      }
      // --- Add future type handling below ---
      // else if (column.type === 'boolean' && typeof newValue === 'boolean') { ... }
      // ... etc.

      updatedRows[rowIndex] = rowToUpdate;
      return updatedRows;
    });
  };

  // --- Add Row Logic ---
  const handleAddRow = () => {
    const newRowId = Date.now(); // Using timestamp as a simple ID for demo
    const newRow: SampleRow = {
      id: newRowId,
      firstName: "",
      lastName: "",
      age: null,
      isActive: false,
      birthDate: null,
      department: null,
      skills: null,
      isFeatured: false,
      agreedToTerms: false,
      satisfaction: null,
    };
    // Ensure all dynamic column keys exist
    columns.forEach((col) => {
      if (!(col.id in newRow)) {
        // Assign default based on type if possible, else null
        switch (col.type) {
          case "number":
          case "rating":
            newRow[col.id] = null;
            break;
          case "boolean":
          case "checkbox":
          case "toggle":
            newRow[col.id] = false;
            break;
          case "date":
            newRow[col.id] = null;
            break;
          case "select":
            newRow[col.id] = null;
            break;
          case "multi-select":
            newRow[col.id] = null;
            break;
          case "text":
          default:
            newRow[col.id] = "";
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
  const handleColumnChange = (updatedColumn: ColumnConfig<SampleRow>) => {
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
        delete newRow[columnIdToDelete];
        return newRow;
      })
    );
  };
  // --- End Handler for Deleting Columns ---

  // --- Handler for Saving New Columns ---
  const handleSaveNewColumn = (newColumnConfig: ColumnConfig<SampleRow>) => {
    console.log("Adding new column:", newColumnConfig);
    // Basic validation: Ensure header is unique (IDs are UUIDs from form, less likely to clash)
    if (columns.some((col) => col.header === newColumnConfig.header)) {
      alert(`Column header "${newColumnConfig.header}" already exists.`);
      return; // Keep dialog open
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
            defaultValue = null; // Initialize as null, expecting string[] eventually
            break;
          case "text":
          default:
            defaultValue = "";
            break;
        }
        return { ...row, [newColumnConfig.id]: defaultValue };
      })
    );

    setIsAddingColumn(false); // Close dialog on successful save
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
            <DialogTrigger asChild>
              <Button variant="outline">Add Column</Button>
            </DialogTrigger>
            <DialogContent className="w-full">
              <DialogHeader>
                <DialogTitle>Add New Column</DialogTitle>
                <DialogDescription>
                  Add a new column to the grid.
                </DialogDescription>
              </DialogHeader>
              <EditColumnForm<SampleRow>
                onSave={handleSaveNewColumn}
                onCancel={() => setIsAddingColumn(false)}
                // No 'column' prop passed - defaults to Add mode
              />
            </DialogContent>
          </Dialog>
        </div>
        {/* --- End Buttons --- */}

        <DataGrid<SampleRow>
          rows={rows}
          columns={columns}
          onRowChange={handleRowChange}
          enableRowSelection={true}
          onSelectionChange={handleSelectionChange}
          onColumnChange={handleColumnChange}
          onColumnDelete={handleDeleteColumn} // Pass the delete handler
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
