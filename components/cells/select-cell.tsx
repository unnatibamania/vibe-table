"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button"; // Trigger will be a button
import { ChevronDown } from "lucide-react"; // Icon for trigger
import { cn } from "@/lib/utils";

// Define reusable type
type ComponentClassNames = {
  selectTrigger?: string;
  selectContent?: string;
  selectItem?: string;
  // Add others as needed
};

interface SelectCellProps {
  initialValue: string | null | undefined;
  options: string[];
  onSave: (newValue: string | null) => void;
  isEditable?: boolean;
  classNames?: ComponentClassNames; // Accept classNames
}

// Using DropdownMenuRadioGroup for selection behavior
export function SelectCell({
  initialValue,
  options,
  onSave,
  isEditable = true,
  classNames, // Destructure
}: SelectCellProps) {
  const currentValue = initialValue ?? ""; // Use empty string for the radio group value if null

  const handleValueChange = (newValue: string) => {
    // DropdownMenuRadioGroup returns the value directly
    const valueToSave = newValue === "__clear__" ? null : newValue; // Use a special value for clear
    // Only save if the value actually changed
    if (valueToSave !== initialValue) {
      onSave(valueToSave);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={!isEditable}>
        {/* Use a button as the trigger, styled to fit the cell */}
        <Button
          variant="ghost"
          className={cn(
            // Base styles
            "w-full border-0 rounded-none justify-between font-normal truncate data-[state=open]:bg-accent",
            // Custom trigger class
            classNames?.selectTrigger
          )}
        >
          <span className="truncate">
            {currentValue || (
              <span className="text-muted-foreground">(empty)</span>
            )}
          </span>
          {isEditable && (
            <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0 opacity-50" />
          )}
        </Button>
      </DropdownMenuTrigger>
      {/* Apply content class */}
      <DropdownMenuContent
        align="start"
        className={cn(classNames?.selectContent)}
      >
        {" "}
        {/* Align dropdown with cell start */}
        <DropdownMenuRadioGroup
          value={currentValue}
          onValueChange={handleValueChange}
        >
          {/* Option to clear the selection */}
          <DropdownMenuRadioItem
            value="__clear__"
            className={cn(classNames?.selectItem)}
          >
            <em>(Clear)</em>
          </DropdownMenuRadioItem>
          <DropdownMenuSeparator />
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option}
              value={option}
              className={cn(classNames?.selectItem)}
            >
              {option}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
