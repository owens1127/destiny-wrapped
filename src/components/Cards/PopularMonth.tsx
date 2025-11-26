"use client";

import React from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHours } from "./utils";
import { useColor } from "@/hooks/useColor";
import { DestinyWrappedCard } from "../DestinyWrappedCard";
import { monthNames } from "@/lib/seasons";

interface MonthData {
  id: number;
  timePlayedSeconds: number;
  count: number;
  playtimeByDay: number[];
}

interface PopularMonthCalendarCardProps {
  idx: number;
  mostPopularMonth: MonthData;
  totalStats: {
    playTime: number;
  };
}

export function PopularMonthCard({
  mostPopularMonth,
  totalStats,
  idx,
}: PopularMonthCalendarCardProps) {
  const colorClass = useColor(idx);
  const percentage = (
    (mostPopularMonth.timePlayedSeconds / totalStats.playTime) *
    100
  ).toFixed(2);

  const date = new Date(2025, mostPopularMonth.id + 1, 0);
  const numDays = date.getDate();
  const dayOfWeek = (date.getDay() + 35 - (numDays - 1)) % 7;

  const maxTimePlayed = Math.max(...mostPopularMonth.playtimeByDay);

  return (
    <DestinyWrappedCard className={`bg-gradient-to-br ${colorClass}`}>
      <CardHeader className="relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 150 }}
        >
          <CardTitle className="text-4xl font-bold text-center text-white drop-shadow-lg">
            The month you <i>grinded</i> the hardest
          </CardTitle>
        </motion.div>
      </CardHeader>
      <CardContent className="relative z-10 p-6 text-white">
        <motion.div
          className="calendar-wrapper"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="calendar bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden">
            <div className="month-header bg-white/20 p-4 text-center">
              <motion.h3
                className="text-3xl font-bold"
                initial={{ y: -20, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
              >
                {monthNames[mostPopularMonth.id]}
              </motion.h3>
            </div>
            <div className="calendar-body p-4">
              <div className="grid grid-cols-7 gap-2">
                {!!dayOfWeek &&
                  Array.from({ length: dayOfWeek }, (_, i) => (
                    <div key={"blank" + i} />
                  ))}
                {Array.from({ length: numDays }, (_, i) => (
                  <motion.div
                    key={i}
                    className="aspect-square flex items-center justify-center rounded-full relative"
                    initial={{
                      scale: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.35)",
                    }}
                    animate={{
                      scale: 1,
                      backgroundColor: `rgba(0, 0, 0, ${
                        0.1 +
                        (mostPopularMonth.playtimeByDay[i + 1] /
                          maxTimePlayed) *
                          0.75
                      })`,
                    }}
                    transition={{
                      delay: 0.1 * (i % 7),
                      type: "spring",
                      stiffness: 150,
                      damping: 12,
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-sm z-10">{i + 1}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="stats mt-6 space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.p
            className="text-2xl font-bold"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {formatHours(mostPopularMonth.timePlayedSeconds)} played
          </motion.p>
          <p className="text-xl">
            <motion.span
              className="font-semibold"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              {percentage}%
            </motion.span>{" "}
            of your yearly play time
          </p>
          <p className="text-lg opacity-80">
            {mostPopularMonth.count} activities completed
          </p>
        </motion.div>
      </CardContent>
    </DestinyWrappedCard>
  );
}
