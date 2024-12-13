import {
  DestinyActivityModeType,
  DestinyClass,
  DestinyHistoricalStatsPeriodGroup,
} from "bungie-net-core/models";
import { memo, useMemo } from "react";
import { DestinyWrappedCard } from "./DestinyWrappedCard";
import {
  activityModeNames,
  destinyClassName,
  monthNames,
  newDungeonHashes,
  newRaidHashes,
} from "@/lib/maps";
import { useGetActivityDefinition } from "@/hooks/useGetActivityDefinition";

export const DestinyWrapped = memo(
  (props: {
    activities: (DestinyHistoricalStatsPeriodGroup & {
      characterId: string;
    })[];
    characterMap: Record<string, DestinyClass>;
  }) => {
    const getActivityDefinition = useGetActivityDefinition();
    const {
      topNModes,
      topNActivities,
      totalStats,
      longestStreak,
      mostPopularMonth,
      sortedClassEntries,
      newDungeonActivities,
      newRaidActivities,
      shatteredThroneStats,
    } = useStats(props.activities, props.characterMap);

    const topFiveModes = topNModes(5);
    const topTenActivities = topNActivities(10);

    if (!props.activities.length) {
      return ":(";
    }

    return (
      <main className="min-h-screen container mx-auto">
        <h1 className="text-center text-2xl sm:text-4xl">
          Destiny Wrapped 2024
        </h1>
        <div className="grid gap-4 grid-cols-1 my-8 mx-auto w-[20rem] sm:w-[500] lg:w-[600]">
          <DestinyWrappedCard title="Your Top Categories">
            <ol>
              {topFiveModes.map(
                ({ mode, modeName, count, timePlayedSeconds }) => (
                  <li key={mode}>
                    {`${modeName} ${formatHours(
                      timePlayedSeconds
                    )} (${count} activities)`}
                  </li>
                )
              )}
            </ol>
            <div>
              {`${(
                (100 * topFiveModes[0].timePlayedSeconds) /
                totalStats.playTime
              ).toFixed(2)}% of your time was spent in ${
                topFiveModes[0].modeName
              }`}
            </div>
          </DestinyWrappedCard>
          <DestinyWrappedCard title="You launched these activities the most">
            <ol>
              {topTenActivities.map(({ hash, count, timePlayedSeconds }) => (
                <li key={hash}>
                  {`${
                    (getActivityDefinition(hash)?.displayProperties.name ??
                      "Unknown") +
                    ((getActivityDefinition(
                      hash
                    )?.displayProperties.description.split(" ").length ??
                      Infinity) < 4
                      ? ": " +
                        getActivityDefinition(hash)!.displayProperties
                          .description
                      : "")
                  } ${formatHours(timePlayedSeconds)} (${count} activities)`}
                </li>
              ))}{" "}
            </ol>
          </DestinyWrappedCard>
          <DestinyWrappedCard title="Your Dedication was True">
            <div>
              <div>{longestStreak.numDays} days in a row</div>
              <div>{longestStreak.activityCount} activities</div>
              <div>
                {`${longestStreak.start!.toLocaleDateString()} - ${longestStreak.end!.toLocaleDateString()}`}
              </div>
            </div>
          </DestinyWrappedCard>
          <DestinyWrappedCard title="Your Most Active Months">
            <div>
              <div>{monthNames[mostPopularMonth.id]}</div>
              <div>{formatHours(mostPopularMonth.timePlayedSeconds)}</div>
              <div>
                {`${(
                  (100 * mostPopularMonth.timePlayedSeconds) /
                  totalStats.playTime
                ).toFixed(2)}% of your yearly play time`}
              </div>
              <div>{mostPopularMonth.count} activities played</div>
            </div>
          </DestinyWrappedCard>
          <DestinyWrappedCard title="Your class choice says a lot about you">
            <div>
              {sortedClassEntries.map(
                ([
                  classType,
                  { count, timePlayedSeconds, percentTimePlayed },
                ]) => (
                  <div key={classType}>
                    <div>{`${destinyClassName[classType]} ${count} activities`}</div>
                    <div>{`${formatHours(timePlayedSeconds)}`}</div>
                    <div>{`${percentTimePlayed.toFixed(2)}%`}</div>
                  </div>
                )
              )}
            </div>
          </DestinyWrappedCard>
          {!!(newDungeonActivities.count + newRaidActivities.count) && (
            <DestinyWrappedCard title="You Tackled New Challenges...">
              <div>
                <div>{"Vesper's Host"}</div>
                <div>{newDungeonActivities.completed} completions</div>
                <div>{newDungeonActivities.count} attempts</div>
                <div>{formatHours(newDungeonActivities.timePlayed)}</div>
              </div>
              <div>
                <div>{"Salvation's Edge"}</div>
                <div>{newRaidActivities.completed} completions</div>
                <div>{newRaidActivities.count} attempts</div>
                <div>{formatHours(newRaidActivities.timePlayed)}</div>
              </div>
            </DestinyWrappedCard>
          )}
          <DestinyWrappedCard title="You killed Dul Incaru a few times">
            <div>
              <div>{shatteredThroneStats.completions} completions</div>
              <div>{shatteredThroneStats.attempts} attempts</div>
              <div>{shatteredThroneStats.fireteamKills} fireteam kills</div>
            </div>
          </DestinyWrappedCard>
          <DestinyWrappedCard title="You even played some Gambit">
            {/* 
              time in gambit
              gambit wins
              gambit losses
              gambit KD
             */}
          </DestinyWrappedCard>
          <DestinyWrappedCard title="Your PVP skills were inspiring">
            {/* PVP win rate */}
            {/* PVP wins */}
            {/* PVP matches played */}
            {/* PVP time played */}
            {/* PVP kills */}
            {/* PVP KD */}
            {/* PVP deaths */}
          </DestinyWrappedCard>
          <DestinyWrappedCard title="This season was not your favorite">
            {/* 
              season with lowest playtime
              playtime in that season
              activities played in that season
             */}
          </DestinyWrappedCard>
          <DestinyWrappedCard title="Summmary">
            {/* 
              Minutes played
              Favorite season
              favorite activity
              favorite mode (pvp/pve/crucible)
              % playtime on favorite character
             */}
          </DestinyWrappedCard>
        </div>
      </main>
    );
  }
);

