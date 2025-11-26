"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHours } from "./utils";
import { useColor } from "@/hooks/useColor";
import { useGetActivityDefinition } from "@/hooks/useGetActivityDefinition";
import { DestinyWrappedCard } from "../DestinyWrappedCard";
import { DestinyHistoricalStatsPeriodGroup } from "bungie-net-core/models";
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
    const minesActivities = activities.filter((activity) => {
      const activityDef = getActivityDefinition(
        activity.activityDetails?.referenceId ?? 0
      );
      const activityName = activityDef?.displayProperties.name ?? "";
      const baseName = activityName.split(":")[0].trim().toLowerCase();

      return (
        baseName.includes("caldera") ||
        baseName.includes("k1 logistics") ||
        baseName.includes("starcrossed") ||
        baseName.includes("encore")
      );
    });

    // Group by activity name with detailed stats
    const groupedByActivity = new Map<
      string,
      {
        name: string;
        hash: number;
        count: number;
        timePlayedSeconds: number;
        kills: number;
        deaths: number;
        completedCount: number;
      }
    >();

    minesActivities.forEach((activity) => {
      const activityDef = getActivityDefinition(
        activity.activityDetails?.referenceId ?? 0
      );
      const activityName = activityDef?.displayProperties.name ?? "Unknown";
      const baseName = activityName.split(":")[0].trim();

      // Normalize activity names
      let normalizedName = baseName;
      if (baseName.toLowerCase().includes("k1")) {
        normalizedName = "K1 Logistics";
      } else if (baseName.toLowerCase().includes("caldera")) {
        normalizedName = "Caldera";
      } else if (baseName.toLowerCase().includes("starcrossed")) {
        normalizedName = "Starcrossed";
      } else if (baseName.toLowerCase().includes("encore")) {
        normalizedName = "Encore";
      }

      const hash = activity.activityDetails?.referenceId ?? 0;
      const isCompleted =
        activity.values["completed"]?.basic.value === 1 &&
        activity.values["completionReason"]?.basic.value === 0;

      const existing = groupedByActivity.get(normalizedName);
      if (existing) {
        existing.count++;
        existing.timePlayedSeconds +=
          activity.values["timePlayedSeconds"]?.basic.value ?? 0;
        existing.kills += activity.values["kills"]?.basic.value ?? 0;
        existing.deaths += activity.values["deaths"]?.basic.value ?? 0;
        if (isCompleted) {
          existing.completedCount++;
        }
      } else {
        groupedByActivity.set(normalizedName, {
          name: normalizedName,
          hash,
          count: 1,
          timePlayedSeconds:
            activity.values["timePlayedSeconds"]?.basic.value ?? 0,
          kills: activity.values["kills"]?.basic.value ?? 0,
          deaths: activity.values["deaths"]?.basic.value ?? 0,
          completedCount: isCompleted ? 1 : 0,
        });
      }
    });

    // Define order: Encore, Caldera, K1 Logistics, Starcrossed
    const orderMap: Record<string, number> = {
      Encore: 0,
      Caldera: 1,
      "K1 Logistics": 2,
      Starcrossed: 3,
    };

    const allActivities = Array.from(groupedByActivity.values())
      .map((activity) => ({
        ...activity,
        successRate:
          activity.count > 0
            ? (activity.completedCount / activity.count) * 100
            : 0,
        kd:
          activity.deaths > 0
            ? activity.kills / activity.deaths
            : activity.kills,
      }))
      .filter((activity) => activity.count > 10); // Only show activities with more than 10 attempts

    const totalRuns = allActivities.reduce((sum, a) => sum + a.count, 0);

    const sortedActivities = allActivities
      .map((activity) => ({
        ...activity,
        popularityRatio: totalRuns > 0 ? activity.count / totalRuns : 0,
      }))
      .sort((a, b) => {
        const orderA = orderMap[a.name] ?? 999;
        const orderB = orderMap[b.name] ?? 999;
        return orderA - orderB;
      });

    return {
      activities: sortedActivities,
      totalRuns,
    };
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
      <CardContent className="relative z-10 p-6 text-white">
        {!hasData ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-8"
          >
            <p className="text-lg opacity-80">
              No Caldera, K1, Starcrossed, or Encore activities with more than
              10 attempts found
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-5">
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
              const bgOpacity = 0.1 + popularityRatio * 0.15; // 0.1 to 0.25
              const overlayOpacity = 0.5 - popularityRatio * 0.2; // 0.5 to 0.3 (less overlay = brighter)
              const overlayOpacity2 = 0.3 - popularityRatio * 0.15; // 0.3 to 0.15
              // Border width scales from 1px to 4px based on popularity percentage
              const borderWidth = 1 + popularityRatio * 3; // 1px to 4px
              // Font opacity scales from 85% to 100% based on popularity
              const textOpacity = 0.85 + popularityRatio * 0.15; // 0.85 to 1.0
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
                    delay: 0.2 + index * 0.15,
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
                          className="object-cover blur-[2px] opacity-40 scale-110"
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
                      className="relative backdrop-blur-sm rounded-lg"
                      style={{
                        padding: `${1 + popularityRatio * 0.2}rem`,
                        backgroundColor: `rgba(255, 255, 255, ${bgOpacity})`,
                        border: `${borderWidth}px solid rgba(255, 255, 255, 0.2)`,
                      }}
                    >
                      {/* Title */}
                      <motion.h3
                        className="text-2xl mb-4"
                        style={{
                          fontWeight: fontWeight,
                          opacity: textOpacity,
                        }}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.15 }}
                      >
                        {activity.name}
                      </motion.h3>

                      {/* Consistent layout: 2 columns */}
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-3">
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{
                              delay: 0.4 + index * 0.15,
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
                              className="text-3xl"
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
                        <div className="flex-1 space-y-3">
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
