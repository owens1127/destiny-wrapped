import { useMemo, useEffect, useState } from "react";
import {
  DestinyActivityModeType,
  DestinyClass,
  DestinyHistoricalStatsPeriodGroup,
  DestinyPostGameCarnageReportData,
} from "bungie-net-core/models";
import { getPGCRs } from "@/lib/idb";
import { activityModeNames } from "@/lib/modes";
import { getSeason, seasonWeights } from "@/lib/seasons";
import { new2025Challenges } from "@/lib/challenges";

export const useEnhancedWrappedStats = (
  activities: (DestinyHistoricalStatsPeriodGroup & {
    characterId: string;
  })[],
  characterMap: Record<string, DestinyClass>
) => {
  const [pgcrData, setPgcrData] = useState<
    Map<string, DestinyPostGameCarnageReportData>
  >(new Map());
  const [isLoadingPGCRs, setIsLoadingPGCRs] = useState(true);

  useEffect(() => {
    const loadPGCRs = async () => {
      try {
        setIsLoadingPGCRs(true);
        const activityIds = activities.map((a) => a.activityDetails.instanceId);
        const pgcrs = await getPGCRs(activityIds);
        setPgcrData(pgcrs);
      } catch (error) {
        console.error("Failed to load PGCRs:", error);
      } finally {
        setIsLoadingPGCRs(false);
      }
    };

    loadPGCRs();

    // Listen for PGCR events to refresh data
    const handlePGCRsChanged = () => {
      loadPGCRs();
    };

    window.addEventListener("pgcrs-cleared", handlePGCRsChanged);
    window.addEventListener("pgcrs-stored", handlePGCRsChanged);

    return () => {
      window.removeEventListener("pgcrs-cleared", handlePGCRsChanged);
      window.removeEventListener("pgcrs-stored", handlePGCRsChanged);
    };
  }, [activities]);

  return useMemo(() => {
    // Base stats (always calculated)
    const groupedByMode = new Map<
      DestinyActivityModeType,
      DestinyHistoricalStatsPeriodGroup[]
    >();
    const groupedByPrimaryMode = new Map<
      DestinyActivityModeType,
      DestinyHistoricalStatsPeriodGroup[]
    >();
    const groupedByMonth = new Map<
      number,
      DestinyHistoricalStatsPeriodGroup[]
    >();
    const groupedByHash = new Map<
      number,
      DestinyHistoricalStatsPeriodGroup[]
    >();
    const groupedByClass = new Map<
      DestinyClass,
      DestinyHistoricalStatsPeriodGroup[]
    >();
    const groupedBySeason = new Map<
      keyof typeof seasonWeights,
      DestinyHistoricalStatsPeriodGroup[]
    >();

    const totalStats = {
      playTime: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
      count: activities.length,
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

    // Track each raid and dungeon separately
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

    // Enhanced stats (only calculated when PGCR data is available)
    const fireteamStats = {
      soloActivities: 0,
      teamActivities: 0,
      averageFireteamSize: 0,
      mostCommonFireteamSize: 0,
    };

    const weaponKills = new Map<number, number>();
    const pvpWeaponKills = new Map<number, number>();
    const abilityStats = {
      superKills: 0,
      grenadeKills: 0,
      meleeKills: 0,
    };

    const hourCounts = new Array(24).fill(0);
    const dayOfWeekCounts = new Array(7).fill(0);
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
    };

    let activitiesWithPGCR = 0;

    activities.forEach((activity) => {
      // Base stats (always calculated)
      const timePlayedSeconds =
        activity.values["timePlayedSeconds"]?.basic.value ?? 0;
      totalStats.playTime += timePlayedSeconds;
      const kills = activity.values["kills"]?.basic.value ?? 0;
      const deaths = activity.values["deaths"]?.basic.value ?? 0;
      const assists = activity.values["assists"]?.basic.value ?? 0;

      totalStats.kills += kills;
      totalStats.deaths += deaths;
      totalStats.assists += assists;

      // Track 67 meme moments - count occurrences
      if (kills === 67) {
        sixtySevenCounts.kills++;
      }
      if (assists === 67) {
        sixtySevenCounts.assists++;
      }
      if (deaths === 67) {
        sixtySevenCounts.deaths++;
      }

      // Group by mode
      activity.activityDetails.modes.forEach((mode) => {
        const existing = groupedByMode.get(mode);
        if (!existing) {
          groupedByMode.set(mode, [activity]);
        } else {
          groupedByMode.get(mode)!.push(activity);
        }
      });

      // Group by primary mode
      const mode = activity.activityDetails.mode;
      const existingModeGroup = groupedByPrimaryMode.get(mode);
      if (!existingModeGroup) {
        groupedByPrimaryMode.set(mode, [activity]);
      } else {
        groupedByPrimaryMode.get(mode)!.push(activity);
      }

      // Group by month
      const month = new Date(activity.period).getMonth();
      const existingMonthGroup = groupedByMonth.get(month);
      if (!existingMonthGroup) {
        groupedByMonth.set(month, [activity]);
      } else {
        groupedByMonth.get(month)!.push(activity);
      }

      // Group by hash
      const hash = activity.activityDetails.directorActivityHash;
      const existingHashGroup = groupedByHash.get(hash);
      if (!existingHashGroup) {
        groupedByHash.set(hash, [activity]);
      } else {
        groupedByHash.get(hash)!.push(activity);
      }

      // Group by class
      const characterClass = characterMap[activity.characterId] ?? 3;
      const existingClassGroup = groupedByClass.get(characterClass);
      if (!existingClassGroup) {
        groupedByClass.set(characterClass, [activity]);
      } else {
        groupedByClass.get(characterClass)!.push(activity);
      }

      // Group by season
      const season = getSeason(new Date(activity.period));
      const existingSeasonGroup = groupedBySeason.get(season);
      if (!existingSeasonGroup) {
        groupedBySeason.set(season, [activity]);
      } else {
        groupedBySeason.get(season)!.push(activity);
      }

      // new raid/dungeon activities - track by individual hash
      const raidChallenge = new2025Challenges.raids.find(
        (r) => r.hash === hash
      );
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

      // gambit games
      if (mode === 63) {
        gambitGames.push(activity);
      }

      if (activity.activityDetails.modes.includes(5)) {
        pvpGames.push(activity);
      }

      // longest streak
      if (timePlayedSeconds > 0) {
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

      // Enhanced stats (only when PGCR data is available)
      const pgcr = pgcrData.get(activity.activityDetails.instanceId);
      if (pgcr) {
        activitiesWithPGCR++;

        // Fireteam stats
        const entries = pgcr.entries || [];
        const playerCount = entries.length;
        fireteamSizeCounts.set(
          playerCount,
          (fireteamSizeCounts.get(playerCount) || 0) + 1
        );

        if (playerCount === 1) {
          fireteamStats.soloActivities++;
        } else {
          fireteamStats.teamActivities++;
        }

        // Find current player's entry
        const currentPlayerEntry = entries.find(
          (entry) => entry.characterId === activity.characterId
        );

        // Track teammates (all other players in the activity)
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

              // Check for kills in the weapon values
              // The field name is "uniqueWeaponKills" based on the PGCR structure
              const kills = weapon.values?.uniqueWeaponKills?.basic?.value || 0;
              if (kills > 0) {
                // Track all weapon kills
                weaponKills.set(
                  weaponHash,
                  (weaponKills.get(weaponHash) || 0) + kills
                );

                // Track PvP weapon kills separately
                if (isPvP) {
                  pvpWeaponKills.set(
                    weaponHash,
                    (pvpWeaponKills.get(weaponHash) || 0) + kills
                  );
                }
              }
            });
          }

          // Ability kills from extended.values (not currentPlayerEntry.values)
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
        }

        // Time of day stats
        const date = new Date(activity.period);
        const hour = date.getHours();
        const dayOfWeek = date.getDay();
        hourCounts[hour]++;
        dayOfWeekCounts[dayOfWeek]++;
      }
    });

    // Calculate base stats
    const sortedByTimeInMode = Array.from(groupedByPrimaryMode.entries())
      .sort(
        ([, a], [, b]) =>
          b.reduce(
            (acc, e) => acc + (e.values["timePlayedSeconds"]?.basic.value ?? 0),
            0
          ) -
          a.reduce(
            (acc, e) => acc + (e.values["timePlayedSeconds"]?.basic.value ?? 0),
            0
          )
      )
      .map(([mode, activities]) => ({
        mode,
        count: activities.length,
        timePlayedSeconds: activities.reduce(
          (acc, e) => acc + (e.values["timePlayedSeconds"]?.basic.value ?? 0),
          0
        ),
        modeName: activityModeNames[mode],
      }));

    const hashedActs = Array.from(groupedByHash.entries()).map(
      ([hash, activities]) => ({
        hash,
        count: activities.length,
        timePlayedSeconds: activities.reduce(
          (acc, e) => acc + (e.values["timePlayedSeconds"]?.basic.value ?? 0),
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
          (acc, e) => acc + (e.values["timePlayedSeconds"]?.basic.value ?? 0),
          0
        ) -
        a.reduce(
          (acc, e) => acc + (e.values["timePlayedSeconds"]?.basic.value ?? 0),
          0
        )
    )[0] ?? [11, []];

    const sortedClassEntries = Array.from(groupedByClass.entries())
      .map(([classType, activities]) => {
        const timePlayedSeconds = activities.reduce(
          (acc, e) => acc + (e.values["timePlayedSeconds"]?.basic.value ?? 0),
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
          (acc, e) => acc + (e.values["timePlayedSeconds"]?.basic.value ?? 0),
          0
        ) *
          seasonWeights[aName] -
        b.reduce(
          (acc, e) => acc + (e.values["timePlayedSeconds"]?.basic.value ?? 0),
          0
        ) *
          seasonWeights[bName]
    )[0];

    const monthlyPlayTimeByDay = new Array(32).fill(0);
    mostPopularMonthEntries.forEach((entry) => {
      monthlyPlayTimeByDay[new Date(entry.period).getDate()] +=
        entry.values["timePlayedSeconds"]?.basic.value ?? 0;
    });

    // Calculate enhanced stats
    if (activitiesWithPGCR > 0) {
      let totalSize = 0;
      fireteamSizeCounts.forEach((count, size) => {
        totalSize += size * count;
      });
      fireteamStats.averageFireteamSize = totalSize / activitiesWithPGCR;

      // Most common fireteam size
      let maxCount = 0;
      fireteamSizeCounts.forEach((count, size) => {
        if (count > maxCount) {
          maxCount = count;
          fireteamStats.mostCommonFireteamSize = size;
        }
      });
    }

    // Top weapons (all activities)
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

    const totalTeammateCount = allTeammates.length;

    // Top 3 emblems (most used)
    const topEmblems = Array.from(emblemCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hash, count]) => ({ hash, count }));

    // Most active hour (default to 12 PM if no data)
    const maxHourCount = Math.max(...hourCounts);
    const mostActiveHour =
      maxHourCount > 0 ? hourCounts.indexOf(maxHourCount) : 12;
    const maxDayCount = Math.max(...dayOfWeekCounts);
    const mostActiveDayOfWeek =
      maxDayCount > 0 ? dayOfWeekCounts.indexOf(maxDayCount) : 0;

    return {
      // Base stats (always available)
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
          (acc, e) => acc + (e.values["timePlayedSeconds"]?.basic.value ?? 0),
          0
        ),
        playtimeByDay: monthlyPlayTimeByDay,
      },
      leastPopularSeason: {
        name: leastPopularSeasonName,
        count: leastPopularSeasonActs.length,
        timePlayedSeconds: leastPopularSeasonActs.reduce(
          (acc, e) => acc + (e.values["timePlayedSeconds"]?.basic.value ?? 0),
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
              completed: activities.filter(
                (a) =>
                  a.values["completed"]?.basic.value === 1 &&
                  a.values["completionReason"]?.basic.value === 0
              ).length,
              timePlayed: activities.reduce(
                (acc, e) =>
                  (e.values["timePlayedSeconds"]?.basic.value ?? 0) + acc,
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
              completed: activities.filter(
                (a) =>
                  a.values["completed"]?.basic.value === 1 &&
                  a.values["completionReason"]?.basic.value === 0
              ).length,
              timePlayed: activities.reduce(
                (acc, e) =>
                  (e.values["timePlayedSeconds"]?.basic.value ?? 0) + acc,
                0
              ),
            },
          ];
        })
      ),
      gambitStats: {
        games: gambitGames.length,
        wins: gambitGames.filter(
          (a) =>
            a.values["completed"]?.basic.value === 1 &&
            a.values["standing"]?.basic.value === 0
        ).length,
        kills: gambitGames.reduce(
          (acc, e) => (e.values["kills"]?.basic.value ?? 0) + acc,
          0
        ),
        deaths: gambitGames.reduce(
          (acc, e) => (e.values["deaths"]?.basic.value ?? 0) + acc,
          0
        ),
        assists: gambitGames.reduce(
          (acc, e) => (e.values["assists"]?.basic.value ?? 0) + acc,
          0
        ),
        timePlayed: gambitGames.reduce(
          (acc, e) => (e.values["timePlayedSeconds"]?.basic.value ?? 0) + acc,
          0
        ),
      },
      pvpStats: {
        games: pvpGames.length,
        wins: pvpGames.filter(
          (a) =>
            a.values["completed"]?.basic.value === 1 &&
            a.values["standing"]?.basic.value === 0
        ).length,
        kills: pvpGames.reduce(
          (acc, e) => (e.values["kills"]?.basic.value ?? 0) + acc,
          0
        ),
        deaths: pvpGames.reduce(
          (acc, e) => (e.values["deaths"]?.basic.value ?? 0) + acc,
          0
        ),
        assists: pvpGames.reduce(
          (acc, e) => (e.values["assists"]?.basic.value ?? 0) + acc,
          0
        ),
        timePlayed: pvpGames.reduce(
          (acc, e) => (e.values["timePlayedSeconds"]?.basic.value ?? 0) + acc,
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
      // Enhanced stats (always returned, but may be empty if no PGCR data)
      fireteamStats,
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
        totalCount: totalTeammateCount,
      },
      abilityStats,
      timeOfDayStats: {
        mostActiveHour,
        mostActiveDayOfWeek,
      },
      favoriteEmblems: topEmblems.length > 0 ? topEmblems : null,
      sixtySevenStats: {
        counts: sixtySevenCounts,
        totalKills: totalStats.kills,
        totalAssists: totalStats.assists,
        totalDeaths: totalStats.deaths,
      },
      hasPGCRData: pgcrData.size > 0,
      isLoadingPGCRs,
    };
  }, [activities, characterMap, pgcrData, isLoadingPGCRs]);
};
