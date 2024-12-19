import {
  DestinyClass,
  DestinyHistoricalStatsPeriodGroup,
} from "bungie-net-core/models";
import { memo } from "react";
import { activityModeNames } from "@/lib/maps";
import { useWrappedStats } from "@/hooks/useWrappedStats";
import { ModesCard } from "./Cards/Modes";
import { TopActivitiesCard } from "./Cards/TopActivities";
import { DedicationCard } from "./Cards/Dedication";
import { SummaryCard } from "./Cards/Summary";
import { PopularMonthCard } from "./Cards/PopularMonth";
import { ClassStatsCard } from "./Cards/ClassStats";
import { NewChallengesCard } from "./Cards/NewChallenges";
import { PvpStatsCard } from "./Cards/Pvp";
import { GambitStatsCard } from "./Cards/Gambit";
import { LeastFavoriteSeasonCard } from "./Cards/LeastFavoriteSeason";

export const DestinyWrapped = memo(
  (props: {
    activities: (DestinyHistoricalStatsPeriodGroup & {
      characterId: string;
    })[];
    characterMap: Record<string, DestinyClass>;
    displayName: React.ReactNode;
  }) => {
    const {
      topNModes,
      topNActivitiesByPlaytime,
      totalStats,
      longestStreak,
      mostPopularMonth,
      leastPopularSeason,
      sortedClassEntries,
      newDungeonActivities,
      newRaidActivities,
      gambitStats,
      pvpStats,
      pvePvpSplit,
    } = useWrappedStats(props.activities, props.characterMap);

    const topMode = topNModes(1)[0];
    const topTenActivities = topNActivitiesByPlaytime(10);
    const topActivity = topNActivitiesByPlaytime(1)[0];

    return (
      <main className="min-h-screen mx-auto">
        <h1 className="text-center text-2xl sm:text-4xl">
          Destiny Wrapped 2024
        </h1>
        <div className="grid gap-8 grid-cols-1 my-8 mx-auto w-[92%] sm:w-[500px] md:w-[600px]">
          <ModesCard topMode={topMode} totalStats={totalStats} idx={0} />
          <TopActivitiesCard topActivities={topTenActivities} idx={1} />
          <DedicationCard longestStreak={longestStreak} idx={2} />
          {!!pvpStats.games && <PvpStatsCard pvpStats={pvpStats} idx={3} />}
          <ClassStatsCard sortedClassEntries={sortedClassEntries} idx={4} />
          <PopularMonthCard
            mostPopularMonth={mostPopularMonth}
            totalStats={totalStats}
            idx={5}
          />
          {!!(newDungeonActivities.count + newRaidActivities.count) && (
            <NewChallengesCard
              newDungeonActivities={newDungeonActivities}
              newRaidActivities={newRaidActivities}
              idx={6}
            />
          )}
          {!!gambitStats.games && (
            <GambitStatsCard gambitStats={gambitStats} idx={7} />
          )}
          <LeastFavoriteSeasonCard
            leastPopularSeason={leastPopularSeason}
            totalStats={totalStats}
            idx={8}
          />
          <SummaryCard
            idx={9}
            displayName={props.displayName}
            totalStats={totalStats}
            topActivity={topActivity}
            topMode={topMode}
            pvePvpSplit={pvePvpSplit}
            activityModeNames={activityModeNames}
          />
        </div>
        <p className="text-center max-w-96 mx-auto text-lg">
          Please share on Twitter/X and/or Bluesky with the tag{" "}
          <span className="text-blue-400">#Destiny2Wrapped2024</span> ♡
        </p>
      </main>
    );
  }
);

DestinyWrapped.displayName = "DestinyWrappedCard";
