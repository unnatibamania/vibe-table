"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "../../lib/cn";
import type { SelectOption } from "../../types/column";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export interface MultiSelectCellEditorProps {
  value: string[];
  options: SelectOption[];
  isEditable?: boolean;
  onCommit: (value: string[] | null) => void;
  className?: string;
}

export function MultiSelectCellEditor({
  value,
  options,
  isEditable = false,
  onCommit,
  className,
}: MultiSelectCellEditorProps) {
  const [open, setOpen] = React.useState(false);

  const selectedOptions = React.useMemo(
    () => options.filter((option) => value.includes(option.value)),
    [options, value]
  );

  const toggleOption = React.useCallback(
    (nextValue: string) => {
      const exists = value.includes(nextValue);
      const nextValues = exists
        ? value.filter((item) => item !== nextValue)
        : [...value, nextValue];

      onCommit(nextValues.length > 0 ? nextValues : null);
    },
    [value, onCommit]
  );

  if (!isEditable) {
    if (selectedOptions.length === 0) {
      return <div className={cn("truncate", className)}>-</div>;
    }

    return (
      <div className={cn("flex flex-wrap gap-1", className)}>
        {selectedOptions.map((option) => (
          <Badge key={option.value}>{option.label}</Badge>
        ))}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-8 w-full justify-between overflow-hidden px-2 font-normal",
            className
          )}
        >
          <span className="mr-2 flex flex-1 items-center gap-1 overflow-hidden">
            {selectedOptions.length > 0 ? (
              selectedOptions.slice(0, 2).map((option) => (
                <Badge key={option.value} className="truncate">
                  {option.label}
                </Badge>
              ))
            ) : (
              <span className="truncate text-zinc-500">(empty)</span>
            )}
            {selectedOptions.length > 2 ? (
              <Badge className="bg-zinc-200 text-zinc-700">+{selectedOptions.length - 2}</Badge>
            ) : null}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[260px] p-0">
        <Command>
          <CommandInput placeholder="Search options..." />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggleOption(option.value)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {value.length > 0 ? (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    className="cursor-pointer text-red-600"
                    onSelect={() => onCommit(null)}
                  >
                    Clear selection
                  </CommandItem>
                </CommandGroup>
              </>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
