import {
  DestinyClass,
  DestinyHistoricalStatsPeriodGroup,
} from "bungie-net-core/models";
import { memo, useMemo } from "react";
import { activityModeNames } from "@/config/modes";
import { useWrappedStats } from "@/stats";
import { useDestinyManifestComponent } from "@/manifest/useDestinyManifestComponent";
import { trackEvent } from "@/lib/posthog-client";
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
import { DestinyWrappedCard } from "./DestinyWrappedCard";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useColor } from "@/ui/useColor";
import { motion } from "framer-motion";

function KofiCard({ idx }: { idx: number }) {
  const colorClass = useColor(idx);

  return (
    <DestinyWrappedCard
      className={`bg-gradient-to-br ${colorClass} relative overflow-hidden`}
    >
      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-10 left-10 text-6xl opacity-20"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        ✨
      </motion.div>
      <motion.div
        className="absolute top-20 right-16 text-5xl opacity-20"
        animate={{
          y: [0, -15, 0],
          rotate: [0, -10, 10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      >
        🎉
      </motion.div>
      <motion.div
        className="absolute bottom-16 left-16 text-4xl opacity-20"
        animate={{
          y: [0, -10, 0],
          rotate: [0, 15, -15, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        ⭐
      </motion.div>

      <CardHeader className="relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 150 }}
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <CardTitle className="text-4xl font-black text-center text-white drop-shadow-lg mb-2">
              You&apos;re done! 🎉
            </CardTitle>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-white/80 text-lg"
          >
            Thanks for exploring your Destiny 2 year!
          </motion.p>
        </motion.div>
      </CardHeader>
      <CardContent className="relative z-10 p-4 text-white flex flex-col items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="text-center space-y-6"
        >
          <motion.p
            className="text-xl font-semibold"
            animate={{
              opacity: [1, 0.8, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Enjoyed your wrapped? Share it with the tag{" "}
            <motion.span
              className="text-cyan-300 font-bold"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            >
              #Destiny2Wrapped2025
            </motion.span>{" "}
            and consider supporting this project!
          </motion.p>
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
          >
            <a
              href="https://ko-fi.com/newo1"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackEvent("kofi_button_clicked", { location: "card" });
              }}
              className="relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#13C3FF] via-[#0ea5e9] to-[#13C3FF] bg-[length:200%_100%] hover:bg-[length:200%_100%] text-white rounded-xl transition-all font-bold text-lg shadow-2xl hover:shadow-[#13C3FF]/50 hover:scale-110 overflow-hidden group"
              style={{
                backgroundPosition: "0% 50%",
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#0ea5e9] via-[#13C3FF] to-[#0ea5e9] opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  backgroundSize: "200% 100%",
                  backgroundPosition: "100% 50%",
                }}
              />
              <motion.span
                className="text-2xl relative z-10"
                animate={{
                  rotate: [0, 15, -15, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                ☕
              </motion.span>
              <span className="relative z-10">Buy me a coffee</span>
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
            </a>
          </motion.div>
        </motion.div>
      </CardContent>
    </DestinyWrappedCard>
  );
}

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
      </main>
    );
  }
);

DestinyWrappedView.displayName = "DestinyWrappedView";
