"use client";

import type { CSSProperties } from "react";

import { cx } from "./class-slots";
import type { DataGridClassNames } from "./types";

interface DataGridCellProps {
  children: React.ReactNode;
  classNames: DataGridClassNames;
  className?: string;
  isPinned?: boolean;
  pinnedStyle?: CSSProperties;
  style?: CSSProperties;
}

export function DataGridCell({
  children,
  classNames,
  className,
  isPinned,
  pinnedStyle,
  style,
}: DataGridCellProps) {
  return (
    <td
      className={cx(
        classNames.cell,
        isPinned && classNames.pinnedLeft,
        className,
      )}
      style={{
        ...pinnedStyle,
        ...style,
      }}
    >
      {children}
    </td>
  );
}
