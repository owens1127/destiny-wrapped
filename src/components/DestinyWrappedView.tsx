import {
  DestinyClass,
  DestinyHistoricalStatsPeriodGroup,
} from "bungie-net-core/models";
import { memo, useMemo } from "react";
import { activityModeNames } from "@/config/modes";
import { useWrappedStats } from "@/stats";
import { useDestinyManifestComponent } from "@/manifest/useDestinyManifestComponent";
import { ModesCard } from "./Cards/Modes";
import { TopActivitiesCard } from "./Cards/TopActivities";
import { TopActivitiesByRunsCard } from "./Cards/TopActivitiesByRuns";
import { DedicationCard } from "./Cards/Dedication";
import { SummaryCard } from "./Cards/Summary";
import { PopularMonthCard } from "./Cards/PopularMonth";
import { ClassStatsCard } from "./Cards/ClassStats";
import { NewChallengesCard } from "./Cards/NewChallenges";
import { PvpStatsCard } from "./Cards/Pvp";
import { FireteamCard } from "./Cards/Fireteam";
import { WeaponUsageCard } from "./Cards/WeaponUsage";
import { FavoriteTeammatesCard } from "./Cards/FavoriteTeammates";
import { AbilityKillsCard } from "./Cards/AbilityKills";
import { TimeOfDayCard } from "./Cards/TimeOfDay";
import { PvpWeaponsCard } from "./Cards/PvpWeapons";
import { FavoriteEmblemCard } from "./Cards/FavoriteEmblem";
import { SixtySevenCard } from "./Cards/SixtySeven";
import { MinesCard } from "./Cards/Mines";
import { CardCarousel } from "./CardCarousel";

