import * as React from "react";
import type { ColumnConfig, ColumnType, CellValue } from "@/app/types/column";
import { Button } from "@/components/ui/button";
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
import { v4 as uuidv4 } from "uuid"; // For generating default ID

// Define the props, making onSave mandatory, and column optional for Add mode
interface EditColumnFormProps<T> {
  column?: ColumnConfig<T>; // Optional: If not provided, assume "Add" mode
  onSave: (config: ColumnConfig<T>) => void;
  onCancel?: () => void; // Optional cancel handler
}

// Define a default empty column structure for "Add" mode
const createDefaultColumnConfig = <T,>(): Partial<ColumnConfig<T>> => ({
  id: uuidv4(), // Generate a temporary ID
  header: "",
  type: "text",
  isEditable: true,
  isSortable: true,
  isResizable: true,
  isDraggable: true,
  isDeletable: true,
  isHidden: false,
  // Initialize options as undefined initially
  selectOptions: undefined,
  multiSelectOptions: undefined,
  minWidth: 50,
  maxWidth: undefined,
  // cell function is usually defined based on type or custom needs
  // For a generic add, we might not need it initially, or provide a default
});

export function EditColumnForm<T extends { [key: string]: CellValue }>({
  column,
  onSave,
  onCancel,
}: EditColumnFormProps<T>) {
  // Initialize state based on provided column or defaults for "Add" mode
  const initialConfig = column ? column : createDefaultColumnConfig<T>();

  const [headerText, setHeaderText] = React.useState(
    typeof initialConfig.header === "string"
      ? initialConfig.header
      : initialConfig.id ?? ""
  );
  const [selectedType, setSelectedType] = React.useState<ColumnType>(
    initialConfig.type ?? "text"
  );
  const [isEditable, setIsEditable] = React.useState(
    !!initialConfig.isEditable
  );
  const [isSortable, setIsSortable] = React.useState(
    !!initialConfig.isSortable
  );
  const [isResizable, setIsResizable] = React.useState(
    !!initialConfig.isResizable
  );
  const [isDraggable, setIsDraggable] = React.useState(
    !!initialConfig.isDraggable
  );
  const [isDeletable, setIsDeletable] = React.useState(
    !!initialConfig.isDeletable
  );
  const [isHidden, setIsHidden] = React.useState(!!initialConfig.isHidden);
  // TODO: Add state for selectOptions, multiSelectOptions, minWidth, maxWidth if needed

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
    // Construct config, ensuring it has a valid ID
    const finalId = initialConfig.id ?? uuidv4(); // Use initial/temp ID or generate new if missing
    const updatedConfig = {
      ...(column ?? {}), // Spread existing properties if editing
      id: finalId,
      header: headerText,
      type: selectedType,
      isEditable,
      isSortable,
      isResizable,
      isDraggable,
      isDeletable,
      isHidden,
      selectOptions:
        selectedType === "select"
          ? initialConfig.selectOptions || []
          : undefined,
      multiSelectOptions:
        selectedType === "multi-select"
          ? initialConfig.multiSelectOptions || []
          : undefined,
      // TODO: Add minWidth, maxWidth, and cell renderer if applicable
      minWidth: initialConfig.minWidth,
      maxWidth: initialConfig.maxWidth,
      // Provide a default cell renderer based on type if not editing or missing
      cell:
        column?.cell ??
        ((row: T) => (
          <span>{String(row[finalId] ?? "")}</span> // Basic fallback renderer
        )),
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
        id={`${initialConfig.id}-${label.toLowerCase().replace(" ", "-")}`}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <Label
        htmlFor={`${initialConfig.id}-${label.toLowerCase().replace(" ", "-")}`}
      >
        {label}
      </Label>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 w-64">
      {/* Column Header (Name) Input */}
      <div>
        <Label htmlFor={`${initialConfig.id}-header`}>Header Text</Label>
        <Input
          id={`${initialConfig.id}-header`}
          value={headerText}
          onChange={(e) => setHeaderText(e.target.value)}
          placeholder="Column Name"
          required // Make header required
        />
      </div>

      {/* Column Type Select */}
      <div>
        <Label htmlFor={`${initialConfig.id}-type`}>Column Type</Label>
        <Select
          value={selectedType}
          onValueChange={(value) => setSelectedType(value as ColumnType)}
        >
          <SelectTrigger id={`${initialConfig.id}-type`}>
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
      {/* Example for select options (needs more robust UI) */}
      {(selectedType === "select" || selectedType === "multi-select") && (
        <div>
          <Label>
            {selectedType === "select"
              ? "Select Options"
              : "Multi-Select Options"}
          </Label>
          <Input
            placeholder="Comma-separated options..."
            // TODO: Need state and better handling for options array
          />
        </div>
      )}

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm">
          Save Changes
        </Button>
      </div>
    </form>
  );
}
