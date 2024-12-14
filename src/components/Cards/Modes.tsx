"use client";

import React from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DestinyActivityModeType } from "bungie-net-core/models";
import { formatHours } from "./utils";
import { useColor } from "@/hooks/useColor";
import { DestinyWrappedCard } from "../DestinyWrappedCard";

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

  return (
    <DestinyWrappedCard className={`bg-gradient-to-br ${colorClass}`}>
      <CardHeader className="relative z-10">
        <CardTitle className="text-4xl font-bold text-center text-white drop-shadow-lg">
          You really loved
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 flex flex-col items-center justify-center p-6 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h3 className="text-6xl font-bold mb-4">{topMode.modeName}</h3>
        </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative w-64 h-64 mb-8"
        >
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-white text-opacity-30 stroke-current"
              strokeWidth="10"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
            />
            <circle
              className="text-white stroke-current"
              strokeWidth="10"
              strokeLinecap="round"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              style={{
                strokeDasharray: 251.2,
                strokeDashoffset: 251.2 - (percentage / 100) * 251.2,
                transformOrigin: "center",
                transform: "rotate(-90deg)",
              }}
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <span className="text-5xl font-bold">{percentage.toFixed(1)}%</span>
            <p className="text-lg">of your time</p>
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-xl text-center"
        >
          You launched {topMode.modeName.toLowerCase()}{" "}
          <b className="font-semibold">{topMode.count}</b> times
        </motion.p>
        {/* Also how many hours */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-xl text-center"
        >
          And spent{" "}
          <b className="font-semibold">
            {formatHours(topMode.timePlayedSeconds)}
          </b>{" "}
          this year
        </motion.p>
      </CardContent>
    </DestinyWrappedCard>
  );
}
