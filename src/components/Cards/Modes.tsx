"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DestinyActivityModeType } from "bungie-net-core/models";
import { formatHours, formatTime } from "./utils";
import { useColor } from "@/ui/useColor";
import { DestinyWrappedCard } from "../DestinyWrappedCard";
import { Clock, Play, TrendingUp, Target } from "lucide-react";
import { PieChart, Pie, Cell } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

interface TopMode {
  mode: DestinyActivityModeType;
  modeName: string;
  count: number;
  timePlayedSeconds: number;
}

interface DestinyWrappedCardProps {
  idx: number;
  topMode: TopMode;
  totalStats: {
    playTime: number;
  };
}

export function ModesCard({
  topMode,
  totalStats,
  idx,
}: DestinyWrappedCardProps) {
  const percentage = (topMode.timePlayedSeconds / totalStats.playTime) * 100;
  const colorClass = useColor(idx);
  
  const averageSessionTime = useMemo(() => {
    return topMode.count > 0 ? topMode.timePlayedSeconds / topMode.count : 0;
  }, [topMode.timePlayedSeconds, topMode.count]);

  const hoursPerWeek = useMemo(() => {
    // Approximate weeks in a year
    const weeksInYear = 52;
    return topMode.timePlayedSeconds / (weeksInYear * 3600);
  }, [topMode.timePlayedSeconds]);

  const pieData = useMemo(() => [
    { name: topMode.modeName, value: percentage },
    { name: "Other modes", value: 100 - percentage },
  ], [topMode.modeName, percentage]);

  const COLORS = ["#fbbf24", "rgba(255, 255, 255, 0.2)"];

  return (
    <DestinyWrappedCard
      className={`bg-gradient-to-br ${colorClass} overflow-hidden`}
    >
      <CardHeader className="relative z-10 pb-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <CardTitle className="text-3xl font-bold text-center text-white drop-shadow-lg">
            This mode had you <i>hooked</i>
          </CardTitle>
        </motion.div>
      </CardHeader>
      <CardContent className="relative z-10 p-4 text-white">
        {/* Mode name - prominent */}
          <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="mb-4"
        >
          <h3 className="text-4xl font-bold text-center mb-1">
              {topMode.modeName}
            </h3>
        </motion.div>

        {/* Pie chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mb-5 flex flex-col items-center"
        >
          <div
            className="w-full"
            style={{ height: "200px", maxWidth: "300px", margin: "0 auto" }}
          >
            <ChartContainer config={{}} className="w-full h-full">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>
          <motion.div
            className="mt-3 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-4xl font-bold">{percentage.toFixed(1)}%</p>
            <p className="text-sm opacity-80 mt-1">of your total playtime</p>
          </motion.div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-lg p-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, type: "spring" }}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Play className="w-4 h-4 opacity-80" />
              <p className="text-xs opacity-80">Total Sessions</p>
            </div>
            <p className="text-2xl font-bold">{topMode.count.toLocaleString()}</p>
          </motion.div>

          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-lg p-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, type: "spring" }}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Clock className="w-4 h-4 opacity-80" />
              <p className="text-xs opacity-80">Total Time</p>
            </div>
            <p className="text-2xl font-bold">{formatHours(topMode.timePlayedSeconds)}</p>
          </motion.div>

          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-lg p-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, type: "spring" }}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Target className="w-4 h-4 opacity-80" />
              <p className="text-xs opacity-80">Avg Session</p>
            </div>
            <p className="text-2xl font-bold">{formatTime(averageSessionTime)}</p>
          </motion.div>

          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-lg p-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45, type: "spring" }}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <TrendingUp className="w-4 h-4 opacity-80" />
              <p className="text-xs opacity-80">Hours/Week</p>
            </div>
            <p className="text-2xl font-bold">{hoursPerWeek.toFixed(1)}</p>
          </motion.div>
        </div>
      </CardContent>
    </DestinyWrappedCard>
  );
}
