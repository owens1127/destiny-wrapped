import { DestinyHistoricalStatsPeriodGroup } from "bungie-net-core/models";
import { getActivityStats, isActivityCompleted } from "./activityUtils";

/**
 * Check if an activity is a "mines" activity (Caldera, K1 Logistics, Starcrossed, Encore)
 */
export function isMinesActivity(
  activityName: string
): { isMines: boolean; normalizedName?: string } {
  const baseName = activityName.split(":")[0].trim().toLowerCase();

  if (baseName.includes("caldera")) {
    return { isMines: true, normalizedName: "Caldera" };
  }
  if (baseName.includes("k1 logistics") || baseName.includes("k1")) {
    return { isMines: true, normalizedName: "K1 Logistics" };
  }
  if (baseName.includes("starcrossed")) {
    return { isMines: true, normalizedName: "Starcrossed" };
  }
  if (baseName.includes("encore")) {
    return { isMines: true, normalizedName: "Encore" };
  }

  return { isMines: false };
}

/**
 * Order map for mines activities
 */
export const MINES_ORDER: Record<string, number> = {
  Encore: 0,
  Caldera: 1,
  "K1 Logistics": 2,
  Starcrossed: 3,
};

export interface MinesActivityStats {
  name: string;
  hash: number;
  count: number;
  timePlayedSeconds: number;
  kills: number;
  deaths: number;
  completedCount: number;
  successRate: number;
  kd: number;
  popularityRatio: number;
  medianClearTimeSeconds: number;
}

/**
 * Group and calculate stats for mines activities
 */
export function calculateMinesStats(
  activities: (DestinyHistoricalStatsPeriodGroup & {
    characterId: string;
  })[],
  getActivityName: (hash: number) => string
): {
  activities: MinesActivityStats[];
  totalRuns: number;
} {
  // Filter mines activities
  const minesActivities = activities.filter((activity) => {
    const activityName =
      getActivityName(activity.activityDetails?.referenceId ?? 0) ?? "";
    return isMinesActivity(activityName).isMines;
  });

  // Group by normalized name and track individual clear times for median calculation
  const grouped = new Map<
    string,
    MinesActivityStats & { clearTimes: number[] }
  >();

  minesActivities.forEach((activity) => {
    const activityName =
      getActivityName(activity.activityDetails?.referenceId ?? 0) ?? "Unknown";
    const { normalizedName } = isMinesActivity(activityName);

    if (!normalizedName) return;

    const hash = activity.activityDetails?.referenceId ?? 0;
    const stats = getActivityStats(activity);
    const isCompleted = isActivityCompleted(activity);

    const existing = grouped.get(normalizedName);
    if (existing) {
      existing.count++;
      existing.timePlayedSeconds += stats.timePlayedSeconds;
      existing.kills += stats.kills;
      existing.deaths += stats.deaths;
      if (isCompleted) {
        existing.completedCount++;
        existing.clearTimes.push(stats.timePlayedSeconds);
      }
    } else {
      grouped.set(normalizedName, {
        name: normalizedName,
        hash,
        count: 1,
        timePlayedSeconds: stats.timePlayedSeconds,
        kills: stats.kills,
        deaths: stats.deaths,
        completedCount: isCompleted ? 1 : 0,
        clearTimes: isCompleted ? [stats.timePlayedSeconds] : [],
        successRate: 0, // Will be calculated below
        kd: 0, // Will be calculated below
        popularityRatio: 0, // Will be calculated below
        medianClearTimeSeconds: 0, // Will be calculated below
      });
    }
  });

  // Helper function to calculate median
  const calculateMedian = (values: number[]): number => {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  };

  // Calculate derived stats
  const allActivities = Array.from(grouped.values())
    .map((activity) => {
      const { clearTimes, ...rest } = activity;
      return {
        ...rest,
        successRate:
          activity.count > 0
            ? (activity.completedCount / activity.count) * 100
            : 0,
        kd: activity.deaths > 0 ? activity.kills / activity.deaths : activity.kills,
        medianClearTimeSeconds: calculateMedian(clearTimes),
      };
    })
    .filter((activity) => activity.count > 10); // Only show activities with more than 10 attempts

  const totalRuns = allActivities.reduce((sum, a) => sum + a.count, 0);

  const sortedActivities = allActivities
    .map((activity) => ({
      ...activity,
      popularityRatio: totalRuns > 0 ? activity.count / totalRuns : 0,
    }))
    .sort((a, b) => {
      const orderA = MINES_ORDER[a.name] ?? 999;
      const orderB = MINES_ORDER[b.name] ?? 999;
      return orderA - orderB;
    });

  return {
    activities: sortedActivities,
    totalRuns,
  };
}

