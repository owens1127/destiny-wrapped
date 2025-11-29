import {
  DestinyClass,
  DestinyHistoricalStatsPeriodGroup,
} from "bungie-net-core/models";
import { memo, useMemo } from "react";
import { activityModeNames } from "@/config/modes";
import {
  useWrappedStats,
  usePGCRData,
  convertActivityHistoryToCommon,
  convertPGCRsToCommon,
  CommonDestinyActivity,
} from "@/stats";
import { useDestinyManifestComponent } from "@/manifest/useDestinyManifestComponent";
import { LoadingWithInfo } from "./LoadingWithInfo";
import { ModesCard } from "./Cards/Modes";
import { TopActivitiesCard } from "./Cards/TopActivities";
import { TopActivitiesByRunsCard } from "./Cards/TopActivitiesByRuns";
import { DedicationCard } from "./Cards/Dedication";
import { SummaryCard } from "./Cards/Summary";
import { PopularMonthCard } from "./Cards/PopularMonth";
import { ClassStatsCard } from "./Cards/ClassStats";
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
import { KofiCard } from "./Cards/Kofi";
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

    const { pgcrData, isLoadingPGCRs } = usePGCRData(props.activities);

    // Convert activities to CommonDestinyActivity format
    // PGCRs replace activity history when available
    const commonActivities = useMemo(() => {
      if (isLoadingPGCRs) {
        return [];
      }

      // Get user character IDs for PGCR conversion
      const userCharacterIds = new Set(
        props.activities.map((a) => a.characterId)
      );

      // Convert PGCRs to common format - these take priority
      const pgcrActivities = convertPGCRsToCommon(pgcrData, userCharacterIds);

      // Create a map of activities by instanceId, starting with PGCRs
      const activitiesMap = new Map<string, CommonDestinyActivity>();

      // Add PGCR activities first (they replace activity history)
      pgcrActivities.forEach((pgcrActivity) => {
        activitiesMap.set(pgcrActivity.instanceId, pgcrActivity);
      });

      // Only add activity history for activities that don't have PGCR data
      const activityHistoryActivities = convertActivityHistoryToCommon(
        props.activities
      );
      activityHistoryActivities.forEach((activity) => {
        // Only add if we don't already have PGCR data for this instance
        if (!activitiesMap.has(activity.instanceId)) {
          activitiesMap.set(activity.instanceId, activity);
        }
      });

      return Array.from(activitiesMap.values());
    }, [props.activities, pgcrData, isLoadingPGCRs]);

    // Always call hooks, but use empty array if loading
    const wrappedStats = useWrappedStats(commonActivities, props.characterMap);

    const {
      topNModes,
      topNActivitiesByPlaytime,
      topNActivitiesByRuns,
      totalStats,
      longestStreak,
      mostPopularMonth,
      sortedClassEntries,
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
    } = wrappedStats;

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
          longestStreak={longestStreak}
          favoriteEmblems={
            hasPGCRData && favoriteEmblems ? favoriteEmblems : null
          }
        />
      );

      // Ko-fi card as final slide
      const kofiCardIdx = getNextIdx();
      cardList.push(<KofiCard key="kofi" idx={kofiCardIdx} />);

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
      props.displayName,
      topActivity,
      pvePvpSplit,
    ]);

    // Block rendering until PGCRs are loaded
    if (isLoadingPGCRs) {
      return <LoadingWithInfo state="pgcrs" />;
    }

    return (
      <main className="min-h-screen mx-auto pb-8">
        <div className="my-8 mx-auto w-[92%] sm:w-[500px] md:w-[600px]">
          {cards.length > 0 && <CardCarousel>{cards}</CardCarousel>}
        </div>
      </main>
    );
  }
);

DestinyWrappedView.displayName = "DestinyWrappedView";
