"use client";

import React from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHours } from "./utils";
import { useColor } from "@/ui/useColor";
import { useGetActivityDefinition } from "@/activities/useGetActivityDefinition";
import { DestinyWrappedCard } from "../DestinyWrappedCard";
import { groupActivitiesByName } from "@/stats/activityGrouping";
import Image from "next/image";

interface Activity {
  hash: number;
  count: number;
  timePlayedSeconds: number;
}

interface TopActivitiesCardProps {
  idx: number;
  topActivities: Activity[];
  sortBy: "time" | "runs";
  title: React.ReactNode;
  headerText?: React.ReactNode;
}

export function TopActivitiesCard({
  topActivities,
  idx,
  sortBy,
  title,
  headerText,
}: TopActivitiesCardProps) {
  const getActivityDefinition = useGetActivityDefinition();
  const colorClass = useColor(idx);

  // Group activities by base name (everything before ":")
  const groupedActivities = React.useMemo(() => {
    const grouped = groupActivitiesByName(
      topActivities,
      (hash) => getActivityDefinition(hash)?.displayProperties.name ?? "Unknown"
    );

    // Sort by time or runs based on prop
    return grouped
      .sort((a, b) =>
        sortBy === "time"
          ? b.timePlayedSeconds - a.timePlayedSeconds
          : b.count - a.count
      )
      .slice(0, 7);
  }, [topActivities, getActivityDefinition, sortBy]);

  return (
    <DestinyWrappedCard className={`bg-gradient-to-br ${colorClass}`}>
      <CardHeader className="relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 150 }}
        >
          <CardTitle className="text-4xl font-bold text-center text-white drop-shadow-lg">
            {title}
          </CardTitle>
        </motion.div>
      </CardHeader>
      <CardContent className="relative z-10 p-4 text-white overflow-y-auto flex-1">
        {headerText && (
          <motion.div
            className="mb-2 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, delay: 0.1 }}
          >
            <p className="text-xl">{headerText}</p>
          </motion.div>
        )}
        <motion.div
          className="grid grid-cols-1 gap-2.5"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
        >
          {groupedActivities.map(
            ({ hash, count, timePlayedSeconds, displayName }, index) => (
              <motion.div
                key={hash}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 group"
                variants={{
                  hidden: { opacity: 0, scale: 0.95, y: 5 },
                  visible: {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    transition: {
                      type: "spring",
                      stiffness: 150,
                      damping: 15,
                    },
                  },
                }}
                whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
              >
                <div className="flex items-center gap-3">
                  {/* Rank number */}
                  <motion.span
                    className="flex-shrink-0 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm tabular-nums"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: index * 0.05 + 0.1, type: "spring" }}
                  >
                    {index + 1}
                  </motion.span>

                  {/* Activity image */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 + 0.15, type: "spring" }}
                    className="relative flex-shrink-0 w-20 h-12 rounded-md overflow-hidden ring-1 ring-white/20 group-hover:ring-white/40 transition-all"
                  >
                    <Image
                      src={
                        "https://www.bungie.net" +
                        getActivityDefinition(hash)?.pgcrImage
                      }
                      fill
                      unoptimized
                      alt={
                        getActivityDefinition(hash)?.displayProperties.name ??
                        ""
                      }
                      className="object-cover"
                    />
                  </motion.div>

                  {/* Activity info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate mb-0.5 group-hover:text-yellow-200 transition-colors">
                      {displayName}
                    </h3>
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs opacity-75">
                      <span className="font-medium">
                        {count.toLocaleString()} runs
                      </span>
                      <span>•</span>
                      <span>{formatHours(timePlayedSeconds)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          )}
        </motion.div>
      </CardContent>
    </DestinyWrappedCard>
  );
}
