import { useMemo } from "react";
import { DestinyClass } from "bungie-net-core/models";
import { activityModeNames } from "@/config/modes";
import { getSeason } from "@/config/seasons";
import {
  getCharacterValue,
  getCharacterExtendedValue,
  getCharacterStats,
  getActivityStatsFromCommon,
  isCharacterActivityWin,
  isCharacterActivityCompleted,
} from "./activityUtils";
import { CommonDestinyActivity, CharacterValues } from "./activityTypes";

type SixtySevenType =
  | "kills"
  | "assists"
  | "deaths"
  | "precisionKills"
  | "opponentsDefeated"
  | "score"
  | "orbsDropped"
  | "orbsGathered"
  | "standing"
  | "weaponKillsGrenade"
  | "weaponKillsMelee"
  | "weaponKillsSuper"
  | "weaponKillsAbility";

// Helper to check and track 67 meme moments
function checkSixtySeven(
  value: number,
  type: SixtySevenType,
  activity: CommonDestinyActivity,
  characterValues: CharacterValues,
  counts: Record<SixtySevenType, number>,
  activities: Array<{
    type: SixtySevenType;
    activity: CommonDestinyActivity;
    characterValues: CharacterValues;
  }>
) {
  if (value === 67) {
    counts[type]++;
    activities.push({ type, activity, characterValues });
  }
}

// Helper to calculate total time played for activities
function getTotalTimePlayed(activities: CommonDestinyActivity[]): number {
  return activities.reduce((acc, activity) => {
    const stats = getActivityStatsFromCommon(activity);
    return acc + stats.timePlayedSeconds;
  }, 0);
}

// Helper to calculate game mode stats
function calculateGameStats(games: CommonDestinyActivity[]) {
  return {
    games: games.length,
    wins: games.filter((activity) => {
      const allChars = Array.from(activity.characterValues.values());
      return allChars.some((char) => isCharacterActivityWin(char));
    }).length,
    kills: games.reduce((acc, activity) => {
      const stats = getActivityStatsFromCommon(activity);
      return acc + stats.kills;
    }, 0),
    deaths: games.reduce((acc, activity) => {
      const stats = getActivityStatsFromCommon(activity);
      return acc + stats.deaths;
    }, 0),
    assists: games.reduce((acc, activity) => {
      const stats = getActivityStatsFromCommon(activity);
      return acc + stats.assists;
    }, 0),
    timePlayed: getTotalTimePlayed(games),
  };
}

/**
 * Calculate all wrapped stats from activities
 */
