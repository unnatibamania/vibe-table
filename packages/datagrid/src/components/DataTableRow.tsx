import { cn } from "../lib/cn";
import type { DataTableRowProps } from "../types/table";

export function DataTableRow({ className, children, ...props }: DataTableRowProps) {
  return (
    <tr className={cn("border-b border-zinc-200", className)} {...props}>
      {children}
    </tr>
  );
}
