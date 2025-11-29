import { DestinyHistoricalStatsPeriodGroup } from "bungie-net-core/models";
import { CharacterValues, CommonDestinyActivity } from "./activityTypes";

/**
 * Safely get a value from character values
 */
export function getCharacterValue(
  characterValues: CharacterValues,
  key: string
): number {
  return characterValues.values[key]?.basic.value ?? 0;
}

/**
 * Safely get an extended value from character values
 */
export function getCharacterExtendedValue(
  characterValues: CharacterValues,
  key: string
): number {
  return characterValues.extendedValues[key]?.basic.value ?? 0;
}

/**
 * Safely get a value from activity stats (legacy support)
 */
export function getActivityValue(
  activity: DestinyHistoricalStatsPeriodGroup,
  key: string
): number {
  return activity.values[key]?.basic.value ?? 0;
}

/**
 * Get common activity stats from character values
 */
export function getCharacterStats(characterValues: CharacterValues) {
  return {
    timePlayedSeconds: getCharacterValue(characterValues, "timePlayedSeconds"),
    kills: getCharacterValue(characterValues, "kills"),
    deaths: getCharacterValue(characterValues, "deaths"),
    assists: getCharacterValue(characterValues, "assists"),
    completed: getCharacterValue(characterValues, "completed"),
    completionReason: getCharacterValue(characterValues, "completionReason"),
    standing: getCharacterValue(characterValues, "standing"),
  };
}

/**
 * Get common activity stats (legacy support)
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
 * Check if an activity is completed successfully (using character values)
 */
export function isCharacterActivityCompleted(
  characterValues: CharacterValues
): boolean {
  return (
    getCharacterValue(characterValues, "completed") === 1 &&
    getCharacterValue(characterValues, "completionReason") === 0
  );
}

/**
 * Check if an activity is completed successfully (legacy support)
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
 * Check if an activity is a win (completed and standing === 0) (using character values)
 */
export function isCharacterActivityWin(
  characterValues: CharacterValues
): boolean {
  return (
    getCharacterValue(characterValues, "completed") === 1 &&
    getCharacterValue(characterValues, "standing") === 0
  );
}

/**
 * Check if an activity is a win (completed and standing === 0) (legacy support)
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
 * Get aggregated stats from a CommonDestinyActivity.
 * Aggregates stats across all characters that played the activity.
 */
export function getActivityStatsFromCommon(
  activity: CommonDestinyActivity
): ReturnType<typeof getCharacterStats> {
  const allCharacters = Array.from(activity.characterValues.values());
  if (allCharacters.length === 0) {
    // Fallback if no character values
    return {
      timePlayedSeconds: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
      completed: 0,
      completionReason: 0,
      standing: 0,
    };
  }

  // Aggregate stats across all characters
  return allCharacters.reduce(
    (acc, charValues) => {
      const stats = getCharacterStats(charValues);
      return {
        timePlayedSeconds: acc.timePlayedSeconds + stats.timePlayedSeconds,
        kills: acc.kills + stats.kills,
        deaths: acc.deaths + stats.deaths,
        assists: acc.assists + stats.assists,
        completed: acc.completed + stats.completed,
        completionReason: acc.completionReason + stats.completionReason,
        standing: acc.standing + stats.standing,
      };
    },
    {
      timePlayedSeconds: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
      completed: 0,
      completionReason: 0,
      standing: 0,
    }
  );
}

/**
 * Get all character values from a CommonDestinyActivity
 */
export function getAllCharacterValues(
  activity: CommonDestinyActivity
): CharacterValues[] {
  return Array.from(activity.characterValues.values());
}

/**
 * Get a specific character's values from a CommonDestinyActivity
 */
export function getCharacterValuesById(
  activity: CommonDestinyActivity,
  characterId: string
): CharacterValues | undefined {
  return activity.characterValues.get(characterId);
}

/**
 * Calculate aggregate stats from an array of activities (legacy support)
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

/**
 * Calculate aggregate stats from CommonDestinyActivity array
 */
export function calculateCommonActivityStats(
  activities: CommonDestinyActivity[]
) {
  return activities.reduce(
    (acc, activity) => {
      const stats = getActivityStatsFromCommon(activity);
      // Check if any character won/completed the activity
      const allCharacters = Array.from(activity.characterValues.values());
      const hasWin = allCharacters.some((char) => isCharacterActivityWin(char));
      const hasCompleted = allCharacters.some((char) =>
        isCharacterActivityCompleted(char)
      );

      return {
        kills: acc.kills + stats.kills,
        deaths: acc.deaths + stats.deaths,
        assists: acc.assists + stats.assists,
        timePlayedSeconds: acc.timePlayedSeconds + stats.timePlayedSeconds,
        wins: acc.wins + (hasWin ? 1 : 0),
        completed: acc.completed + (hasCompleted ? 1 : 0),
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
