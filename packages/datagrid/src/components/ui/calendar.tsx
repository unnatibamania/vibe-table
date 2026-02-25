"use client";

import * as React from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { DayPicker, type ChevronProps } from "react-day-picker";
import { cn } from "../../lib/cn";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col gap-4 sm:flex-row sm:gap-4",
        month: "space-y-4",
        caption: "relative flex items-center justify-center pt-1",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        nav_button:
          "inline-flex h-7 w-7 items-center justify-center rounded-md border border-zinc-300 bg-white p-0 text-zinc-700 opacity-70 transition-opacity hover:opacity-100",
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "w-9 rounded-md text-[0.8rem] font-normal text-zinc-500",
        row: "mt-2 flex w-full",
        cell: "relative h-9 w-9 p-0 text-center text-sm",
        day_button:
          "inline-flex h-9 w-9 items-center justify-center rounded-md p-0 font-normal transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20",
        day: "inline-flex h-9 w-9 items-center justify-center rounded-md p-0 font-normal transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20",
        day_selected:
          "bg-zinc-900 text-zinc-50 hover:bg-zinc-900 hover:text-zinc-50",
        day_today: "bg-zinc-100 text-zinc-900",
        day_outside: "text-zinc-400 opacity-60",
        day_disabled: "text-zinc-300 opacity-50",
        day_hidden: "invisible",
        button_previous:
          "absolute left-1 inline-flex h-7 w-7 items-center justify-center rounded-md border border-zinc-300 bg-white p-0 text-zinc-700 opacity-70 transition-opacity hover:opacity-100",
        button_next:
          "absolute right-1 inline-flex h-7 w-7 items-center justify-center rounded-md border border-zinc-300 bg-white p-0 text-zinc-700 opacity-70 transition-opacity hover:opacity-100",
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "w-9 rounded-md text-[0.8rem] font-normal text-zinc-500",
        week: "mt-2 flex w-full",
        disabled: "text-zinc-300 opacity-50",
        outside: "text-zinc-400 opacity-60",
        selected: "bg-zinc-900 text-zinc-50 hover:bg-zinc-900 hover:text-zinc-50",
        today: "bg-zinc-100 text-zinc-900",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({
          className: iconClassName,
          orientation,
          ...iconProps
        }: ChevronProps) => {
          if (orientation === "left") {
            return <ChevronLeft className={cn("h-4 w-4", iconClassName)} {...iconProps} />;
          }

          if (orientation === "right") {
            return (
              <ChevronRight className={cn("h-4 w-4", iconClassName)} {...iconProps} />
            );
          }

          if (orientation === "up") {
            return <ChevronUp className={cn("h-4 w-4", iconClassName)} {...iconProps} />;
          }

          return <ChevronDown className={cn("h-4 w-4", iconClassName)} {...iconProps} />;
        },
      }}
      {...props}
    />
  );
}