export const DestinyWrappedView = memo(
  (props: {
    activities: (DestinyHistoricalStatsPeriodGroup & {
      characterId: string;
    })[];
    characterMap: Record<string, DestinyClass>;
    displayName: React.ReactNode;
  }) => {
    // Preload item definitions for emblems and weapons
    useDestinyManifestComponent("DestinyInventoryItemDefinition");

    const {
      topNModes,
      topNActivitiesByPlaytime,
      topNActivitiesByRuns,
      totalStats,
      longestStreak,
      mostPopularMonth,
      sortedClassEntries,
      newDungeonActivities,
      newRaidActivities,
      pvpStats,
      pvePvpSplit,
      fireteamStats,
      weaponStats,
      pvpWeaponStats,
      teammateStats,
      abilityStats,
      timeOfDayStats,
      favoriteEmblems,
      sixtySevenStats,
      hasPGCRData,
    } = useWrappedStats(props.activities, props.characterMap);

    const topMode = topNModes(1)[0];
    const topTenActivitiesByTime = topNActivitiesByPlaytime(10);
    const topTenActivitiesByRuns = topNActivitiesByRuns(10);
    const topActivity = topNActivitiesByRuns(1)[0];

    // Build array of cards for carousel
    const cards = useMemo(() => {
      const cardList: React.ReactNode[] = [];
      let cardIdx = 0;
      const getNextIdx = () => cardIdx++;

      cardList.push(
        <PopularMonthCard
          key="popular-month"
          mostPopularMonth={mostPopularMonth}
          totalStats={totalStats}
          idx={getNextIdx()}
        />
      );

      cardList.push(
        <ModesCard
          key="modes"
          topMode={topMode}
          totalStats={totalStats}
          idx={getNextIdx()}
        />
      );

      if (
        hasPGCRData &&
        (abilityStats.superKills > 0 ||
          abilityStats.grenadeKills > 0 ||
          abilityStats.meleeKills > 0)
      ) {
        cardList.push(
          <AbilityKillsCard
            key="ability-kills"
            abilityStats={abilityStats}
            hasPGCRData={hasPGCRData}
            totalActivities={totalStats.count}
            idx={getNextIdx()}
          />
        );
      }

      cardList.push(
        <TopActivitiesCard
          key="top-activities-time"
          topActivities={topTenActivitiesByTime}
          idx={getNextIdx()}
          sortBy="time"
          title={
            <>
              You played these activities in <i>perpetuity</i>
            </>
          }
        />
      );

      if (pvpStats.games > 0) {
        cardList.push(
          <PvpStatsCard
            key="pvp-stats"
            pvpStats={pvpStats}
            idx={getNextIdx()}
          />
        );
      }

      cardList.push(
        <ClassStatsCard
          key="class-stats"
          sortedClassEntries={sortedClassEntries}
          idx={getNextIdx()}
        />
      );

      if (hasPGCRData && favoriteEmblems) {
        cardList.push(
          <FavoriteEmblemCard
            key="favorite-emblem"
            favoriteEmblems={favoriteEmblems}
            hasPGCRData={hasPGCRData}
            idx={getNextIdx()}
          />
        );
      }

      cardList.push(
        <MinesCard
          key="mines"
          activities={props.activities}
          idx={getNextIdx()}
        />
      );

      if (hasPGCRData && weaponStats.topWeapons.length > 0) {
        cardList.push(
          <WeaponUsageCard
            key="weapon-usage"
            weaponStats={weaponStats}
            hasPGCRData={hasPGCRData}
            idx={getNextIdx()}
          />
        );
      }

      cardList.push(
        <DedicationCard
          key="dedication"
          longestStreak={longestStreak}
          idx={getNextIdx()}
        />
      );

      if (hasPGCRData && timeOfDayStats) {
        cardList.push(
          <TimeOfDayCard
            key="time-of-day"
            timeOfDayStats={timeOfDayStats}
            hasPGCRData={hasPGCRData}
            idx={getNextIdx()}
          />
        );
      }

      if (
        pvpStats.games > 0 &&
        hasPGCRData &&
        pvpWeaponStats.topWeapons.length > 0
      ) {
        cardList.push(
          <PvpWeaponsCard
            key="pvp-weapons"
            pvpWeaponStats={pvpWeaponStats}
            hasPGCRData={hasPGCRData}
            idx={getNextIdx()}
          />
        );
      }

      if (hasPGCRData && fireteamStats.teamActivities > 0) {
        cardList.push(
          <FireteamCard
            key="fireteam"
            fireteamStats={fireteamStats}
            totalActivities={totalStats.count}
            hasPGCRData={hasPGCRData}
            idx={getNextIdx()}
          />
        );
      }

      cardList.push(
        <TopActivitiesByRunsCard
          key="top-activities-runs"
          topActivities={topTenActivitiesByRuns}
          idx={getNextIdx()}
        />
      );

      if (hasPGCRData && sixtySevenStats) {
        cardList.push(
          <SixtySevenCard
            key="sixty-seven"
            sixtySevenStats={sixtySevenStats}
            idx={getNextIdx()}
          />
        );
      }

      if (hasPGCRData && teammateStats.teammates.length > 0) {
        cardList.push(
          <FavoriteTeammatesCard
            key="favorite-teammates"
            teammateStats={teammateStats}
            hasPGCRData={hasPGCRData}
            idx={getNextIdx()}
          />
        );
      }

      const totalDungeonCount = Object.values(newDungeonActivities).reduce(
        (sum, stats) => sum + stats.count,
        0
      );
      const totalRaidCount = Object.values(newRaidActivities).reduce(
        (sum, stats) => sum + stats.count,
        0
      );
      if (totalDungeonCount + totalRaidCount > 0) {
        cardList.push(
          <NewChallengesCard
            key="new-challenges"
            newDungeonActivities={newDungeonActivities}
            newRaidActivities={newRaidActivities}
            idx={getNextIdx()}
          />
        );
      }

      cardList.push(
        <SummaryCard
          key="summary"
          idx={getNextIdx()}
          displayName={props.displayName}
          totalStats={totalStats}
          topActivity={topActivity}
          topMode={topMode}
          pvePvpSplit={pvePvpSplit}
          activityModeNames={activityModeNames}
          topWeapon={
            hasPGCRData && weaponStats.topWeapons.length > 0
              ? weaponStats.topWeapons[0]
              : null
          }
          bestFriend={
            hasPGCRData && teammateStats.teammates.length > 0
              ? teammateStats.teammates[0]
              : null
          }
          hasPGCRData={hasPGCRData}
          activities={props.activities}
        />
      );

      return cardList;
    }, [
      mostPopularMonth,
      totalStats,
      topMode,
      hasPGCRData,
      abilityStats,
      topTenActivitiesByTime,
      pvpStats,
      sortedClassEntries,
      favoriteEmblems,
      props.activities,
      weaponStats,
      longestStreak,
      timeOfDayStats,
      pvpWeaponStats,
      fireteamStats,
      topTenActivitiesByRuns,
      sixtySevenStats,
      teammateStats,
      newDungeonActivities,
      newRaidActivities,
      props.displayName,
      topActivity,
      pvePvpSplit,
    ]);

    return (
      <main className="min-h-screen mx-auto pb-8">
        <div className="my-8 mx-auto w-[92%] sm:w-[500px] md:w-[600px]">
          {cards.length > 0 && <CardCarousel>{cards}</CardCarousel>}
        </div>
        <p className="text-center max-w-96 mx-auto text-lg mt-8">
          Please share on Twitter/X and/or Bluesky with the tag{" "}
          <span className="text-blue-400">#Destiny2Wrapped2025</span> ♡
        </p>
      </main>
    );
  }
);

DestinyWrappedView.displayName = "DestinyWrappedView";
