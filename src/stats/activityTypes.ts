import {
  DestinyHistoricalStatsPeriodGroup,
  DestinyPostGameCarnageReportData,
  DestinyHistoricalStatsValue,
  DestinyHistoricalStatsActivity,
  DestinyPostGameCarnageReportEntry,
  DestinyHistoricalWeaponStats,
  DestinyPostGameCarnageReportTeamEntry,
} from "bungie-net-core/models";

export interface CharacterValues {
  characterId: string;
  weapons: DestinyHistoricalWeaponStats[];
  values: {
    [key: string]: DestinyHistoricalStatsValue;
  };
  extendedValues: {
    [key: string]: DestinyHistoricalStatsValue;
  };
}
/**
 * Common activity interface that works for both activity history and PGCR data.
 * This allows components to work with a unified format regardless of data source.
 */
export interface CommonDestinyActivity {
  /** Unique instance ID for this activity */
  instanceId: string;
  activityDetails: DestinyHistoricalStatsActivity;
  period: Date;
  characterValues: Map<string, CharacterValues>;
  entries?: DestinyPostGameCarnageReportEntry[];
  teams?: DestinyPostGameCarnageReportTeamEntry[];
}

/**
 * Convert activity history entries to CommonDestinyActivity format.
 * Groups activities by instanceId and combines character values.
 */
export function convertActivityHistoryToCommon(
  activities: (DestinyHistoricalStatsPeriodGroup & { characterId: string })[]
): CommonDestinyActivity[] {
  // Group by instanceId
  const activitiesByInstance = new Map<string, CommonDestinyActivity>();

  for (const activity of activities) {
    const instanceId = activity.activityDetails.instanceId;
    const existing = activitiesByInstance.get(instanceId);

    if (existing) {
      // Add this character's values to the existing activity
      existing.characterValues.set(activity.characterId, {
        characterId: activity.characterId,
        values: activity.values,
        weapons: [],
        extendedValues: {},
      });
    } else {
      // Create new activity entry
      const characterValues = new Map<string, CharacterValues>();
      characterValues.set(activity.characterId, {
        characterId: activity.characterId,
        values: activity.values,
        weapons: [],
        extendedValues: {},
      });

      activitiesByInstance.set(instanceId, {
        instanceId,
        activityDetails: activity.activityDetails,
        period: new Date(activity.period),
        characterValues,
      });
    }
  }

  return Array.from(activitiesByInstance.values());
}

/**
 * Convert PGCR data to CommonDestinyActivity format.
 * Filters entries to only include the user's characters.
 */
export function convertPGCRToCommon(
  pgcr: DestinyPostGameCarnageReportData,
  userCharacterIds: Set<string>
): CommonDestinyActivity {
  // Filter entries to only user's characters
  const userEntries =
    pgcr.entries?.filter((entry) => userCharacterIds.has(entry.characterId)) ||
    [];

  // Build characterValues map from user's entries
  const characterValues = new Map<string, CharacterValues>();

  for (const entry of userEntries) {
    characterValues.set(entry.characterId, {
      characterId: entry.characterId,
      values: entry.values,
      weapons: entry.extended.weapons,
      extendedValues: entry.extended.values,
    });
  }

  return {
    instanceId: pgcr.activityDetails.instanceId,
    activityDetails: pgcr.activityDetails,
    period: new Date(pgcr.period),
    characterValues,
    entries: pgcr.entries, // Store all entries for complete data
    teams: pgcr.teams,
  };
}

/**
 * Convert multiple PGCRs to CommonDestinyActivity format.
 */
export function convertPGCRsToCommon(
  pgcrs: Map<string, DestinyPostGameCarnageReportData>,
  userCharacterIds: Set<string>
): CommonDestinyActivity[] {
  return Array.from(pgcrs.values()).map((pgcr) =>
    convertPGCRToCommon(pgcr, userCharacterIds)
  );
}
