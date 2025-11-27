import Dexie, { Table } from "dexie";
import {
  DestinyPostGameCarnageReportData,
  DestinyHistoricalStatsPeriodGroup,
} from "bungie-net-core/models";

interface PGCRRecord {
  activityId: string;
  pgcr: DestinyPostGameCarnageReportData;
  period: string;
  storedAt: string;
}

class PGCRDatabase extends Dexie {
  pgcrs!: Table<PGCRRecord, string>;

  constructor() {
    super("destiny-wrapped-pgcrs");
    this.version(1).stores({
      pgcrs: "activityId, period",
    });
    // Version 2 had both pgcrs and activities tables
    this.version(2).stores({
      pgcrs: "activityId, period",
      activities: "activityId, storedAt",
    });
    // Version 3 removes activities table - PGCRs are the single source of truth
    this.version(3).stores({
      pgcrs: "activityId, period",
    });
  }
}

const db = new PGCRDatabase();

export async function storePGCR(
  activityId: string,
  pgcr: DestinyPostGameCarnageReportData,
  period?: string
): Promise<void> {
  await db.pgcrs.put({
    activityId,
    pgcr,
    period: period || new Date().toISOString(),
    storedAt: new Date().toISOString(),
  });
}

export async function getPGCR(
  activityId: string
): Promise<DestinyPostGameCarnageReportData | null> {
  const record = await db.pgcrs.get(activityId);
  return record?.pgcr || null;
}

export async function getPGCRs(
  activityIds: string[]
): Promise<Map<string, DestinyPostGameCarnageReportData>> {
  const records = await db.pgcrs.bulkGet(activityIds);
  const results = new Map<string, DestinyPostGameCarnageReportData>();

  records.forEach((record) => {
    if (record?.pgcr) {
      results.set(record.activityId, record.pgcr);
    }
  });

  return results;
}

export async function storePGCRs(
  pgcrs: Map<string, DestinyPostGameCarnageReportData>,
  periods?: Map<string, string>
): Promise<void> {
  const records: PGCRRecord[] = Array.from(pgcrs.entries()).map(
    ([activityId, pgcr]) => ({
      activityId,
      pgcr,
      period:
        periods?.get(activityId) || pgcr.period || new Date().toISOString(),
      storedAt: new Date().toISOString(),
    })
  );

  await db.pgcrs.bulkPut(records);

  // Dispatch custom event to notify components that PGCRs were stored
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("pgcrs-stored"));
  }
}

export async function getAllPGCRs(): Promise<
  Map<string, DestinyPostGameCarnageReportData>
> {
  const records = await db.pgcrs.toArray();
  const results = new Map<string, DestinyPostGameCarnageReportData>();

  records.forEach((record) => {
    results.set(record.activityId, record.pgcr);
  });

  return results;
}

export async function getStorageSize(): Promise<{
  used: number;
  estimated: number;
  count: number;
}> {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) {
    return { used: 0, estimated: 0, count: 0 };
  }

  const count = await db.pgcrs.count();
  const estimate = await navigator.storage.estimate();

  return {
    used: estimate.usage || 0,
    estimated: estimate.quota || 0,
    count,
  };
}

export async function clearPGCRs(): Promise<void> {
  await db.pgcrs.clear();
  // Dispatch custom event to notify components that PGCRs were cleared
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("pgcrs-cleared"));
  }
}

export async function deletePGCR(activityId: string): Promise<void> {
  await db.pgcrs.delete(activityId);
}

/**
 * Get activity data from a PGCR. PGCRs contain all activity history data plus more,
 * so we can extract the activity information directly from the PGCR.
 */
export function getActivityFromPGCR(
  pgcr: DestinyPostGameCarnageReportData,
  characterId: string
): (DestinyHistoricalStatsPeriodGroup & { characterId: string }) | null {
  // Find the player's entry in the PGCR
  const playerEntry = pgcr.entries?.find(
    (entry) => entry.characterId === characterId
  );

  if (!playerEntry) {
    return null;
  }

  // Extract activity data from PGCR (PGCRs are a superset, so all data is there)
  return {
    period: pgcr.period,
    activityDetails: pgcr.activityDetails,
    values: playerEntry.values,
    characterId: playerEntry.characterId,
  };
}

/**
 * Check if we have a PGCR for a given activity ID
 */
export async function hasPGCR(activityId: string): Promise<boolean> {
  const record = await db.pgcrs.get(activityId);
  return !!record;
}

/**
 * Check which activities have PGCRs
 */
export async function getActivitiesWithPGCRs(): Promise<Set<string>> {
  const records = await db.pgcrs.toArray();
  return new Set(records.map((r) => r.activityId));
}

// Activity History Functions
// Note: We no longer store activity history separately - PGCRs are the single source of truth.
// These functions extract activity data from PGCRs when needed.

export async function getActivity(
  activityId: string,
  characterId: string
): Promise<
  (DestinyHistoricalStatsPeriodGroup & { characterId: string }) | null
> {
  // Get activity data from PGCR (PGCRs contain all activity data)
  const pgcr = await getPGCR(activityId);
  if (pgcr) {
    return getActivityFromPGCR(pgcr, characterId);
  }
  return null;
}

/**
 * Get activities from PGCRs.
 * This is the unified way to get activity data - PGCRs are the single source of truth.
 */
export async function getActivities(
  activityIds: string[],
  characterIdMap: Map<string, string> // activityId -> characterId
): Promise<
  Map<string, DestinyHistoricalStatsPeriodGroup & { characterId: string }>
> {
  const results = new Map<
    string,
    DestinyHistoricalStatsPeriodGroup & { characterId: string }
  >();

  // Get activities from PGCRs (PGCRs contain all activity data)
  const pgcrs = await getPGCRs(activityIds);
  for (const [activityId, pgcr] of pgcrs.entries()) {
    const characterId = characterIdMap.get(activityId);
    if (characterId) {
      const activity = getActivityFromPGCR(pgcr, characterId);
      if (activity) {
        results.set(activityId, activity);
      }
    }
  }

  return results;
}

/**
 * Get all activities from stored PGCRs.
 */
export async function getAllActivities(
  characterIdMap: Map<string, string> // activityId -> characterId
): Promise<(DestinyHistoricalStatsPeriodGroup & { characterId: string })[]> {
  const pgcrs = await getAllPGCRs();
  const activities: (DestinyHistoricalStatsPeriodGroup & {
    characterId: string;
  })[] = [];

  for (const [activityId, pgcr] of pgcrs.entries()) {
    const characterId = characterIdMap.get(activityId);
    if (characterId) {
      const activity = getActivityFromPGCR(pgcr, characterId);
      if (activity) {
        activities.push(activity);
      }
    }
  }

  return activities;
}

// Auto-download preference
const AUTO_DOWNLOAD_KEY = "destiny-wrapped-auto-download";

export function getAutoDownloadPreference(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(AUTO_DOWNLOAD_KEY);
  return stored === "true";
}

export function setAutoDownloadPreference(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTO_DOWNLOAD_KEY, enabled ? "true" : "false");
}
