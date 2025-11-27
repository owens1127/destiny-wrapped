"use client";

import React from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHours } from "./utils";
import { useColor } from "@/ui/useColor";
import { DestinyWrappedCard } from "../DestinyWrappedCard";
import { monthNames } from "@/config/seasons";

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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
            delay: 0.1,
          }}
        >
          <CardTitle className="text-4xl font-bold text-center text-white drop-shadow-lg">
            The month you <i>grinded</i> the hardest
          </CardTitle>
        </motion.div>
      </CardHeader>
      <CardContent className="relative z-10 p-6 text-white">
        <motion.div
          className="calendar-wrapper"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <div className="calendar bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden">
            <div className="month-header bg-white/20 p-4 text-center">
              <motion.h3
                className="text-3xl font-bold"
                initial={{ y: -10, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.05, type: "spring", stiffness: 200 }}
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
          className="stats mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          {/* Percentage bar visualization */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm opacity-80">Yearly playtime</span>
              <motion.span
                className="text-lg font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                {percentage}%
              </motion.span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-400/80 to-yellow-300/80 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ delay: 0.4, duration: 1, type: "spring" }}
              />
            </div>
          </div>

          {/* Compact stats row */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs opacity-70 mb-1">Time played</p>
              <motion.p
                className="text-xl font-bold"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                {formatHours(mostPopularMonth.timePlayedSeconds)}
              </motion.p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="flex-1 text-right">
              <p className="text-xs opacity-70 mb-1">Activities</p>
              <motion.p
                className="text-xl font-bold"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                {mostPopularMonth.count.toLocaleString()}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </DestinyWrappedCard>
  );
}
