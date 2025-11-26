"use client";

import React from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHours } from "./utils";
import { useColor } from "@/hooks/useColor";
import { useGetActivityDefinition } from "@/hooks/useGetActivityDefinition";
import { DestinyWrappedCard } from "../DestinyWrappedCard";
import Image from "next/image";

interface Activity {
  hash: number;
  count: number;
  timePlayedSeconds: number;
}

interface TopActivitiesByRunsCardProps {
  idx: number;
  topActivities: Activity[];
}

export function TopActivitiesByRunsCard({
  topActivities,
  idx,
}: TopActivitiesByRunsCardProps) {
  const getActivityDefinition = useGetActivityDefinition();
  const colorClass = useColor(idx);

  // Group activities by base name (everything before ":")
  const groupedActivities = React.useMemo(() => {
    const grouped = new Map<
      string,
      {
        baseName: string;
        hash: number;
        count: number;
        timePlayedSeconds: number;
        displayName: string;
        maxCount: number; // Track the max count for a single variant
      }
    >();

    topActivities.forEach(({ hash, count, timePlayedSeconds }) => {
      const activityDef = getActivityDefinition(hash);
      const fullName = activityDef?.displayProperties.name ?? "Unknown";

      // Extract base name (everything before ":")
      const baseName = fullName.split(":")[0].trim();

      const existing = grouped.get(baseName);
      if (existing) {
        existing.count += count;
        existing.timePlayedSeconds += timePlayedSeconds;
        // Use the hash with more runs for the display
        if (count > existing.maxCount) {
          existing.hash = hash;
          existing.maxCount = count;
        }
        // Always use base name for display (without variant suffix)
        existing.displayName = baseName;
      } else {
        grouped.set(baseName, {
          baseName,
          hash,
          count,
          timePlayedSeconds,
          displayName: baseName, // Use base name without variant suffix
          maxCount: count,
        });
      }
    });

    return Array.from(grouped.values())
      .sort((a, b) => b.count - a.count) // Sort by runs, not time
      .slice(0, 7);
  }, [topActivities, getActivityDefinition]);

  return (
    <DestinyWrappedCard className={`bg-gradient-to-br ${colorClass}`}>
      <CardHeader className="relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 150 }}
        >
          <CardTitle className="text-4xl font-bold text-center text-white drop-shadow-lg">
            Built muscle memory yet?
          </CardTitle>
        </motion.div>
      </CardHeader>
      <CardContent className="relative z-10 p-6 text-white">
        <motion.ol
          className="space-y-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
        >
          {groupedActivities.map(
            ({ hash, count, timePlayedSeconds, displayName }, index) => (
              <motion.li
                key={hash}
                className="flex items-center space-x-4"
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  visible: {
                    opacity: 1,
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 100,
                      damping: 10,
                    },
                  },
                }}
                whileHover={{ scale: 1.02 }}
              >
                <motion.span
                  className="text-2xl font-bold"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                >
                  {index + 1}.
                </motion.span>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{displayName}</h3>
                  <p className="text-sm opacity-80">
                    {count} instances • {formatHours(timePlayedSeconds)} played
                  </p>
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0, rotate: 90 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                >
                  <Image
                    src={
                      "https://www.bungie.net" +
                      getActivityDefinition(hash)?.pgcrImage
                    }
                    width={16 * 6}
                    height={9 * 6}
                    unoptimized
                    alt={
                      getActivityDefinition(hash)?.displayProperties.name ?? ""
                    }
                    className="rounded-md"
                  />
                </motion.div>
              </motion.li>
            )
          )}
        </motion.ol>
      </CardContent>
    </DestinyWrappedCard>
  );
}
