"use client";

import React from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useColor } from "@/ui/useColor";
import { DestinyWrappedCard } from "../DestinyWrappedCard";
import { Clock, Sun, Moon } from "lucide-react";
import { formatHours } from "./utils";

interface TimeOfDayStats {
  mostActiveHour: number;
  mostActiveDayOfWeek: number;
  leastActiveHour: number | null;
  leastActiveDayOfWeek: number | null;
  mostActiveHourTime: number;
  mostActiveDayTime: number;
  leastActiveHourTime: number | null;
  leastActiveDayTime: number | null;
  totalTimeByHour: number;
  totalTimeByDay: number;
  peakWindowStart: number;
  peakWindowTime: number;
}

interface TimeOfDayCardProps {
  idx: number;
  timeOfDayStats: TimeOfDayStats | null;
  hasPGCRData: boolean;
}

const formatHour = (hour: number): string => {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  // Use locale-aware formatting - let the browser decide 12/24 hour format
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
  });
};

const getDayName = (dayOfWeek: number): string => {
  const date = new Date();
  // Set to a Sunday and add the day offset
  date.setDate(date.getDate() - date.getDay() + dayOfWeek);
  return date.toLocaleDateString(undefined, {
    weekday: "long",
  });
};

export function TimeOfDayCard({
  timeOfDayStats,
  idx,
  hasPGCRData,
}: TimeOfDayCardProps) {
  const colorClass = useColor(idx);
  const hasData = timeOfDayStats !== null;

  const isNightTime =
    hasData &&
    (timeOfDayStats.mostActiveHour >= 20 || timeOfDayStats.mostActiveHour < 6);

  return (
    <DestinyWrappedCard className={`bg-gradient-to-br ${colorClass}`}>
      <CardHeader className="relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 150 }}
        >
          <CardTitle className="text-4xl font-bold text-center text-white drop-shadow-lg">
            Your <i>Prime Time</i>
          </CardTitle>
        </motion.div>
      </CardHeader>
      <CardContent className="relative z-10 p-4 text-white">
        {!hasData ? (
          <motion.div
            className="flex flex-col items-center justify-center py-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Clock
              className="w-16 h-16 mb-4 opacity-50"
              fill="currentColor"
              stroke="white"
              strokeWidth={2}
            />
            <p className="text-xl opacity-75">
              {hasPGCRData
                ? "No time data available"
                : "Download PGCR data to see your activity patterns"}
            </p>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 items-center">
              {/* Left side - Time */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 120, delay: 0.1 }}
              >
                <p className="text-lg opacity-80 mb-4">Most active hour</p>
                <motion.div
                  className="flex flex-col items-center gap-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", delay: 0.05 }}
                >
                  {isNightTime ? (
                    <Moon
                      className="w-16 h-16 text-blue-400"
                      fill="currentColor"
                      stroke="white"
                      strokeWidth={2}
                    />
                  ) : (
                    <Sun
                      className="w-16 h-16 text-yellow-400"
                      fill="currentColor"
                      stroke="white"
                      strokeWidth={2}
                    />
                  )}
                  <motion.span
                    className="font-bold text-5xl"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.6, delay: 0.05 }}
                  >
                    {formatHour(timeOfDayStats.mostActiveHour)}
                  </motion.span>
                </motion.div>
              </motion.div>

              {/* Right side - Day */}
              <motion.div
                className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-6"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", delay: 0.1 }}
              >
                <p className="text-lg opacity-80 mb-4">Most active day</p>
                <motion.p
                  className="text-4xl font-bold"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                >
                  {getDayName(timeOfDayStats.mostActiveDayOfWeek)}
                </motion.p>
              </motion.div>
            </div>

            {/* Additional info below */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", delay: 0.3 }}
              className="mt-6 space-y-3"
            >
              {/* Peak Window vs Least Active */}
              <div className="grid grid-cols-2 gap-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20"
                >
                  <p className="text-xs opacity-70 mb-2 uppercase tracking-wider">
                    Peak Activity Window
                  </p>
                  <p className="text-lg font-semibold mb-1">
                    {formatHour(timeOfDayStats.peakWindowStart)} -{" "}
                    {formatHour((timeOfDayStats.peakWindowStart + 3) % 24)}
                  </p>
                  <p className="text-xs opacity-80">
                    {formatHours(timeOfDayStats.peakWindowTime)}
                    {timeOfDayStats.totalTimeByHour > 0 && (
                      <span className="ml-1">
                        (
                        {(
                          (timeOfDayStats.peakWindowTime /
                            timeOfDayStats.totalTimeByHour) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    )}
                  </p>
                </motion.div>
                {timeOfDayStats.leastActiveHour !== null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.45 }}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20"
                  >
                    <p className="text-xs opacity-70 mb-2 uppercase tracking-wider">
                      Least Active Hour
                    </p>
                    <p className="text-lg font-semibold mb-1">
                      {formatHour(timeOfDayStats.leastActiveHour)}
                    </p>
                    <p className="text-xs opacity-80">
                      {timeOfDayStats.leastActiveHourTime !== null &&
                        formatHours(timeOfDayStats.leastActiveHourTime)}
                      {timeOfDayStats.totalTimeByHour > 0 &&
                        timeOfDayStats.leastActiveHourTime !== null && (
                          <span className="ml-1">
                            (
                            {(
                              (timeOfDayStats.leastActiveHourTime /
                                timeOfDayStats.totalTimeByHour) *
                              100
                            ).toFixed(1)}
                            %)
                          </span>
                        )}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Day stats */}
              <div className="grid grid-cols-2 gap-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20"
                >
                  <p className="text-xs opacity-70 mb-2 uppercase tracking-wider">
                    Most Active Day
                  </p>
                  <p className="text-lg font-semibold mb-1">
                    {getDayName(timeOfDayStats.mostActiveDayOfWeek)}
                  </p>
                  <p className="text-xs opacity-80">
                    {formatHours(timeOfDayStats.mostActiveDayTime)}
                    {timeOfDayStats.totalTimeByDay > 0 && (
                      <span className="ml-1">
                        (
                        {(
                          (timeOfDayStats.mostActiveDayTime /
                            timeOfDayStats.totalTimeByDay) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    )}
                  </p>
                </motion.div>
                {timeOfDayStats.leastActiveDayOfWeek !== null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.55 }}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20"
                  >
                    <p className="text-xs opacity-70 mb-2 uppercase tracking-wider">
                      Least Active Day
                    </p>
                    <p className="text-lg font-semibold mb-1">
                      {getDayName(timeOfDayStats.leastActiveDayOfWeek)}
                    </p>
                    <p className="text-xs opacity-80">
                      {timeOfDayStats.leastActiveDayTime !== null &&
                        formatHours(timeOfDayStats.leastActiveDayTime)}
                      {timeOfDayStats.totalTimeByDay > 0 &&
                        timeOfDayStats.leastActiveDayTime !== null && (
                          <span className="ml-1">
                            (
                            {(
                              (timeOfDayStats.leastActiveDayTime /
                                timeOfDayStats.totalTimeByDay) *
                              100
                            ).toFixed(1)}
                            %)
                          </span>
                        )}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </CardContent>
    </DestinyWrappedCard>
  );
}
