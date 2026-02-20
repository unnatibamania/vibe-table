import { arrayMove } from "@dnd-kit/sortable";

export function mergeColumnOrder(
  previousOrder: string[],
  currentColumnIds: string[]
): string[] {
  const currentIdSet = new Set(currentColumnIds);

  const kept = previousOrder.filter((id) => currentIdSet.has(id));
  const additions = currentColumnIds.filter((id) => !kept.includes(id));

  return [...kept, ...additions];
}

export function reorderColumnIds(
  currentOrder: string[],
  activeId: string,
  overId: string
): string[] {
  const oldIndex = currentOrder.indexOf(activeId);
  const newIndex = currentOrder.indexOf(overId);

  if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
    return currentOrder;
  }

  return arrayMove(currentOrder, oldIndex, newIndex);
}
