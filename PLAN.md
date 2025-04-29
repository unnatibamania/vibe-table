# DataGrid Component Development Plan

## Overall Goal

Create a reusable, editable DataGrid component using Next.js 14, ShadCN UI, and TypeScript, suitable for packaging as a standalone NPM package.

## Key Features

- [ ] Data Type Support (View & Edit):
  - [ ] text
  - [ ] number
  - [ ] date
  - [ ] boolean
  - [ ] select
  - [ ] multi-select
  - [ ] user
  - [ ] rating
  - [ ] toggle
  - [ ] checkbox
- [ ] Sorting
- [ ] Column Reordering
- [ ] Row Selection (Checkboxes)
- [ ] Column Resizing

## Implementation Order

1.  **Core Data Type Implementation:** Start with basic data types (text, number) and establish the core rendering and editing logic. Progressively add other data types.
2.  **Feature Implementation:** Once the data types are handled, implement features like Sorting, Reordering, Selection, and Resizing.

## TODO List

### Phase 1: Core Structure & Basic Data Types

- [x] **1. Setup Basic DataGrid Component:**
  - Create `app/components/data-grid.tsx`.
  - Define basic `DataGridProps` interface (accepting `rows: T[]`, `columns: ColumnConfig<T>[]`, `onRowChange: (rowIndex: number, columnId: string, newValue: any) => void`). Use generics `<T extends { id: string | number }>`.
  - Use ShadCN `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell` for the basic layout.
  - Render headers based on `columns` prop.
  - Render initial rows based on `rows` and `columns` props, using the `cell` function from `ColumnConfig`.
- [x] **2. Implement `text` Cell Type:**
  - Create a separate component `app/components/cells/text-cell.tsx`.
  - Implement view mode (displaying text).
  - Implement edit mode (triggered by double-click).
    - Use ShadCN `Input`.
    - Handle state for edit mode (e.g., `isEditing`).
    - Call `onRowChange` when editing is complete (e.g., on Blur or Enter key).
  - Integrate `TextCell` into `DataGrid` based on `column.type`.
- [x] **3. Implement `number` Cell Type:**
  - Create `app/components/cells/number-cell.tsx`.
  - Implement view mode.
  - Implement edit mode (double-click trigger).
    - Use ShadCN `Input` with `type="number"`.
    - Consider basic validation if needed.
    - Call `onRowChange`.
  - Integrate `NumberCell` into `DataGrid`.

### Phase 2: Advanced Data Types (Order TBD)

- [x] Implement `date` Cell Type
- [x] Implement `boolean` Cell Type
- [x] Implement `select` Cell Type
- [x] Implement `multi-select` Cell Type
- [ ] Implement `user` Cell Type
- [x] Implement `rating` Cell Type
- [x] Implement `toggle` Cell Type
- [x] Implement `checkbox` Cell Type

### Phase 3: Features (Order TBD)

- [x] Implement Sorting
- [x] Implement Column Reordering
- [x] Implement Row Selection (Checkboxes)
- [ ] Implement Column Resizing

### Phase 4: Packaging & Refinement

- [ ] Refactor for NPM packaging.
- [ ] Add documentation (Props, Usage).
- [ ] Testing.

## Coding Guidelines Reminder

- Separate components for different cell types (under `app/components/cells/`).
- Use TypeScript generics.
- Follow Plan -> Code -> Review process.
- Trigger edits on double-click.
- Use `onRowChange` prop for updates.
