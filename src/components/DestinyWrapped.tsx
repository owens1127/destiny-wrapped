import {
  DestinyClass,
  DestinyHistoricalStatsPeriodGroup,
} from "bungie-net-core/models";
import { memo, useState, useCallback, useRef } from "react";
import { activityModeNames } from "@/lib/modes";
import { useEnhancedWrappedStats } from "@/hooks/useEnhancedWrappedStats";
import { ModesCard } from "./Cards/Modes";
import { TopActivitiesCard } from "./Cards/TopActivities";
import { TopActivitiesByRunsCard } from "./Cards/TopActivitiesByRuns";
import { DedicationCard } from "./Cards/Dedication";
import { SummaryCard } from "./Cards/Summary";
import { PopularMonthCard } from "./Cards/PopularMonth";
import { ClassStatsCard } from "./Cards/ClassStats";
import { NewChallengesCard } from "./Cards/NewChallenges";
import { PvpStatsCard } from "./Cards/Pvp";
import { PGCRDownload } from "./PGCRDownload";
import { FireteamCard } from "./Cards/Fireteam";
import { WeaponUsageCard } from "./Cards/WeaponUsage";
import { FavoriteTeammatesCard } from "./Cards/FavoriteTeammates";
import { AbilityKillsCard } from "./Cards/AbilityKills";
import { TimeOfDayCard } from "./Cards/TimeOfDay";
import { PvpWeaponsCard } from "./Cards/PvpWeapons";
import { FavoriteEmblemCard } from "./Cards/FavoriteEmblem";
import { SixtySevenCard } from "./Cards/SixtySeven";
import { MinesCard } from "./Cards/Mines";

