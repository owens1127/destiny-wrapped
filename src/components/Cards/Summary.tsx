"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useColor } from "@/ui/useColor";
import { DestinyWrappedCard } from "../DestinyWrappedCard";
import { useGetActivityDefinition } from "@/activities/useGetActivityDefinition";
import { useGetItemDefinition } from "@/items/useGetItemDefinition";
import Image from "next/image";
import {
  DestinyHistoricalStatsPeriodGroup,
} from "bungie-net-core/models";

interface SummaryCardProps {
  idx: number;
  displayName: React.ReactNode;
  totalStats: {
    playTime: number;
    count: number;
    kills: number;
    deaths: number;
  };
  topActivity: {
    hash: number;
  };
  topMode: {
    mode: number;
    count: number;
  };
  pvePvpSplit: {
    ratio: number;
  };
  activityModeNames: Record<number, string>;
  topWeapon?: {
    hash: number;
    kills: number;
  } | null;
  bestFriend?: {
    displayName: string;
    membershipId: string;
    activityCount: number;
    bungieGlobalDisplayNameCode?: number;
  } | null;
  hasPGCRData: boolean;
  activities: (DestinyHistoricalStatsPeriodGroup & {
    characterId: string;
  })[];
}

export function SummaryCard({
  idx,
  displayName,
  totalStats,
  topActivity,
  topMode,
  pvePvpSplit,
  activityModeNames,
  topWeapon,
  bestFriend,
  hasPGCRData,
  activities,
}: SummaryCardProps) {
  const colorClass = useColor(idx);
  const getActivityDefinition = useGetActivityDefinition();
  const getItemDefinition = useGetItemDefinition();

  const teamHashtag = useMemo(() => {
    const minesActivities = activities.filter((activity) => {
      const activityDef = getActivityDefinition(activity.activityDetails?.referenceId ?? 0);
      const activityName = activityDef?.displayProperties.name ?? "";
      const baseName = activityName.split(":")[0].trim();
      
      return (
        baseName.toLowerCase().includes("caldera") ||
        baseName.toLowerCase().includes("k1 logistics")
      );
    });

    if (minesActivities.length === 0) {
      return null;
    }

    const calderaCount = minesActivities.filter((activity) => {
      const activityDef = getActivityDefinition(activity.activityDetails?.referenceId ?? 0);
      const activityName = activityDef?.displayProperties.name ?? "";
      const baseName = activityName.split(":")[0].trim();
      return baseName.toLowerCase().includes("caldera");
    }).length;

    const k1Count = minesActivities.filter((activity) => {
      const activityDef = getActivityDefinition(activity.activityDetails?.referenceId ?? 0);
      const activityName = activityDef?.displayProperties.name ?? "";
      const baseName = activityName.split(":")[0].trim();
      return baseName.toLowerCase().includes("k1 logistics");
    }).length;

    if (calderaCount > k1Count) {
      return "#TeamCaldera";
    } else if (k1Count > calderaCount) {
      return "#TeamK1";
    } else if (calderaCount > 0 || k1Count > 0) {
      // If tied, default to Caldera
      return "#TeamCaldera";
    }

    return null;
  }, [activities, getActivityDefinition]);

  const getPvePvpSplit = useMemo(() => {
    if (pvePvpSplit.ratio >= 1.05) {
      return {
        value: (Math.round(pvePvpSplit.ratio * 10) / 10).toFixed(1) + "x",
        bottom: (
          <span>
            as much <i>PvE</i> as <i>PvP</i>
          </span>
        ),
      };
    } else if (1 / pvePvpSplit.ratio >= 1.05) {
      return {
        value: (Math.round((1 / pvePvpSplit.ratio) * 10) / 10).toFixed(1) + "x",
        bottom: (
          <span>
            as much <i>PvP</i> as <i>PvE</i>
          </span>
        ),
      };
    } else {
      return {
        value: "Equal",
        bottom: (
          <span>
            amounts of <i>PvE</i> and <i>PvP</i>
          </span>
        ),
      };
    }
  }, [pvePvpSplit.ratio]);

  return (
    <DestinyWrappedCard className={`bg-gradient-to-br ${colorClass} relative`}>
      {/* Team Hashtag - top left of entire card, slanted */}
      {teamHashtag && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            rotate: -12,
          }}
          transition={{ 
            opacity: { type: "spring", delay: 0.2 },
            scale: { type: "spring", delay: 0.2 },
            rotate: { type: "spring", delay: 0.2 },
          }}
          className="absolute top-1 left-1 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 backdrop-blur-md rounded-xl p-1.5 text-center shadow-2xl border-2 border-yellow-400/30 z-30"
          style={{ transform: "rotate(-12deg)" }}
        >
          <motion.div
            className="text-sm font-black text-yellow-300 drop-shadow-lg"
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {teamHashtag}
          </motion.div>
        </motion.div>
      )}
      <CardHeader className="relative z-10 pt-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 150 }}
        >
          <CardTitle className="text-4xl font-bold text-center text-white drop-shadow-lg">
            <motion.div 
              className="text-2xl font-normal"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <i>Destiny 2:</i> Wrapped, 2025
            </motion.div>
            <motion.h4
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05, type: "spring" }}
            >
              {displayName}
            </motion.h4>
          </CardTitle>
        </motion.div>
      </CardHeader>
      <CardContent className="relative z-10 p-4 sm:p-6 pt-0 text-white min-h-[400px]">
        {/* Free-floating stats container */}
        <div className="relative w-full h-full min-h-[350px] mb-4">
          {/* Total Hours - top left */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.5 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, -8, 0],
            }}
            transition={{ 
              opacity: { type: "spring", delay: 0.1 },
              scale: { type: "spring", delay: 0.1 },
              y: { duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.1 }
            }}
            className="absolute -top-2 bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center shadow-lg"
            style={{ width: "140px", left: "8px" }}
          >
            <p className="text-xs opacity-80 mb-1">Total Hours</p>
            <motion.div
              className="text-3xl font-bold"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {Math.round(totalStats.playTime / 3600).toLocaleString()}
            </motion.div>
          </motion.div>

          {/* Activities - top right */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.5 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, -10, 0],
            }}
            transition={{ 
              opacity: { type: "spring", delay: 0.05 },
              scale: { type: "spring", delay: 0.05 },
              y: { duration: 14, repeat: Infinity, ease: "easeInOut", delay: 0.05 }
            }}
            className="absolute top-0 bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center shadow-lg"
            style={{ width: "140px", right: "-8px" }}
          >
            <p className="text-xs opacity-80 mb-1">Activities</p>
            <motion.div
              className="text-3xl font-bold"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.05 }}
            >
              {totalStats.count.toLocaleString()}
            </motion.div>
          </motion.div>

          {/* Best Friend - left center (if available) */}
          {hasPGCRData && bestFriend && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.5 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: [0, -12, 0],
              }}
              transition={{ 
                opacity: { type: "spring", delay: 0.05 },
                scale: { type: "spring", delay: 0.05 },
                y: { duration: 16, repeat: Infinity, ease: "easeInOut", delay: 0.1 }
              }}
              className="absolute top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center shadow-lg"
              style={{ width: "160px", left: "12px" }}
            >
              <p className="text-xs opacity-80 mb-1">Best Friend</p>
              <motion.div
                className="text-xl font-bold mb-1"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                {bestFriend.displayName}
                {bestFriend.bungieGlobalDisplayNameCode !== undefined && (
                  <span className="text-sm font-normal opacity-70">
                    #{bestFriend.bungieGlobalDisplayNameCode}
                  </span>
                )}
              </motion.div>
              <p className="text-xs opacity-80">
                {bestFriend.activityCount} activities together
              </p>
            </motion.div>
          )}

          {/* Favorite Category - between Total Hours and PvE/PvP Split */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.5 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, -9, 0],
            }}
            transition={{ 
              opacity: { type: "spring", delay: 0.1 },
              scale: { type: "spring", delay: 0.1 },
              y: { duration: 12.8, repeat: Infinity, ease: "easeInOut", delay: 0.1 }
            }}
            className="absolute top-[25%] bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center shadow-lg"
            style={{ width: "150px", left: "-4px" }}
          >
            <p className="text-xs opacity-80 mb-1">Favorite Category</p>
            <motion.div
              className="text-2xl font-bold mb-1"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {activityModeNames[topMode.mode]}
            </motion.div>
            <p className="text-xs opacity-80">
              {topMode.count.toLocaleString()} {topMode.count === 1 ? "attempt" : "attempts"}
            </p>
          </motion.div>

          {/* Kills - bottom left */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.5 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, -11, 0],
            }}
            transition={{ 
              opacity: { type: "spring", delay: 0.15 },
              scale: { type: "spring", delay: 0.15 },
              y: { duration: 15.2, repeat: Infinity, ease: "easeInOut", delay: 0.05 }
            }}
            className="absolute bottom-0 bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center shadow-lg"
            style={{ width: "130px", left: "6px" }}
          >
            <p className="text-xs opacity-80 mb-1">Kills</p>
            <motion.div
              className="text-2xl font-bold"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.05 }}
            >
              {totalStats.kills.toLocaleString()}
            </motion.div>
          </motion.div>

          {/* Deaths - bottom right */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.5 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, -7, 0],
            }}
            transition={{ 
              opacity: { type: "spring", delay: 0.1 },
              scale: { type: "spring", delay: 0.1 },
              y: { duration: 13.2, repeat: Infinity, ease: "easeInOut", delay: 0.15 }
            }}
            className="absolute bottom-0 bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center shadow-lg"
            style={{ width: "130px", right: "-6px" }}
          >
            <p className="text-xs opacity-80 mb-1">Deaths</p>
            <motion.div
              className="text-2xl font-bold"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
            >
              {totalStats.deaths.toLocaleString()}
            </motion.div>
          </motion.div>

          {/* Top Weapon - center top (if available) */}
          {hasPGCRData && topWeapon && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.5 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: [0, -10, 0],
              }}
              transition={{ 
                opacity: { type: "spring", delay: 0.15 },
                scale: { type: "spring", delay: 0.15 },
                y: { duration: 14.4, repeat: Infinity, ease: "easeInOut", delay: 0.1 }
              }}
              className="absolute top-[20%] left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center shadow-lg"
              style={{ width: "180px" }}
            >
              <p className="text-xs opacity-80 mb-1">Top Weapon</p>
              <motion.div
                className="text-xl font-bold"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                {getItemDefinition(topWeapon.hash)?.displayProperties.name ||
                  "Unknown"}
              </motion.div>
              <p className="text-xs opacity-80 mt-1">
                {topWeapon.kills.toLocaleString()} kills
              </p>
            </motion.div>
          )}

          {/* PvE/PvP Split - center bottom */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.5 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, -8, 0],
            }}
            transition={{ 
              opacity: { type: "spring", delay: 0.15 },
              scale: { type: "spring", delay: 0.15 },
              y: { duration: 13.6, repeat: Infinity, ease: "easeInOut", delay: 0.15 }
            }}
            className="absolute bottom-1/4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center shadow-lg"
            style={{ width: "180px" }}
          >
            <p className="text-xs opacity-80 mb-1">Played</p>
            <motion.div
              className="text-4xl font-bold mb-1"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {getPvePvpSplit.value}
            </motion.div>
            <p className="text-sm">{getPvePvpSplit.bottom}</p>
          </motion.div>

            </div>

        {/* Favorite activity image - full width */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", delay: 0.15 }}
          className="relative w-full rounded-lg overflow-hidden"
        >
          <Image
            className="w-full h-auto"
            src={
              "https://www.bungie.net" +
              (getActivityDefinition(topActivity.hash)?.pgcrImage ?? "")
            }
            width={600}
            height={338}
            alt={
              getActivityDefinition(topActivity.hash)?.displayProperties.name
                ?.split(":")[0].trim() ?? ""
            }
            unoptimized
          />
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm opacity-80 mb-1">Your favorite activity</p>
            <motion.div
              className="text-2xl font-bold"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {
                getActivityDefinition(topActivity.hash)?.displayProperties.name
                  ?.split(":")[0].trim() ?? "Unknown"
              }
            </motion.div>
          </motion.div>
        </motion.div>
      </CardContent>
    </DestinyWrappedCard>
  );
}
