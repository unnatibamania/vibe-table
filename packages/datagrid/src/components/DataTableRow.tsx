import { cn } from "../lib/cn";
import type { DataTableRowProps } from "../types/table";

export function DataTableRow({ className, children, ...props }: DataTableRowProps) {
  return (
    <tr
      className={cn(
        "transition-[background-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-slate-50/60",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}
