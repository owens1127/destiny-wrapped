"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHours, formatTime } from "./utils";
import { useColor } from "@/ui/useColor";
import { useGetActivityDefinition } from "@/activities/useGetActivityDefinition";
import { DestinyWrappedCard } from "../DestinyWrappedCard";
import { DestinyHistoricalStatsPeriodGroup } from "bungie-net-core/models";
import { calculateMinesStats } from "@/stats/minesUtils";
import Image from "next/image";

interface MinesCardProps {
  idx: number;
  activities: (DestinyHistoricalStatsPeriodGroup & {
    characterId: string;
  })[];
}

export function MinesCard({ idx, activities }: MinesCardProps) {
  const colorClass = useColor(idx);
  const getActivityDefinition = useGetActivityDefinition();

  const minesStats = useMemo(() => {
    return calculateMinesStats(activities, (hash) => {
      const activityDef = getActivityDefinition(hash);
      return activityDef?.displayProperties.name ?? "";
    });
  }, [activities, getActivityDefinition]);

  const hasData = minesStats.activities.length > 0;

  return (
    <DestinyWrappedCard className={`bg-gradient-to-br ${colorClass}`}>
      <CardHeader className="relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 150 }}
        >
          <CardTitle className="text-4xl font-bold text-center text-white drop-shadow-lg">
            Your stats in the <i>mines</i>
          </CardTitle>
        </motion.div>
      </CardHeader>
      <CardContent className="relative z-10 p-3 text-white">
        {!hasData ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="text-center py-8"
          >
            <p className="text-lg opacity-80">
              No Caldera, K1, Starcrossed, or Encore activities with more than
              10 attempts found
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {minesStats.activities.map((activity, index) => {
              const activityDef = getActivityDefinition(activity.hash);
              const bgImage = activityDef?.pgcrImage
                ? `https://www.bungie.net${activityDef.pgcrImage}`
                : null;

              // Alternate left/right positioning
              const isLeft = index % 2 === 0;

              // Scale card size and brightness based on popularity ratio (relative to total runs)
              const popularityRatio = activity.popularityRatio ?? 0;
              // More popular = brighter (less opacity on overlays, more opacity on card bg)
              const bgOpacity = 0.25 + popularityRatio * 0.2; // 0.25 to 0.45 (darker base)
              const overlayOpacity = 0.4 - popularityRatio * 0.2; // 0.4 to 0.2 (darker overlays)
              const overlayOpacity2 = 0.3 - popularityRatio * 0.15; // 0.3 to 0.15 (darker overlays)
              // Border width scales from 1px to 4px based on popularity percentage
              const borderWidth = 1 + popularityRatio * 3; // 1px to 4px
              // Font opacity scales from 85% to 100% based on popularity
              const textOpacity = 0.9 + popularityRatio * 0.1; // 0.9 to 1.0 (brighter text)
              // Font weight scales from normal to bold based on popularity
              const fontWeight =
                popularityRatio > 0.5
                  ? "bold"
                  : popularityRatio > 0.25
                  ? "semibold"
                  : "normal";

              return (
                <motion.div
                  key={`${activity.name}-${activity.hash}`}
                  initial={{ opacity: 0, y: 30, x: isLeft ? -50 : 50 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{
                    delay: 0.05 + index * 0.15,
                    type: "spring",
                    stiffness: 100,
                  }}
                  className={`relative ${
                    isLeft ? "col-start-1" : "col-start-2"
                  }`}
                >
                  <div className="relative rounded-lg overflow-hidden">
                    {/* Blurred background image */}
                    {bgImage && (
                      <div className="absolute inset-0 -z-10 rounded-lg overflow-hidden">
                        <Image
                          src={bgImage}
                          fill
                          unoptimized
                          alt={activity.name}
                          className="object-cover blur-[2px] opacity-50 scale-110"
                          style={{ borderRadius: "0.5rem" }}
                        />
                        <div
                          className="absolute inset-0 bg-gradient-to-br to-transparent rounded-lg"
                          style={{
                            background: `linear-gradient(to bottom right, rgba(0,0,0,${overlayOpacity}), rgba(0,0,0,${overlayOpacity2}), transparent)`,
                          }}
                        />
                      </div>
                    )}

                    <div
                      className="relative rounded-lg"
                      style={{
                        padding: `${0.75 + popularityRatio * 0.15}rem`,
                        backgroundColor: `rgba(0, 0, 0, ${bgOpacity})`,
                        border: `${borderWidth}px solid rgba(255, 255, 255, 0.3)`,
                      }}
                    >
                      {/* Title */}
                      <motion.h3
                        className="text-base mb-1"
                        style={{
                          fontWeight: fontWeight,
                          opacity: textOpacity,
                          fontFamily: "cursive",
                        }}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.05 + index * 0.15 }}
                      >
                        {activity.name}
                      </motion.h3>

                      {/* Consistent layout: 2 columns */}
                      <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-1">
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{
                              delay: 0.1 + index * 0.15,
                              type: "spring",
                            }}
                          >
                            <p
                              className="text-xs mb-0.5"
                              style={{ opacity: textOpacity * 0.8 }}
                            >
                              Total Runs
                            </p>
                            <p
                              className="text-2xl"
                              style={{
                                fontWeight: fontWeight,
                                opacity: textOpacity,
                              }}
                            >
                              {activity.count.toLocaleString()}
                            </p>
                          </motion.div>
                          <div>
                            <p
                              className="text-xs mb-0.5"
                              style={{ opacity: textOpacity * 0.7 }}
                            >
                              Time Played
                            </p>
                            <p
                              className="text-lg"
                              style={{
                                fontWeight: fontWeight,
                                opacity: textOpacity,
                              }}
                            >
                              {formatHours(activity.timePlayedSeconds)}
                            </p>
                          </div>
                          <div>
                            <p
                              className="text-xs mb-0.5"
                              style={{ opacity: textOpacity * 0.7 }}
                            >
                              Kills
                            </p>
                            <p
                              className="text-lg"
                              style={{
                                fontWeight: fontWeight,
                                opacity: textOpacity,
                              }}
                            >
                              {activity.kills.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div>
                            <p
                              className="text-xs mb-0.5"
                              style={{ opacity: textOpacity * 0.7 }}
                            >
                              K/D
                            </p>
                            <p
                              className="text-lg"
                              style={{
                                fontWeight: fontWeight,
                                opacity: textOpacity,
                              }}
                            >
                              {activity.kd.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p
                              className="text-xs mb-0.5"
                              style={{ opacity: textOpacity * 0.7 }}
                            >
                              Completed
                            </p>
                            <p
                              className="text-lg"
                              style={{
                                fontWeight: fontWeight,
                                opacity: textOpacity,
                              }}
                            >
                              {activity.completedCount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p
                              className="text-xs mb-0.5"
                              style={{ opacity: textOpacity * 0.7 }}
                            >
                              Success Rate
                            </p>
                            <p
                              className="text-lg"
                              style={{
                                fontWeight: fontWeight,
                                opacity: textOpacity,
                              }}
                            >
                              {activity.successRate.toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p
                              className="text-xs mb-0.5"
                              style={{ opacity: textOpacity * 0.7 }}
                            >
                              Median Clear Time
                            </p>
                            <p
                              className="text-lg"
                              style={{
                                fontWeight: fontWeight,
                                opacity: textOpacity,
                              }}
                            >
                              {activity.completedCount > 0
                                ? formatTime(activity.medianClearTimeSeconds)
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </DestinyWrappedCard>
  );
}
