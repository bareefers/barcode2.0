import type { EquipmentHaveEntry, EquipmentItem, EquipmentWaiterEntry } from '@/types';

/** SQLite / API often returns 0/1 for booleans. */
export function sqliteBool(v: unknown): boolean {
  return v === true || v === 1 || v === '1';
}

export type WhereToGetInLine = false | 'waiters' | 'available' | 'haves';

/** Mirrors legacy `queue/_itemId.vue` `whereToGetInLine`. */
export function whereToGetInLine(
  item: EquipmentItem | undefined,
  ban: unknown,
  available: EquipmentHaveEntry[],
  inUseHaves: EquipmentHaveEntry[],
  waiters: EquipmentWaiterEntry[]
): WhereToGetInLine {
  if (!item || sqliteBool(item.inList) || ban) return false;
  if (waiters.length > 0) return 'waiters';
  if (available.length > 0) return 'available';
  if (inUseHaves.length > 0) return 'haves';
  return false;
}