export function useWrappedStats(
  activities: CommonDestinyActivity[],
  characterMap: Record<string, DestinyClass>
) {
  return useMemo(() => {
    // Filter out activities with more than 18 players (count distinct membership IDs)
    const filteredActivities = activities.filter((activity) => {
      if (activity.entries) {
        // Count distinct membership IDs, not total entries (a player can have multiple characters)
        const uniqueMembershipIds = new Set(
          activity.entries
            .map((entry) => entry.player?.destinyUserInfo?.membershipId)
            .filter((id): id is string => !!id)
        );
        const playerCount = uniqueMembershipIds.size;
        return playerCount <= 18;
      }
      // If no PGCR data, include it (can't determine player count)
      return true;
    });

    // Initialize grouping maps (will be populated in the loop)
    const groupedByMode = new Map<number, CommonDestinyActivity[]>();
    const groupedByPrimaryMode = new Map<number, CommonDestinyActivity[]>();
    const groupedByMonth = new Map<number, CommonDestinyActivity[]>();
    const groupedByHash = new Map<number, CommonDestinyActivity[]>();
    const groupedByClass = new Map<DestinyClass, CommonDestinyActivity[]>();
    const groupedBySeason = new Map<string, CommonDestinyActivity[]>();

    // Base stats
    const totalStats = {
      playTime: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
      count: filteredActivities.length,
    };

    const longestStreak = {
      numDays: 0,
      activityCount: 0,
      start: null as Date | null,
      end: null as Date | null,
      currentDays: 0,
      currentActivityCount: 0,
      currentStart: null as Date | null,
      currentEnd: null as Date | null,
    };

    const gambitGames: CommonDestinyActivity[] = [];
    const pvpGames: CommonDestinyActivity[] = [];

    // PGCR-dependent stats
    const fireteamStats = {
      soloActivities: 0,
      teamActivities: 0,
      soloTimePlayed: 0,
      teamTimePlayed: 0,
      averageFireteamSize: 0,
      mostCommonFireteamSize: 0,
      largestFireteamSize: 0,
      fireteamSizeDistribution: new Map<number, number>(),
    };

    const weaponKills = new Map<number, number>();
    const pvpWeaponKills = new Map<number, number>();
    const abilityStats = {
      superKills: 0,
      grenadeKills: 0,
      meleeKills: 0,
      abilityKills: 0,
    };

    const hourTimePlayed = new Array(24).fill(0);
    const dayOfWeekTimePlayed = new Array(7).fill(0);
    const fireteamSizeCounts = new Map<number, number>();
    const teammateCounts = new Map<
      string,
      {
        displayName: string;
        membershipId: string;
        count: number;
        bungieGlobalDisplayNameCode?: number;
      }
    >();
    const emblemCounts = new Map<number, number>();
    const sixtySevenCounts = {
      kills: 0,
      assists: 0,
      deaths: 0,
      precisionKills: 0,
      opponentsDefeated: 0,
      score: 0,
      orbsDropped: 0,
      orbsGathered: 0,
      standing: 0,
      weaponKillsGrenade: 0,
      weaponKillsMelee: 0,
      weaponKillsSuper: 0,
      weaponKillsAbility: 0,
    };
    const sixtySevenActivities: Array<{
      type: SixtySevenType;
      activity: CommonDestinyActivity;
      characterValues: CharacterValues;
    }> = [];

    let activitiesWithPGCR = 0;

    // Process all activities
    filteredActivities.forEach((activity) => {
      // Aggregate stats across all characters that played this activity
      const allCharacters = Array.from(activity.characterValues.values());
      if (allCharacters.length === 0) return; // Skip if no character data

      const stats = getActivityStatsFromCommon(activity);
      totalStats.playTime += stats.timePlayedSeconds;
      totalStats.kills += stats.kills;
      totalStats.deaths += stats.deaths;
      totalStats.assists += stats.assists;

      // Track 67 meme moments - check stats from all character values
      allCharacters.forEach((charValues) => {
        const charStats = getCharacterStats(charValues);
        checkSixtySeven(
          charStats.kills,
          "kills",
          activity,
          charValues,
          sixtySevenCounts,
          sixtySevenActivities
        );
        checkSixtySeven(
          charStats.assists,
          "assists",
          activity,
          charValues,
          sixtySevenCounts,
          sixtySevenActivities
        );
        checkSixtySeven(
          charStats.deaths,
          "deaths",
          activity,
          charValues,
          sixtySevenCounts,
          sixtySevenActivities
        );
        checkSixtySeven(
          getCharacterValue(charValues, "opponentsDefeated"),
          "opponentsDefeated",
          activity,
          charValues,
          sixtySevenCounts,
          sixtySevenActivities
        );
        checkSixtySeven(
          getCharacterValue(charValues, "score"),
          "score",
          activity,
          charValues,
          sixtySevenCounts,
          sixtySevenActivities
        );
        checkSixtySeven(
          getCharacterValue(charValues, "standing"),
          "standing",
          activity,
          charValues,
          sixtySevenCounts,
          sixtySevenActivities
        );
      });

      // Group by mode (all modes)
      activity.activityDetails.modes.forEach((mode) => {
        const existing = groupedByMode.get(mode);
        if (existing) {
          existing.push(activity);
        } else {
          groupedByMode.set(mode, [activity]);
        }
      });

      // Group by primary mode
      const mode = activity.activityDetails.mode;
      const existingModeGroup = groupedByPrimaryMode.get(mode);
      if (existingModeGroup) {
        existingModeGroup.push(activity);
      } else {
        groupedByPrimaryMode.set(mode, [activity]);
      }

      // Group by month
      const month = activity.period.getMonth();
      const existingMonthGroup = groupedByMonth.get(month);
      if (existingMonthGroup) {
        existingMonthGroup.push(activity);
      } else {
        groupedByMonth.set(month, [activity]);
      }

      // Group by hash
      const hash = activity.activityDetails.directorActivityHash;
      const existingHashGroup = groupedByHash.get(hash);
      if (existingHashGroup) {
        existingHashGroup.push(activity);
      } else {
        groupedByHash.set(hash, [activity]);
      }

      // Group by class - assign activity to each class that played it
      activity.characterValues.forEach((charValues) => {
        const characterClass = characterMap[charValues.characterId] ?? 3;
        const existingClassGroup = groupedByClass.get(characterClass);
        if (existingClassGroup) {
          existingClassGroup.push(activity);
        } else {
          groupedByClass.set(characterClass, [activity]);
        }
      });

      // Group by season
      const season = getSeason(activity.period);
      const existingSeasonGroup = groupedBySeason.get(season);
      if (existingSeasonGroup) {
        existingSeasonGroup.push(activity);
      } else {
        groupedBySeason.set(season, [activity]);
      }

      // Track game modes
      if (mode === 63) {
        gambitGames.push(activity);
      }

      if (activity.activityDetails.modes.includes(5)) {
        pvpGames.push(activity);
      }

      // Calculate longest streak
      if (stats.timePlayedSeconds > 0) {
        const date = new Date(activity.period);
        date.setUTCHours(17, 0, 0, 0);

        if (!longestStreak.start) {
          longestStreak.numDays = 1;
          longestStreak.activityCount = 1;
          longestStreak.start = date;
          longestStreak.end = date;
          longestStreak.currentDays = 1;
          longestStreak.currentActivityCount = 1;
          longestStreak.currentStart = date;
          longestStreak.currentEnd = date;
        } else {
          if (longestStreak.currentEnd!.getTime() === date.getTime()) {
            // Same day - increment activity count
            longestStreak.currentActivityCount++;
          } else if (
            date.getTime() ===
            longestStreak.currentEnd!.getTime() - 86_400_000
          ) {
            // Previous consecutive day - extend streak to include older day
            longestStreak.currentActivityCount++;
            longestStreak.currentDays++;
            longestStreak.currentEnd = date;
          } else {
            // Gap in streak - start new streak
            longestStreak.currentDays = 1;
            longestStreak.currentActivityCount = 1;
            longestStreak.currentStart = date;
            longestStreak.currentEnd = date;
          }

          if (longestStreak.currentDays > longestStreak.numDays) {
            longestStreak.numDays = longestStreak.currentDays;
            longestStreak.activityCount = longestStreak.currentActivityCount;
            // currentEnd = oldest date (streak start), currentStart = newest date (streak end)
            longestStreak.start = longestStreak.currentEnd;
            longestStreak.end = longestStreak.currentStart;
          }
        }
      }

      // Process PGCR data if available
      if (activity.entries && activity.entries.length > 0) {
        activitiesWithPGCR++;

        // Fireteam stats (only count once per instance)
        // Count distinct membership IDs, not total entries (a player can have multiple characters)
        const uniqueMembershipIds = new Set(
          activity.entries.map(
            (entry) => entry.player.destinyUserInfo.membershipId
          )
        );
        const playerCount = uniqueMembershipIds.size;
        const stats = getActivityStatsFromCommon(activity);
        const timePlayed = stats.timePlayedSeconds;

        fireteamSizeCounts.set(
          playerCount,
          (fireteamSizeCounts.get(playerCount) || 0) + 1
        );

        if (playerCount === 1) {
          fireteamStats.soloActivities++;
          fireteamStats.soloTimePlayed += timePlayed;
        } else {
          fireteamStats.teamActivities++;
          fireteamStats.teamTimePlayed += timePlayed;
        }

        // Largest squad only counts solo activities where player played at least 15 minutes and completed
        const MIN_TIME_FOR_LARGEST_SQUAD = 15 * 60; // 15 minutes in seconds
        const allCharacters = Array.from(activity.characterValues.values());
        const hasCompleted = allCharacters.some((char) =>
          isCharacterActivityCompleted(char)
        );
        const playedEnough = timePlayed >= MIN_TIME_FOR_LARGEST_SQUAD;
        const isTeamBased = activity.teams && activity.teams.length > 0;

        if (
          !isTeamBased &&
          hasCompleted &&
          playedEnough &&
          playerCount > fireteamStats.largestFireteamSize
        ) {
          fireteamStats.largestFireteamSize = playerCount;
        }

        // Get all characters that played this instance from characterValues
        const characterIdsForInstance = Array.from(
          activity.characterValues.keys()
        );
        const firstCharacterId = characterIdsForInstance[0];
        const entries = activity.entries;

        // Process character-specific data for all characters that played this instance
        // This ensures we capture emblems, weapon kills, etc. for all characters
        activity.characterValues.forEach((charValues, charId) => {
          const playerEntry = entries.find(
            (entry) => entry.characterId === charId
          );

          if (!playerEntry) return;

          // Get player's membershipId to filter out self for teammate tracking
          const playerMembershipId =
            playerEntry.player?.destinyUserInfo?.membershipId;

          // Track teammates (only once per instance, using first character's perspective)
          if (charId === firstCharacterId) {
            entries.forEach((entry) => {
              const player = entry.player;
              if (player && player.destinyUserInfo) {
                const membershipId = player.destinyUserInfo.membershipId;

                // Filter out current player by membershipId
                if (membershipId !== playerMembershipId) {
                  const displayName =
                    player.destinyUserInfo.bungieGlobalDisplayName ||
                    player.destinyUserInfo.displayName ||
                    "Unknown";
                  const bungieGlobalDisplayNameCode =
                    player.destinyUserInfo.bungieGlobalDisplayNameCode;

                  if (membershipId) {
                    const existing = teammateCounts.get(membershipId);
                    if (existing) {
                      existing.count++;
                    } else {
                      teammateCounts.set(membershipId, {
                        displayName,
                        membershipId,
                        count: 1,
                        bungieGlobalDisplayNameCode,
                      });
                    }
                  }
                }
              }
            });
          }

          // Process character-specific data (emblems, weapon kills, etc.)
          // Check 67 moments from extended stats
          checkSixtySeven(
            getCharacterExtendedValue(charValues, "precisionKills"),
            "precisionKills",
            activity,
            charValues,
            sixtySevenCounts,
            sixtySevenActivities
          );
          checkSixtySeven(
            getCharacterExtendedValue(charValues, "orbsDropped"),
            "orbsDropped",
            activity,
            charValues,
            sixtySevenCounts,
            sixtySevenActivities
          );
          checkSixtySeven(
            getCharacterExtendedValue(charValues, "orbsGathered"),
            "orbsGathered",
            activity,
            charValues,
            sixtySevenCounts,
            sixtySevenActivities
          );
          checkSixtySeven(
            getCharacterExtendedValue(charValues, "weaponKillsGrenade"),
            "weaponKillsGrenade",
            activity,
            charValues,
            sixtySevenCounts,
            sixtySevenActivities
          );
          checkSixtySeven(
            getCharacterExtendedValue(charValues, "weaponKillsMelee"),
            "weaponKillsMelee",
            activity,
            charValues,
            sixtySevenCounts,
            sixtySevenActivities
          );
          checkSixtySeven(
            getCharacterExtendedValue(charValues, "weaponKillsSuper"),
            "weaponKillsSuper",
            activity,
            charValues,
            sixtySevenCounts,
            sixtySevenActivities
          );
          checkSixtySeven(
            getCharacterExtendedValue(charValues, "weaponKillsAbility"),
            "weaponKillsAbility",
            activity,
            charValues,
            sixtySevenCounts,
            sixtySevenActivities
          );

          // Track emblem usage for all characters (each character can have different emblem)
          const emblemHash = playerEntry.player?.emblemHash;
          if (emblemHash) {
            emblemCounts.set(
              emblemHash,
              (emblemCounts.get(emblemHash) || 0) + 1
            );
          }

          // Check if this is a PvP activity
          const isPvP = activity.activityDetails.modes.includes(5);

          // Weapon kills from characterValues.weapons (track for all characters)
          if (
            charValues.weapons &&
            Array.isArray(charValues.weapons) &&
            charValues.weapons.length > 0
          ) {
            charValues.weapons.forEach((weapon) => {
              const weaponHash = weapon.referenceId;
              if (!weaponHash) return;

              const kills = weapon.values?.uniqueWeaponKills?.basic?.value || 0;
              if (kills > 0) {
                weaponKills.set(
                  weaponHash,
                  (weaponKills.get(weaponHash) || 0) + kills
                );

                if (isPvP) {
                  pvpWeaponKills.set(
                    weaponHash,
                    (pvpWeaponKills.get(weaponHash) || 0) + kills
                  );
                }
              }
            });
          }

          // Ability kills from extendedValues (track for all characters)
          const superKills = getCharacterExtendedValue(
            charValues,
            "weaponKillsSuper"
          );
          if (superKills > 0) {
            abilityStats.superKills += superKills;
          }
          const grenadeKills = getCharacterExtendedValue(
            charValues,
            "weaponKillsGrenade"
          );
          if (grenadeKills > 0) {
            abilityStats.grenadeKills += grenadeKills;
          }
          const meleeKills = getCharacterExtendedValue(
            charValues,
            "weaponKillsMelee"
          );
          if (meleeKills > 0) {
            abilityStats.meleeKills += meleeKills;
          }
          const abilityKills = getCharacterExtendedValue(
            charValues,
            "weaponKillsAbility"
          );
          if (abilityKills > 0) {
            abilityStats.abilityKills += abilityKills;
          }
        });

        // Time of day stats
        const hour = activity.period.getHours();
        const dayOfWeek = activity.period.getDay();
        hourTimePlayed[hour] += timePlayed;
        dayOfWeekTimePlayed[dayOfWeek] += timePlayed;
      }
    });

    // Calculate derived stats
    // filteredActivities is already deduplicated, so grouped activities are also deduplicated
    const sortedByTimeInMode = Array.from(groupedByPrimaryMode.entries())
      .map(([mode, activities]) => ({
        mode,
        count: activities.length,
        timePlayedSeconds: getTotalTimePlayed(activities),
        modeName: activityModeNames[mode],
      }))
      .sort((a, b) => b.timePlayedSeconds - a.timePlayedSeconds);

    const hashedActs = Array.from(groupedByHash.entries()).map(
      ([hash, activities]) => ({
        hash,
        count: activities.length,
        timePlayedSeconds: getTotalTimePlayed(activities),
      })
    );

    const sortedByTimeInHash = hashedActs.sort(
      (a, b) => b.timePlayedSeconds - a.timePlayedSeconds
    );

    const topNModes = (n: number) => sortedByTimeInMode.slice(0, n);
    const topNActivitiesByPlaytime = (n: number) =>
      sortedByTimeInHash.slice(0, n);
    const topNActivitiesByRuns = (n: number) =>
      [...sortedByTimeInHash].sort((a, b) => b.count - a.count).slice(0, n);

    const mostPopularMonthData = Array.from(groupedByMonth.entries())
      .map(([month, activities]) => ({
        month,
        activities,
        timePlayedSeconds: getTotalTimePlayed(activities),
      }))
      .sort((a, b) => b.timePlayedSeconds - a.timePlayedSeconds)[0] ?? {
      month: 11,
      activities: [],
      timePlayedSeconds: 0,
    };

    // Calculate class stats
    // filteredActivities is already deduplicated, so class activities are also deduplicated
    const sortedClassEntries = Array.from(groupedByClass.entries())
      .map(([classType, activities]) => {
        const timePlayedSeconds = getTotalTimePlayed(activities);
        return [
          classType,
          {
            count: activities.length,
            timePlayedSeconds,
            percentTimePlayed: (100 * timePlayedSeconds) / totalStats.playTime,
          },
        ] as const;
      })
      .sort(([, a], [, b]) => b.timePlayedSeconds - a.timePlayedSeconds);

    const monthlyPlayTimeByDay = new Array(32).fill(0);
    mostPopularMonthData.activities.forEach(
      (activity: CommonDestinyActivity) => {
        const stats = getActivityStatsFromCommon(activity);
        monthlyPlayTimeByDay[activity.period.getDate()] +=
          stats.timePlayedSeconds;
      }
    );

    // Calculate fireteam stats
    if (activitiesWithPGCR > 0) {
      let totalSize = 0;
      fireteamSizeCounts.forEach((count, size) => {
        totalSize += size * count;
        fireteamStats.fireteamSizeDistribution.set(size, count);
      });
      fireteamStats.averageFireteamSize = totalSize / activitiesWithPGCR;

      let maxCount = 0;
      fireteamSizeCounts.forEach((count, size) => {
        if (count > maxCount) {
          maxCount = count;
          fireteamStats.mostCommonFireteamSize = size;
        }
      });
    }

    // Top weapons
    const topWeapons = Array.from(weaponKills.entries())
      .map(([hash, kills]) => ({ hash, kills }))
      .sort((a, b) => b.kills - a.kills)
      .slice(0, 10);

    // Top PvP weapons
    const topPvpWeapons = Array.from(pvpWeaponKills.entries())
      .map(([hash, kills]) => ({ hash, kills }))
      .sort((a, b) => b.kills - a.kills)
      .slice(0, 10);

    // Top teammates
    const allTeammates = Array.from(teammateCounts.values());
    const topTeammates = allTeammates
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(
        ({
          displayName,
          membershipId,
          count,
          bungieGlobalDisplayNameCode,
        }) => ({
          displayName,
          membershipId,
          activityCount: count,
          bungieGlobalDisplayNameCode,
        })
      );

    // Top emblems
    const topEmblems = Array.from(emblemCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hash, count]) => ({ hash, count }));

    // Most active hour and day (by time played)
    const maxHourTime = Math.max(...hourTimePlayed);
    const mostActiveHour =
      maxHourTime > 0 ? hourTimePlayed.indexOf(maxHourTime) : 12;
    const maxDayTime = Math.max(...dayOfWeekTimePlayed);
    const mostActiveDayOfWeek =
      maxDayTime > 0 ? dayOfWeekTimePlayed.indexOf(maxDayTime) : 0;

    // Least active hour and day (by time played)
    const minHourTime = Math.min(...hourTimePlayed.filter((time) => time > 0));
    const leastActiveHour =
      minHourTime > 0 ? hourTimePlayed.indexOf(minHourTime) : null;
    const minDayTime = Math.min(
      ...dayOfWeekTimePlayed.filter((time) => time > 0)
    );
    const leastActiveDayOfWeek =
      minDayTime > 0 ? dayOfWeekTimePlayed.indexOf(minDayTime) : null;

    // Total time for percentage calculations
    const totalTimeByHour = hourTimePlayed.reduce((sum, time) => sum + time, 0);
    const totalTimeByDay = dayOfWeekTimePlayed.reduce(
      (sum, time) => sum + time,
      0
    );

    // Find peak 3-hour activity window
    let peakWindowStart = 0;
    let peakWindowTime = 0;
    for (let i = 0; i < 24; i++) {
      const windowTime =
        hourTimePlayed[i] +
        hourTimePlayed[(i + 1) % 24] +
        hourTimePlayed[(i + 2) % 24];
      if (windowTime > peakWindowTime) {
        peakWindowTime = windowTime;
        peakWindowStart = i;
      }
    }

    return {
      topNModes,
      topNActivitiesByPlaytime,
      topNActivitiesByRuns,
      totalStats,
      longestStreak: {
        numDays: longestStreak.numDays,
        activityCount: longestStreak.activityCount,
        start: longestStreak.start!,
        end: longestStreak.end!,
      },
      mostPopularMonth: {
        id: mostPopularMonthData.month,
        count: mostPopularMonthData.activities.length,
        timePlayedSeconds: mostPopularMonthData.timePlayedSeconds,
        playtimeByDay: monthlyPlayTimeByDay,
      },
      sortedClassEntries,
      gambitStats: calculateGameStats(gambitGames),
      pvpStats: calculateGameStats(pvpGames),
      pvePvpSplit: {
        pve: groupedByMode.get(7)?.length ?? 0,
        pvp: groupedByMode.get(5)?.length ?? 0,
        ratio:
          (groupedByMode.get(7)?.length ?? 0) /
          (groupedByMode.get(5)?.length ?? 1),
      },
      fireteamStats: {
        ...fireteamStats,
        fireteamSizeDistribution: Array.from(
          fireteamStats.fireteamSizeDistribution.entries()
        ).map(([size, count]) => ({ size, count })),
      },
      weaponStats: {
        weaponKills,
        topWeapons,
      },
      pvpWeaponStats: {
        weaponKills: pvpWeaponKills,
        topWeapons: topPvpWeapons,
      },
      teammateStats: {
        teammates: topTeammates,
        totalCount: allTeammates.length,
      },
      abilityStats,
      timeOfDayStats: {
        mostActiveHour,
        mostActiveDayOfWeek,
        leastActiveHour,
        leastActiveDayOfWeek,
        mostActiveHourTime: maxHourTime,
        mostActiveDayTime: maxDayTime,
        leastActiveHourTime: minHourTime > 0 ? minHourTime : null,
        leastActiveDayTime: minDayTime > 0 ? minDayTime : null,
        totalTimeByHour,
        totalTimeByDay,
        peakWindowStart,
        peakWindowTime,
      },
      favoriteEmblems: topEmblems.length > 0 ? topEmblems : null,
      sixtySevenStats: {
        counts: sixtySevenCounts,
        totalCount: sixtySevenActivities.length,
        activities: sixtySevenActivities,
      },
      hasPGCRData: activities.some((a) => a.entries && a.entries.length > 0),
    };
  }, [activities, characterMap]);
}
