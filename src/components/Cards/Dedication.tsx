"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useColor } from "@/ui/useColor";
import { format, differenceInWeeks } from "date-fns";
import { DestinyWrappedCard } from "../DestinyWrappedCard";
import { Calendar, Flame, TrendingUp } from "lucide-react";

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

  const stats = useMemo(() => {
    const avgPerDay =
      longestStreak.numDays > 0
        ? (longestStreak.activityCount / longestStreak.numDays).toFixed(1)
        : "0";
    const weeks = differenceInWeeks(longestStreak.end, longestStreak.start);
    const percentOfYear = parseFloat(
      ((longestStreak.numDays / 365) * 100).toFixed(1)
    );
    const fullDateRange = `${format(
      longestStreak.start,
      "MMM d, yyyy"
    )} - ${format(longestStreak.end, "MMM d, yyyy")}`;

    // Determine message based on days
    let message = "That's dedication";
    if (longestStreak.numDays >= 180) {
      message = "You're addicted";
    } else if (longestStreak.numDays >= 90) {
      message = "That's dedication";
    } else if (longestStreak.numDays >= 30) {
      message = "That's a good streak";
    } else if (longestStreak.numDays >= 7) {
      message = "Nice streak";
    } else {
      message = "Building healthy habits";
    }

    return {
      avgPerDay,
      weeks,
      percentOfYear: percentOfYear.toFixed(0),
      fullDateRange,
      message,
    };
  }, [longestStreak]);

  // Create visual timeline dots
  const timelineDots = useMemo(() => {
    const dots = [];
    const maxDots = 20;
    const step = Math.max(1, Math.floor(longestStreak.numDays / maxDots));

    for (let i = 0; i < longestStreak.numDays; i += step) {
      dots.push(i);
    }
    if (dots[dots.length - 1] !== longestStreak.numDays - 1) {
      dots.push(longestStreak.numDays - 1);
    }
    return dots;
  }, [longestStreak.numDays]);

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
      <CardContent className="relative z-10 p-4 sm:p-6 text-white">
        {/* Hero section with large number */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 150, delay: 0.1 }}
          className="text-center mb-4"
        >
          <p className="text-sm opacity-80 mb-1 uppercase tracking-wider">
            Your longest streak
          </p>
          <motion.div
            className="flex items-baseline justify-center gap-2 mb-2"
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <motion.h3
              className="text-6xl md:text-7xl font-black"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              {longestStreak.numDays}
            </motion.h3>
            <span className="text-2xl md:text-3xl font-semibold opacity-90">
              days
            </span>
          </motion.div>
          {stats.weeks > 0 && (
            <p className="text-sm opacity-70">
              That&apos;s {stats.weeks} {stats.weeks === 1 ? "week" : "weeks"}{" "}
              of dedication
            </p>
          )}
        </motion.div>

        {/* Visual timeline */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ type: "spring", delay: 0.3 }}
          className="mb-4"
        >
          <div className="flex items-center justify-center gap-1 flex-wrap px-2">
            {timelineDots.map((day, index) => (
              <motion.div
                key={day}
                className="w-2 h-2 rounded-full bg-white/40"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.4 + index * 0.02,
                  type: "spring",
                }}
                style={{
                  backgroundColor:
                    index === timelineDots.length - 1
                      ? "rgba(255, 255, 255, 0.9)"
                      : "rgba(255, 255, 255, 0.4)",
                  boxShadow:
                    index === timelineDots.length - 1
                      ? "0 0 8px rgba(255, 255, 255, 0.6)"
                      : "none",
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 120, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20"
          >
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-orange-400" />
              <p className="text-xs opacity-80 uppercase tracking-wider">
                Activities
              </p>
            </div>
            <motion.h4
              className="text-3xl font-bold"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{
                duration: 2,
                delay: 0.5,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              {longestStreak.activityCount.toLocaleString()}
            </motion.h4>
            <p className="text-xs opacity-70 mt-1">completed during streak</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 120, delay: 0.25 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20"
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <p className="text-xs opacity-80 uppercase tracking-wider">
                Average
              </p>
            </div>
            <motion.h4
              className="text-3xl font-bold"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{
                duration: 2,
                delay: 0.6,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              {stats.avgPerDay}
            </motion.h4>
            <p className="text-xs opacity-70 mt-1">runs per day</p>
          </motion.div>
        </div>

        {/* Date range */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, delay: 0.3 }}
          className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <p className="text-xs opacity-80 uppercase tracking-wider">
              Date Range
            </p>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs opacity-70 mb-0.5">Started</p>
              <p className="text-sm font-semibold">
                {format(longestStreak.start, "MMM d, yyyy")}
              </p>
            </div>
            <div className="text-2xl opacity-30">→</div>
            <div className="text-right">
              <p className="text-xs opacity-70 mb-0.5">Ended</p>
              <p className="text-sm font-semibold">
                {format(longestStreak.end, "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Percentage of year */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, delay: 0.4 }}
          className="text-center mt-4"
        >
          <p className="text-lg font-semibold">
            {stats.percentOfYear}% of the year
          </p>
          <p className="text-xs opacity-70 mt-1">{stats.message}</p>
        </motion.div>
      </CardContent>
    </DestinyWrappedCard>
  );
}
