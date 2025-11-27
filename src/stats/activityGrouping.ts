import { DestinyHistoricalStatsPeriodGroup } from "bungie-net-core/models";
import { calculateActivityStats } from "./activityUtils";

/**
 * Extract base name from activity name (everything before ":")
 */
export function getActivityBaseName(fullName: string): string {
  return fullName.split(":")[0].trim();
}

/**
 * Group activities by their base name (normalized)
 */
export interface GroupedActivity {
  baseName: string;
  hash: number;
  count: number;
  timePlayedSeconds: number;
  displayName: string;
  maxCount: number;
}

/**
 * Group activities by base name, aggregating counts and time
 */
export function groupActivitiesByName(
  activities: Array<{
    hash: number;
    count: number;
    timePlayedSeconds: number;
  }>,
  getActivityName: (hash: number) => string
): GroupedActivity[] {
  const grouped = new Map<string, GroupedActivity>();

  activities.forEach(({ hash, count, timePlayedSeconds }) => {
    const fullName = getActivityName(hash);
    const baseName = getActivityBaseName(fullName);

    const existing = grouped.get(baseName);
    if (existing) {
      existing.count += count;
      existing.timePlayedSeconds += timePlayedSeconds;
      if (count > existing.maxCount) {
        existing.hash = hash;
        existing.maxCount = count;
      }
      existing.displayName = baseName;
    } else {
      grouped.set(baseName, {
        baseName,
        hash,
        count,
        timePlayedSeconds,
        displayName: baseName,
        maxCount: count,
      });
    }
  });

  return Array.from(grouped.values());
}

/**
 * Generic grouping utility for activities
 */
export function groupActivitiesBy<
  T,
  A extends DestinyHistoricalStatsPeriodGroup = DestinyHistoricalStatsPeriodGroup
>(activities: A[], getKey: (activity: A) => T): Map<T, A[]> {
  const grouped = new Map<T, A[]>();

  activities.forEach((activity) => {
    const key = getKey(activity);
    const existing = grouped.get(key);
    if (!existing) {
      grouped.set(key, [activity]);
    } else {
      existing.push(activity);
    }
  });

  return grouped;
}

/**
 * Calculate stats for grouped activities
 */
export function calculateGroupedStats(
  activities: DestinyHistoricalStatsPeriodGroup[]
) {
  const stats = calculateActivityStats(activities);
  return {
    ...stats,
    count: activities.length,
  };
}