DestinyWrapped.displayName = "DestinyWrappedCard";

const useStats = (
  rawActivities: (DestinyHistoricalStatsPeriodGroup & {
    characterId: string;
  })[],
  characterMap: Record<string, DestinyClass>
) =>
  useMemo(() => {
    const activities = rawActivities.filter((a) => {
      const pc = a.values["playerCount"].basic.value;
      return pc > 0 && pc < 50;
    });

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

    const totalStats = {
      playTime: 0,
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

    const newRaidActivities: DestinyHistoricalStatsPeriodGroup[] = [];
    const newDungeonActivities: DestinyHistoricalStatsPeriodGroup[] = [];

    const shatteredThroneAttempts: DestinyHistoricalStatsPeriodGroup[] = [];

    activities.forEach((activity) => {
      // total stats
      const activityDurationSeconds =
        activity.values["activityDurationSeconds"].basic.value;
      totalStats.playTime += activityDurationSeconds;

      // Group by mode
      activity.activityDetails.modes.forEach((mode) => {
        const existing = groupedByMode.get(mode);
        if (!existing) {
          groupedByMode.set(mode, [activity]);
        } else {
          groupedByMode.get(mode)!.push(activity);
        }
      });

      // Group by primary  mode
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

      // new raid/dungeon activities
      if (newRaidHashes.includes(hash)) {
        newRaidActivities.push(activity);
      } else if (newDungeonHashes.includes(hash)) {
        newDungeonActivities.push(activity);
      }

      if (
        hash === 2032534090 &&
        activity.values["completed"].basic.value === 1
      ) {
        shatteredThroneAttempts.push(activity);
      }

      // longest streak
      if (activityDurationSeconds > 0) {
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
    });

    const sortedByTimeInMode = Array.from(groupedByPrimaryMode.entries())
      .sort(
        ([, a], [, b]) =>
          b.reduce(
            (acc, e) => acc + e.values["activityDurationSeconds"].basic.value,
            0
          ) -
          a.reduce(
            (acc, e) => acc + e.values["activityDurationSeconds"].basic.value,
            0
          )
      )
      .map(([mode, activities]) => ({
        mode,
        count: activities.length,
        timePlayedSeconds: activities.reduce(
          (acc, e) => acc + e.values["activityDurationSeconds"].basic.value,
          0
        ),
        modeName: activityModeNames[mode],
      }));

    const sortedByCountInHash = Array.from(groupedByHash.entries())
      .sort(([, a], [, b]) => b.length - a.length)
      .map(([hash, activities]) => ({
        hash,
        count: activities.length,
        timePlayedSeconds: activities.reduce(
          (acc, e) => acc + e.values["activityDurationSeconds"].basic.value,
          0
        ),
      }));

    const topNModes = (n: number) => sortedByTimeInMode.slice(0, n);
    const topNActivities = (n: number) => sortedByCountInHash.slice(0, n);

    const countPve = groupedByMode.get(7)?.length ?? 0;
    const countPvp = groupedByMode.get(5)?.length ?? 0;

    const [mostPopularMonthId, mostPopularMonthEntries] = Array.from(
      groupedByMonth.entries()
    ).sort(
      ([, a], [, b]) =>
        b.reduce(
          (acc, e) => acc + e.values["activityDurationSeconds"].basic.value,
          0
        ) -
        a.reduce(
          (acc, e) => acc + e.values["activityDurationSeconds"].basic.value,
          0
        )
    )[0] ?? [11, []];

    const sortedClassEntries = Array.from(groupedByClass.entries())
      .map(([classType, activities]) => {
        const timePlayedSeconds = activities.reduce(
          (acc, e) => e.values["activityDurationSeconds"].basic.value + acc,
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

    const mostPopularMonth = {
      id: mostPopularMonthId,
      count: mostPopularMonthEntries.length,
      timePlayedSeconds: mostPopularMonthEntries.reduce(
        (acc, e) => e.values["activityDurationSeconds"].basic.value + acc,
        0
      ),
    };

    return {
      mostPopularMonth,
      topNModes,
      topNActivities,
      totalStats,
      longestStreak: {
        numDays: longestStreak.numDays,
        activityCount: longestStreak.activityCount,
        start: longestStreak.start,
        end: longestStreak.end,
      },
      sortedClassEntries,
      newDungeonActivities: {
        count: newDungeonActivities.length,
        completed: newDungeonActivities.filter(
          (a) =>
            a.values["completed"].basic.value === 1 &&
            a.values["completionReason"].basic.value === 0
        ).length,
        timePlayed: newDungeonActivities.reduce(
          (acc, e) => e.values["activityDurationSeconds"].basic.value + acc,
          0
        ),
      },
      newRaidActivities: {
        count: newRaidActivities.length,
        completed: newRaidActivities.filter(
          (a) =>
            a.values["completed"].basic.value === 1 &&
            a.values["completionReason"].basic.value === 0
        ).length,
        timePlayed: newRaidActivities.reduce(
          (acc, e) => e.values["activityDurationSeconds"].basic.value + acc,
          0
        ),
      },
      shatteredThroneStats: {
        attempts: shatteredThroneAttempts.length,
        completions: shatteredThroneAttempts.filter(
          (a) =>
            a.values["completed"].basic.value === 1 &&
            a.values["completionReason"].basic.value === 0
        ).length,
        fireteamKills: shatteredThroneAttempts.reduce(
          (acc, e) => e.values["kills"].basic.value + acc,
          0
        ),
      },
    };
  }, [rawActivities, characterMap]);

function formatHours(seconds: number): string {
  const hours = Math.floor(seconds / 3600);

  if (hours < 1) {
    return `${Math.floor(seconds / 60)} minutes`;
  }

  return `${hours} hours`;
}