export const DestinyWrapped = memo(
  (props: {
    activities: (DestinyHistoricalStatsPeriodGroup & {
      characterId: string;
    })[];
    characterMap: Record<string, DestinyClass>;
    displayName: React.ReactNode;
  }) => {
    const [isDownloadingPGCRs, setIsDownloadingPGCRs] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const firstCardRef = useRef<HTMLDivElement>(null);

    const handleDownloadingChange = useCallback((isDownloading: boolean) => {
      setIsDownloadingPGCRs(isDownloading);
    }, []);

    const handleViewWithoutPGCRs = useCallback(() => {
      setShowStats(true);
      // Scroll to first card after a brief delay to ensure it's rendered
      setTimeout(() => {
        firstCardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }, []);

    const handleDownloadClicked = useCallback(() => {
      setShowStats(true);
    }, []);

    const handleStorageCleared = useCallback(() => {
      setShowStats(false);
    }, []);

    const handleAllDownloaded = useCallback(() => {
      setShowStats(true);
    }, []);

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
    } = useEnhancedWrappedStats(props.activities, props.characterMap);

    const topMode = topNModes(1)[0];
    const topTenActivitiesByTime = topNActivitiesByPlaytime(10);
    const topTenActivitiesByRuns = topNActivitiesByRuns(10);
    const topActivity = topNActivitiesByRuns(1)[0];

    // Use a counter for index calculation
    let cardIdx = 0;
    const getNextIdx = () => cardIdx++;

    return (
      <main className="min-h-screen mx-auto">
        <h1 className="text-center text-2xl sm:text-4xl">
          Destiny Wrapped 2025
        </h1>
        <div className="grid gap-8 grid-cols-1 my-8 mx-auto w-[92%] sm:w-[500px] md:w-[600px]">
          <PGCRDownload
            activities={props.activities}
            onDownloadingChange={handleDownloadingChange}
            onViewWithoutPGCRs={handleViewWithoutPGCRs}
            onDownloadClicked={handleDownloadClicked}
            onStorageCleared={handleStorageCleared}
            onAllDownloaded={handleAllDownloaded}
          />
          {showStats && !isDownloadingPGCRs && (
            <>
              <div ref={firstCardRef}>
                <PopularMonthCard
                  mostPopularMonth={mostPopularMonth}
                  totalStats={totalStats}
                  idx={getNextIdx()}
                />
              </div>

              <ModesCard
                topMode={topMode}
                totalStats={totalStats}
                idx={getNextIdx()}
              />
              <AbilityKillsCard
                abilityStats={
                  hasPGCRData &&
                  (abilityStats.superKills > 0 ||
                    abilityStats.grenadeKills > 0 ||
                    abilityStats.meleeKills > 0)
                    ? abilityStats
                    : null
                }
                hasPGCRData={hasPGCRData}
                idx={getNextIdx()}
              />
              <TopActivitiesCard
                topActivities={topTenActivitiesByTime}
                idx={getNextIdx()}
              />
              {!!pvpStats.games && (
                <PvpStatsCard pvpStats={pvpStats} idx={getNextIdx()} />
              )}
              <ClassStatsCard
                sortedClassEntries={sortedClassEntries}
                idx={getNextIdx()}
              />
              <FavoriteEmblemCard
                favoriteEmblems={
                  hasPGCRData && favoriteEmblems ? favoriteEmblems : null
                }
                hasPGCRData={hasPGCRData}
                idx={getNextIdx()}
              />
              <MinesCard activities={props.activities} idx={getNextIdx()} />
              <WeaponUsageCard
                weaponStats={
                  hasPGCRData && weaponStats.topWeapons.length > 0
                    ? weaponStats
                    : null
                }
                hasPGCRData={hasPGCRData}
                idx={getNextIdx()}
              />
              <DedicationCard
                longestStreak={longestStreak}
                idx={getNextIdx()}
              />
              <TimeOfDayCard
                timeOfDayStats={hasPGCRData ? timeOfDayStats : null}
                hasPGCRData={hasPGCRData}
                idx={getNextIdx()}
              />
              {pvpStats.games > 0 && (
                <PvpWeaponsCard
                  pvpWeaponStats={
                    hasPGCRData && pvpWeaponStats.topWeapons.length > 0
                      ? pvpWeaponStats
                      : null
                  }
                  hasPGCRData={hasPGCRData}
                  idx={getNextIdx()}
                />
              )}
              <FireteamCard
                fireteamStats={
                  hasPGCRData && fireteamStats.teamActivities > 0
                    ? fireteamStats
                    : null
                }
                totalActivities={totalStats.count}
                hasPGCRData={hasPGCRData}
                idx={getNextIdx()}
              />
              <TopActivitiesByRunsCard
                topActivities={topTenActivitiesByRuns}
                idx={getNextIdx()}
              />
              <SixtySevenCard
                sixtySevenStats={
                  hasPGCRData && sixtySevenStats ? sixtySevenStats : null
                }
                idx={getNextIdx()}
              />
              <FavoriteTeammatesCard
                teammateStats={
                  hasPGCRData && teammateStats.teammates.length > 0
                    ? teammateStats
                    : null
                }
                hasPGCRData={hasPGCRData}
                idx={getNextIdx()}
              />
              {(() => {
                const totalDungeonCount = Object.values(
                  newDungeonActivities
                ).reduce((sum, stats) => sum + stats.count, 0);
                const totalRaidCount = Object.values(newRaidActivities).reduce(
                  (sum, stats) => sum + stats.count,
                  0
                );
                return totalDungeonCount + totalRaidCount > 0 ? (
                  <NewChallengesCard
                    newDungeonActivities={newDungeonActivities}
                    newRaidActivities={newRaidActivities}
                    idx={getNextIdx()}
                  />
                ) : null;
              })()}
              <SummaryCard
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
            </>
          )}
        </div>
        <p className="text-center max-w-96 mx-auto text-lg">
          Please share on Twitter/X and/or Bluesky with the tag{" "}
          <span className="text-blue-400">#Destiny2Wrapped2025</span> ♡
        </p>
      </main>
    );
  }
);

DestinyWrapped.displayName = "DestinyWrappedCard";
