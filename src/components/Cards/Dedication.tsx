"use client";

import React from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useColor } from "@/hooks/useColor";
import { format } from "date-fns";
import { DestinyWrappedCard } from "../DestinyWrappedCard";

interface LongestStreak {
  numDays: number;
  activityCount: number;
  start: Date;
  end: Date;
}

interface DedicationCardProps {
  idx: number;
  longestStreak: LongestStreak;
}

export function DedicationCard({ longestStreak, idx }: DedicationCardProps) {
  const colorClass = useColor(idx);

  return (
    <DestinyWrappedCard className={`bg-gradient-to-br ${colorClass}`}>
      <CardHeader className="relative z-10">
        <CardTitle className="text-4xl font-bold text-center text-white drop-shadow-lg">
          You got a bit streaky
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 flex flex-col items-center justify-center p-6 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4"
        >
          <p className="text-xl mb-4">Your longest streak was</p>
          <h3 className="text-6xl font-bold mb-2">{longestStreak.numDays}</h3>
          <p className="text-2xl">days in a row</p>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-2xl text-center mb-8 bg-white/10 p-4"
        >
          {format(longestStreak.start, "MMM d")} -{" "}
          {format(longestStreak.end, "MMM d, yyyy")}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mb-8"
        >
          <p className="text-xl mb-2">Which included</p>
          <h4 className="text-4xl font-semibold mb-2">
            {longestStreak.activityCount}
          </h4>
          <p className="text-xl">activities</p>
        </motion.div>
      </CardContent>
    </DestinyWrappedCard>
  );
}
