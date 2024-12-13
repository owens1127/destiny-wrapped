"use client";

import React from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHours } from "./utils";
import { useColor } from "@/hooks/useColor";
import { useGetActivityDefinition } from "@/hooks/useGetActivityDefinition";
import { DestinyWrappedCard } from "../DestinyWrappedCard";

interface Activity {
  hash: number;
  count: number;
  timePlayedSeconds: number;
}

interface TopActivitiesCardProps {
  idx: number;
  topActivities: Activity[];
}

export function TopActivitiesCard({
  topActivities,
  idx,
}: TopActivitiesCardProps) {
  const getActivityDefinition = useGetActivityDefinition();
  const colorClass = useColor(idx);

  return (
    <DestinyWrappedCard className={`bg-gradient-to-br ${colorClass}`}>
      <CardHeader className="relative z-10">
        <CardTitle className="text-4xl font-bold text-center text-white drop-shadow-lg">
          Your Most Launched Activities
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 p-6 text-white">
        <motion.ol
          className="space-y-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {topActivities.map(({ hash, count, timePlayedSeconds }, index) => (
            <motion.li
              key={hash}
              className="flex items-center space-x-4"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <span className="text-2xl font-bold">{index + 1}.</span>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">
                  {getActivityDefinition(hash)?.displayProperties.name ??
                    "Unknown"}
                </h3>
                <p className="text-sm opacity-80">
                  {count} activities • {formatHours(timePlayedSeconds)}
                </p>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </CardContent>
    </DestinyWrappedCard>
  );
}
