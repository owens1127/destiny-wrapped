import {
  DestinyClass,
  DestinyHistoricalStatsPeriodGroup,
} from "bungie-net-core/models";
import { memo } from "react";
import { DestinyWrappedCard } from "./DestinyWrappedCard";
import { activityModeNames, destinyClassName, monthNames } from "@/lib/maps";
import { useGetActivityDefinition } from "@/hooks/useGetActivityDefinition";
import { useWrappedStats } from "@/hooks/useWrappedStats";
import { ModesCard } from "./Cards/Modes";
import { formatHours } from "./Cards/utils";
import { TopActivitiesCard } from "./Cards/TopActivities";
import { DedicationCard } from "./Cards/Dedication";
import { SummaryCard } from "./Cards/Summary";

export const DestinyWrapped = memo(
  (props: {
    activities: (DestinyHistoricalStatsPeriodGroup & {
      characterId: string;
    })[];
    characterMap: Record<string, DestinyClass>;
    displayName: React.ReactNode;
  }) => {
    const getActivityDefinition = useGetActivityDefinition();
    const {
      topNModes,
      topNActivitiesByCount,
      topNActivitiesByPlaytime,
      totalStats,
      longestStreak,
      mostPopularMonth,
      leastPopularSeason,
      sortedClassEntries,
      newDungeonActivities,
      newRaidActivities,
      shatteredThroneStats,
      gambitStats,
      pvpStats,
      pvePvpSplit,
    } = useWrappedStats(props.activities, props.characterMap);

    if (!props.activities.length) {
      return ":(";
    }

    const topFiveModes = topNModes(5);
    const topMode = topNModes(1)[0];
    const topTenActivitiesByCount = topNActivitiesByCount(10);
    const topActivity = topNActivitiesByPlaytime(1)[0];

    return (
      <main className="min-h-screen mx-auto">
        <h1 className="text-center text-2xl sm:text-4xl">
          Destiny Wrapped 2024
        </h1>
        <div className="grid gap-8 grid-cols-1 my-8 mx-auto w-[92%] sm:w-[500] lg:w-[600]">
          <ModesCard topMode={topMode} totalStats={totalStats} idx={0} />
          <TopActivitiesCard topActivities={topTenActivitiesByCount} idx={1} />
          <DedicationCard longestStreak={longestStreak} idx={2} />
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
          <DestinyWrappedCard title="Your PVP skills were inspiring">
            <div>
              <div>{pvpStats.games} games</div>
              <div>{pvpStats.wins} wins</div>
              <div>{pvpStats.kills} kills</div>
              <div>Win rate {(pvpStats.wins / pvpStats.games).toFixed(2)}%</div>
              <div>{pvpStats.deaths} deaths</div>
              <div>{pvpStats.assists} assists</div>
              <div>{formatHours(pvpStats.timePlayed)}</div>
              <div> K/D {(pvpStats.kills / pvpStats.deaths).toFixed(2)}</div>
              <div>
                KA/D{" "}
                {(
                  (pvpStats.kills + pvpStats.assists) /
                  pvpStats.deaths
                ).toFixed(2)}
              </div>
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
          <DestinyWrappedCard title="You even played some Gambit!">
            <div>
              <div>{gambitStats.games} games</div>
              <div>{gambitStats.wins} wins</div>
              <div>{gambitStats.kills.toLocaleString()} kills</div>
              <div>
                Win rate {(gambitStats.wins / gambitStats.games).toFixed(2)}%
              </div>
              <div>{gambitStats.deaths} deaths</div>
              <div>{gambitStats.assists} assists</div>
              <div>{formatHours(gambitStats.timePlayed)}</div>
              <div>
                K/D {(gambitStats.kills / gambitStats.deaths).toFixed(2)}
              </div>
            </div>
          </DestinyWrappedCard>

          <DestinyWrappedCard title="This season was not your favorite">
            <div>
              <div>{leastPopularSeason.name}</div>
              <div>{leastPopularSeason.count} activities</div>
              <div>{formatHours(leastPopularSeason.timePlayedSeconds)}</div>
              <div>
                Percent of yearly playtime{" "}
                {(
                  (100 * leastPopularSeason.timePlayedSeconds) /
                  totalStats.playTime
                ).toFixed(2)}
                %
              </div>
            </div>
          </DestinyWrappedCard>
          <SummaryCard
            idx={10}
            displayName={props.displayName}
            totalStats={totalStats}
            topActivity={topActivity}
            topMode={topMode}
            pvePvpSplit={pvePvpSplit}
            activityModeNames={activityModeNames}
          />
        </div>
      </main>
    );
  }
);

DestinyWrapped.displayName = "DestinyWrappedCard";
