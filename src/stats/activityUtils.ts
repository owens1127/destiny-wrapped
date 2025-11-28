import { DestinyHistoricalStatsPeriodGroup } from "bungie-net-core/models";

/**
 * Safely get a value from activity stats
 */
export function getActivityValue(
  activity: DestinyHistoricalStatsPeriodGroup,
  key: string
): number {
  return activity.values[key]?.basic.value ?? 0;
}

/**
 * Get common activity stats
 */
export function getActivityStats(activity: DestinyHistoricalStatsPeriodGroup) {
  return {
    timePlayedSeconds: getActivityValue(activity, "timePlayedSeconds"),
    kills: getActivityValue(activity, "kills"),
    deaths: getActivityValue(activity, "deaths"),
    assists: getActivityValue(activity, "assists"),
    completed: getActivityValue(activity, "completed"),
    completionReason: getActivityValue(activity, "completionReason"),
    standing: getActivityValue(activity, "standing"),
  };
}

/**
 * Check if an activity is completed successfully
 */
export function isActivityCompleted(
  activity: DestinyHistoricalStatsPeriodGroup
): boolean {
  return (
    getActivityValue(activity, "completed") === 1 &&
    getActivityValue(activity, "completionReason") === 0
  );
}

/**
 * Check if an activity is a win (completed and standing === 0)
 */
export function isActivityWin(
  activity: DestinyHistoricalStatsPeriodGroup
): boolean {
  return (
    getActivityValue(activity, "completed") === 1 &&
    getActivityValue(activity, "standing") === 0
  );
}

/**
 * Calculate aggregate stats from an array of activities
 */
export function calculateActivityStats(
  activities: DestinyHistoricalStatsPeriodGroup[]
) {
  return activities.reduce(
    (acc, activity) => {
      const stats = getActivityStats(activity);
      return {
        kills: acc.kills + stats.kills,
        deaths: acc.deaths + stats.deaths,
        assists: acc.assists + stats.assists,
        timePlayedSeconds: acc.timePlayedSeconds + stats.timePlayedSeconds,
        wins: acc.wins + (isActivityWin(activity) ? 1 : 0),
        completed: acc.completed + (isActivityCompleted(activity) ? 1 : 0),
      };
    },
    {
      kills: 0,
      deaths: 0,
      assists: 0,
      timePlayedSeconds: 0,
      wins: 0,
      completed: 0,
    }
  );
}

