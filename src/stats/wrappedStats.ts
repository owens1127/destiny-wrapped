import { useMemo } from "react";
import {
  DestinyClass,
  DestinyHistoricalStatsPeriodGroup,
} from "bungie-net-core/models";
import { activityModeNames } from "@/config/modes";
import { getSeason, seasonWeights } from "@/config/seasons";
import { new2025Challenges } from "@/config/challenges";
import {
  getActivityValue,
  getActivityStats,
  isActivityWin,
  isActivityCompleted,
} from "./activityUtils";
import { groupActivitiesBy } from "./activityGrouping";
import { usePGCRData } from "./pgcrData";

/**
 * Calculate all wrapped stats from activities
 */
export function useWrappedStats(
  activities: (DestinyHistoricalStatsPeriodGroup & {
    characterId: string;
  })[],
  characterMap: Record<string, DestinyClass>
) {
  const { pgcrData, isLoadingPGCRs } = usePGCRData(activities);
  return useMemo(() => {
    // Filter out activities with more than 18 players
    const filteredActivities = activities.filter((activity) => {
      const pgcr = pgcrData.get(activity.activityDetails.instanceId);
      if (pgcr) {
        const playerCount = pgcr.entries?.length || 0;
        return playerCount <= 18;
      }
      // If no PGCR data, include it (can't determine player count)
      return true;
    });

    // Group activities by various dimensions
    const groupedByMode = groupActivitiesBy(
      filteredActivities,
      (activity) => activity.activityDetails.mode
    );
    const groupedByPrimaryMode = groupActivitiesBy(
      filteredActivities,
      (activity) => activity.activityDetails.mode
    );
    const groupedByMonth = groupActivitiesBy(filteredActivities, (activity) =>
      new Date(activity.period).getMonth()
    );
    const groupedByHash = groupActivitiesBy(
      filteredActivities,
      (activity) => activity.activityDetails.directorActivityHash
    );
    const groupedByClass = groupActivitiesBy(
      filteredActivities,
      (activity) => characterMap[activity.characterId] ?? 3
    );
    const groupedBySeason = groupActivitiesBy(filteredActivities, (activity) =>
      getSeason(new Date(activity.period))
    );

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

    const newRaidActivitiesByHash = new Map<
      number,
      DestinyHistoricalStatsPeriodGroup[]
    >();
    const newDungeonActivitiesByHash = new Map<
      number,
      DestinyHistoricalStatsPeriodGroup[]
    >();

    const gambitGames: DestinyHistoricalStatsPeriodGroup[] = [];
    const pvpGames: DestinyHistoricalStatsPeriodGroup[] = [];

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
      type: "kills" | "assists" | "deaths" | "precisionKills" | "opponentsDefeated" | "score" | "orbsDropped" | "orbsGathered" | "standing" | "weaponKillsGrenade" | "weaponKillsMelee" | "weaponKillsSuper" | "weaponKillsAbility";
      activity: DestinyHistoricalStatsPeriodGroup & { characterId: string };
    }> = [];

    let activitiesWithPGCR = 0;

    // Process all activities
    filteredActivities.forEach((activity) => {
      const stats = getActivityStats(activity);
      totalStats.playTime += stats.timePlayedSeconds;
      totalStats.kills += stats.kills;
      totalStats.deaths += stats.deaths;
      totalStats.assists += stats.assists;

      // Track 67 meme moments - check stats from activity history
      const opponentsDefeated = getActivityValue(activity, "opponentsDefeated");
      const score = getActivityValue(activity, "score");
      const standing = getActivityValue(activity, "standing");

      if (stats.kills === 67) {
        sixtySevenCounts.kills++;
        sixtySevenActivities.push({ type: "kills", activity });
      }
      if (stats.assists === 67) {
        sixtySevenCounts.assists++;
        sixtySevenActivities.push({ type: "assists", activity });
      }
      if (stats.deaths === 67) {
        sixtySevenCounts.deaths++;
        sixtySevenActivities.push({ type: "deaths", activity });
      }
      if (opponentsDefeated === 67) {
        sixtySevenCounts.opponentsDefeated++;
        sixtySevenActivities.push({ type: "opponentsDefeated", activity });
      }
      if (score === 67) {
        sixtySevenCounts.score++;
        sixtySevenActivities.push({ type: "score", activity });
      }
      if (standing === 67) {
        sixtySevenCounts.standing++;
        sixtySevenActivities.push({ type: "standing", activity });
      }

      // Group by mode (all modes)
      activity.activityDetails.modes.forEach((mode) => {
        const existing = groupedByMode.get(mode);
        if (!existing) {
          groupedByMode.set(mode, [activity]);
        } else {
          existing.push(activity);
        }
      });

      // Group by primary mode
      const mode = activity.activityDetails.mode;
      const existingModeGroup = groupedByPrimaryMode.get(mode);
      if (!existingModeGroup) {
        groupedByPrimaryMode.set(mode, [activity]);
      } else {
        existingModeGroup.push(activity);
      }

      // Group by month
      const month = new Date(activity.period).getMonth();
      const existingMonthGroup = groupedByMonth.get(month);
      if (!existingMonthGroup) {
        groupedByMonth.set(month, [activity]);
      } else {
        existingMonthGroup.push(activity);
      }

      // Group by hash
      const hash = activity.activityDetails.directorActivityHash;
      const existingHashGroup = groupedByHash.get(hash);
      if (!existingHashGroup) {
        groupedByHash.set(hash, [activity]);
      } else {
        existingHashGroup.push(activity);
      }

      // Group by class
      const characterClass = characterMap[activity.characterId] ?? 3;
      const existingClassGroup = groupedByClass.get(characterClass);
      if (!existingClassGroup) {
        groupedByClass.set(characterClass, [activity]);
      } else {
        existingClassGroup.push(activity);
      }

      // Group by season
      const season = getSeason(new Date(activity.period));
      const existingSeasonGroup = groupedBySeason.get(season);
      if (!existingSeasonGroup) {
        groupedBySeason.set(season, [activity]);
      } else {
        existingSeasonGroup.push(activity);
      }

      // Track raids and dungeons
      const raidChallenge = new2025Challenges.raids.find((r) => r.hash === hash);
      const dungeonChallenge = new2025Challenges.dungeons.find(
        (d) => d.hash === hash
      );

      if (raidChallenge) {
        const existing = newRaidActivitiesByHash.get(hash);
        if (!existing) {
          newRaidActivitiesByHash.set(hash, [activity]);
        } else {
          existing.push(activity);
        }
      } else if (dungeonChallenge) {
        const existing = newDungeonActivitiesByHash.get(hash);
        if (!existing) {
          newDungeonActivitiesByHash.set(hash, [activity]);
        } else {
          existing.push(activity);
        }
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
          if (longestStreak.currentStart!.getTime() === date.getTime()) {
            longestStreak.currentActivityCount++;
          } else if (
            longestStreak.currentStart!.getTime() ===
            date.getTime() + 86_400_000
          ) {
            longestStreak.currentActivityCount++;
            longestStreak.currentDays++;
            longestStreak.currentStart = date;
          } else {
            longestStreak.currentDays = 1;
            longestStreak.currentActivityCount = 1;
            longestStreak.currentStart = date;
            longestStreak.currentEnd = date;
          }

          if (longestStreak.currentDays > longestStreak.numDays) {
            longestStreak.numDays = longestStreak.currentDays;
            longestStreak.activityCount = longestStreak.currentActivityCount;
            longestStreak.start = longestStreak.currentStart;
            longestStreak.end = longestStreak.currentEnd;
          }
        }
      }

      // Process PGCR data if available
      const pgcr = pgcrData.get(activity.activityDetails.instanceId);
      if (pgcr) {
        activitiesWithPGCR++;

        // Fireteam stats
        const entries = pgcr.entries || [];
        const playerCount = entries.length;
        const timePlayed = getActivityValue(activity, "timePlayedSeconds");
        
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
        
        if (playerCount > fireteamStats.largestFireteamSize) {
          fireteamStats.largestFireteamSize = playerCount;
        }

        // Find current player's entry
        const currentPlayerEntry = entries.find(
          (entry) => entry.characterId === activity.characterId
        );

        // Track teammates
        entries.forEach((entry) => {
          if (entry.characterId !== activity.characterId) {
            const player = entry.player;
            if (player && player.destinyUserInfo) {
              const membershipId = player.destinyUserInfo.membershipId;
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

        if (currentPlayerEntry) {
          // Check 67 moments from extended stats
          if (currentPlayerEntry.extended?.values) {
            const extendedValues = currentPlayerEntry.extended.values;
            const precisionKills = extendedValues.precisionKills?.basic?.value ?? 0;
            const orbsDropped = extendedValues.orbsDropped?.basic?.value ?? 0;
            const orbsGathered = extendedValues.orbsGathered?.basic?.value ?? 0;
            const weaponKillsGrenade = extendedValues.weaponKillsGrenade?.basic?.value ?? 0;
            const weaponKillsMelee = extendedValues.weaponKillsMelee?.basic?.value ?? 0;
            const weaponKillsSuper = extendedValues.weaponKillsSuper?.basic?.value ?? 0;
            const weaponKillsAbility = extendedValues.weaponKillsAbility?.basic?.value ?? 0;

            if (precisionKills === 67) {
              sixtySevenCounts.precisionKills++;
              sixtySevenActivities.push({ type: "precisionKills", activity });
            }
            if (orbsDropped === 67) {
              sixtySevenCounts.orbsDropped++;
              sixtySevenActivities.push({ type: "orbsDropped", activity });
            }
            if (orbsGathered === 67) {
              sixtySevenCounts.orbsGathered++;
              sixtySevenActivities.push({ type: "orbsGathered", activity });
            }
            if (weaponKillsGrenade === 67) {
              sixtySevenCounts.weaponKillsGrenade++;
              sixtySevenActivities.push({ type: "weaponKillsGrenade", activity });
            }
            if (weaponKillsMelee === 67) {
              sixtySevenCounts.weaponKillsMelee++;
              sixtySevenActivities.push({ type: "weaponKillsMelee", activity });
            }
            if (weaponKillsSuper === 67) {
              sixtySevenCounts.weaponKillsSuper++;
              sixtySevenActivities.push({ type: "weaponKillsSuper", activity });
            }
            if (weaponKillsAbility === 67) {
              sixtySevenCounts.weaponKillsAbility++;
              sixtySevenActivities.push({ type: "weaponKillsAbility", activity });
            }
          }

          // Track emblem usage
          const emblemHash = currentPlayerEntry.player?.emblemHash;
          if (emblemHash) {
            emblemCounts.set(
              emblemHash,
              (emblemCounts.get(emblemHash) || 0) + 1
            );
          }

          // Check if this is a PvP activity
          const isPvP = activity.activityDetails.modes.includes(5);

          // Weapon kills from extended stats
          const extended = currentPlayerEntry.extended;
          if (
            extended?.weapons &&
            Array.isArray(extended.weapons) &&
            extended.weapons.length > 0
          ) {
            extended.weapons.forEach((weapon) => {
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

          // Ability kills from extended.values
          const extendedValues = extended?.values || {};
          if (extendedValues.weaponKillsSuper?.basic?.value) {
            abilityStats.superKills +=
              extendedValues.weaponKillsSuper.basic.value;
          }
          if (extendedValues.weaponKillsGrenade?.basic?.value) {
            abilityStats.grenadeKills +=
              extendedValues.weaponKillsGrenade.basic.value;
          }
          if (extendedValues.weaponKillsMelee?.basic?.value) {
            abilityStats.meleeKills +=
              extendedValues.weaponKillsMelee.basic.value;
          }
          if (extendedValues.weaponKillsAbility?.basic?.value) {
            abilityStats.abilityKills +=
              extendedValues.weaponKillsAbility.basic.value;
          }
        }

        // Time of day stats
        const date = new Date(activity.period);
        const hour = date.getHours();
        const dayOfWeek = date.getDay();
        hourTimePlayed[hour] += timePlayed;
        dayOfWeekTimePlayed[dayOfWeek] += timePlayed;
      }
    });

    // Calculate derived stats
    const sortedByTimeInMode = Array.from(groupedByPrimaryMode.entries())
      .sort(
        ([, a], [, b]) =>
          b.reduce(
            (acc, e) => acc + getActivityValue(e, "timePlayedSeconds"),
            0
          ) -
          a.reduce(
            (acc, e) => acc + getActivityValue(e, "timePlayedSeconds"),
            0
          )
      )
      .map(([mode, activities]) => ({
        mode,
        count: activities.length,
        timePlayedSeconds: activities.reduce(
          (acc, e) => acc + getActivityValue(e, "timePlayedSeconds"),
          0
        ),
        modeName: activityModeNames[mode],
      }));

    const hashedActs = Array.from(groupedByHash.entries()).map(
      ([hash, activities]) => ({
        hash,
        count: activities.length,
        timePlayedSeconds: activities.reduce(
          (acc, e) => acc + getActivityValue(e, "timePlayedSeconds"),
          0
        ),
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

    const [mostPopularMonthId, mostPopularMonthEntries] = Array.from(
      groupedByMonth.entries()
    ).sort(
      ([, a], [, b]) =>
        b.reduce(
          (acc, e) => acc + getActivityValue(e, "timePlayedSeconds"),
          0
        ) -
        a.reduce(
          (acc, e) => acc + getActivityValue(e, "timePlayedSeconds"),
          0
        )
    )[0] ?? [11, []];

    const sortedClassEntries = Array.from(groupedByClass.entries())
      .map(([classType, activities]) => {
        const timePlayedSeconds = activities.reduce(
          (acc, e) => acc + getActivityValue(e, "timePlayedSeconds"),
          0
        );
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

    const [leastPopularSeasonName, leastPopularSeasonActs] = Array.from(
      groupedBySeason.entries()
    ).sort(
      ([aName, a], [bName, b]) =>
        a.reduce(
          (acc, e) => acc + getActivityValue(e, "timePlayedSeconds"),
          0
        ) *
          seasonWeights[aName] -
        b.reduce(
          (acc, e) => acc + getActivityValue(e, "timePlayedSeconds"),
          0
        ) *
          seasonWeights[bName]
    )[0];

    const monthlyPlayTimeByDay = new Array(32).fill(0);
    mostPopularMonthEntries.forEach((entry) => {
      monthlyPlayTimeByDay[new Date(entry.period).getDate()] +=
        getActivityValue(entry, "timePlayedSeconds");
    });

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
    const minHourTime = Math.min(...hourTimePlayed.filter(time => time > 0));
    const leastActiveHour = minHourTime > 0 
      ? hourTimePlayed.indexOf(minHourTime) 
      : null;
    const minDayTime = Math.min(...dayOfWeekTimePlayed.filter(time => time > 0));
    const leastActiveDayOfWeek = minDayTime > 0
      ? dayOfWeekTimePlayed.indexOf(minDayTime)
      : null;
    
    // Total time for percentage calculations
    const totalTimeByHour = hourTimePlayed.reduce((sum, time) => sum + time, 0);
    const totalTimeByDay = dayOfWeekTimePlayed.reduce((sum, time) => sum + time, 0);
    
    // Find peak 3-hour activity window
    let peakWindowStart = 0;
    let peakWindowTime = 0;
    for (let i = 0; i < 24; i++) {
      const windowTime = hourTimePlayed[i] + 
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
        id: mostPopularMonthId,
        count: mostPopularMonthEntries.length,
        timePlayedSeconds: mostPopularMonthEntries.reduce(
          (acc, e) => acc + getActivityValue(e, "timePlayedSeconds"),
          0
        ),
        playtimeByDay: monthlyPlayTimeByDay,
      },
      leastPopularSeason: {
        name: leastPopularSeasonName,
        count: leastPopularSeasonActs.length,
        timePlayedSeconds: leastPopularSeasonActs.reduce(
          (acc, e) => acc + getActivityValue(e, "timePlayedSeconds"),
          0
        ),
      },
      sortedClassEntries,
      newDungeonActivities: Object.fromEntries(
        new2025Challenges.dungeons.map((dungeon) => {
          const activities = newDungeonActivitiesByHash.get(dungeon.hash) || [];
          return [
            dungeon.hash,
            {
              name: dungeon.name,
              count: activities.length,
              completed: activities.filter(isActivityCompleted).length,
              timePlayed: activities.reduce(
                (acc, e) => acc + getActivityValue(e, "timePlayedSeconds"),
                0
              ),
            },
          ];
        })
      ),
      newRaidActivities: Object.fromEntries(
        new2025Challenges.raids.map((raid) => {
          const activities = newRaidActivitiesByHash.get(raid.hash) || [];
          return [
            raid.hash,
            {
              name: raid.name,
              count: activities.length,
              completed: activities.filter(isActivityCompleted).length,
              timePlayed: activities.reduce(
                (acc, e) => acc + getActivityValue(e, "timePlayedSeconds"),
                0
              ),
            },
          ];
        })
      ),
      gambitStats: {
        games: gambitGames.length,
        wins: gambitGames.filter(isActivityWin).length,
        kills: gambitGames.reduce(
          (acc, e) => acc + getActivityValue(e, "kills"),
          0
        ),
        deaths: gambitGames.reduce(
          (acc, e) => acc + getActivityValue(e, "deaths"),
          0
        ),
        assists: gambitGames.reduce(
          (acc, e) => acc + getActivityValue(e, "assists"),
          0
        ),
        timePlayed: gambitGames.reduce(
          (acc, e) => acc + getActivityValue(e, "timePlayedSeconds"),
          0
        ),
      },
      pvpStats: {
        games: pvpGames.length,
        wins: pvpGames.filter(isActivityWin).length,
        kills: pvpGames.reduce(
          (acc, e) => acc + getActivityValue(e, "kills"),
          0
        ),
        deaths: pvpGames.reduce(
          (acc, e) => acc + getActivityValue(e, "deaths"),
          0
        ),
        assists: pvpGames.reduce(
          (acc, e) => acc + getActivityValue(e, "assists"),
          0
        ),
        timePlayed: pvpGames.reduce(
          (acc, e) => acc + getActivityValue(e, "timePlayedSeconds"),
          0
        ),
      },
      pvePvpSplit: {
        pve: groupedByMode.get(7)?.length ?? 0,
        pvp: groupedByMode.get(5)?.length ?? 0,
        ratio:
          (groupedByMode.get(7)?.length ?? 0) /
          (groupedByMode.get(5)?.length ?? 1),
      },
      fireteamStats: {
        ...fireteamStats,
        fireteamSizeDistribution: Array.from(fireteamStats.fireteamSizeDistribution.entries()).map(([size, count]) => ({ size, count })),
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
      hasPGCRData: pgcrData.size > 0,
      isLoadingPGCRs,
    };
  }, [activities, characterMap, pgcrData, isLoadingPGCRs]);
}
