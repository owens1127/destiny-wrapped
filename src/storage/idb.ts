import Dexie, { Table } from "dexie";
import { DestinyPostGameCarnageReportData } from "bungie-net-core/models";

interface PGCRRecord {
  activityId: string;
  period: string;
  storedAt: string;
  pgcr: DestinyPostGameCarnageReportData;
}

class PGCRDatabase extends Dexie {
  pgcrs!: Table<PGCRRecord, string>;

  constructor() {
    super("destiny-wrapped-pgcrs");
    // PGCRs are the single source of truth
    this.version(3).stores({
      pgcrs: "activityId, period",
    });
  }
}

const db = new PGCRDatabase();

export async function storePGCR(
  activityId: string,
  pgcr: DestinyPostGameCarnageReportData,
  period: string
): Promise<void> {
  await db.pgcrs.put({
    activityId,
    pgcr,
    period,
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
  pgcrs: Map<string, DestinyPostGameCarnageReportData>
): Promise<void> {
  const records: PGCRRecord[] = Array.from(pgcrs.entries()).map(
    ([activityId, pgcr]) => ({
      activityId,
      pgcr,
      period: pgcr.period,
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

/**
 * Check if we have a PGCR for a given activity ID
 */
export async function hasPGCR(activityId: string): Promise<boolean> {
  const record = await db.pgcrs.get(activityId);
  return !!record;
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

export async function getStorageSize(): Promise<{
  used: number;
  estimated: number;
  count: number;
}> {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) {
    return { used: 0, estimated: 0, count: 0 };
  }

  const [count, estimate] = await Promise.all([
    await db.pgcrs.count(),
    await navigator.storage.estimate(),
  ]);

  return {
    used: estimate.usage || 0,
    estimated: estimate.quota || 0,
    count,
  };
}
