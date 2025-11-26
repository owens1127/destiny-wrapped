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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 150 }}
        >
          <CardTitle className="text-4xl font-bold text-center text-white drop-shadow-lg">
            Gettin&apos; <i>streaky</i> with it
          </CardTitle>
        </motion.div>
      </CardHeader>
      <CardContent className="relative z-10 p-6 text-white">
        {/* Hero section with large number */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 150, delay: 0.1 }}
          className="text-center mb-6"
        >
          <p className="text-lg opacity-80 mb-2">Your longest streak</p>
          <motion.h3
            className="text-7xl md:text-8xl font-bold mb-2"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
          >
            {longestStreak.numDays}
          </motion.h3>
          <p className="text-3xl font-semibold">days straight</p>
        </motion.div>

        {/* Split layout for dates and activities */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 120, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center"
          >
            <p className="text-sm opacity-80 mb-2">From</p>
            <p className="text-xl font-bold">
              {format(longestStreak.start, "MMM d")}
            </p>
            <p className="text-sm opacity-80 mt-2">to</p>
            <p className="text-xl font-bold">
              {format(longestStreak.end, "MMM d")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 120, delay: 0.5 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center"
          >
            <p className="text-sm opacity-80 mb-2">Activities</p>
            <motion.h4
              className="text-4xl font-bold"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              {longestStreak.activityCount}
            </motion.h4>
            <p className="text-sm opacity-80 mt-2">completed</p>
          </motion.div>
        </div>
      </CardContent>
    </DestinyWrappedCard>
  );
}
