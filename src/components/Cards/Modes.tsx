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
    <DestinyWrappedCard
      className={`bg-gradient-to-br ${colorClass} overflow-hidden`}
    >
      <CardHeader className="relative z-10 pb-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white drop-shadow-lg break-words px-2 leading-tight">
            This mode had you <i>hooked</i>
          </CardTitle>
        </motion.div>
      </CardHeader>
      <CardContent className="relative z-10 p-3 sm:p-4 text-white overflow-hidden w-full">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-3 md:gap-4 items-center w-full">
          {/* Left side - Mode name and stats */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              type: "spring",
              stiffness: 150,
              damping: 12,
              delay: 0.1,
            }}
            className="space-y-2 pr-2 md:pr-3"
          >
            <h3
              className="text-3xl sm:text-4xl md:text-5xl font-bold break-words leading-tight mb-3"
              style={{
                wordBreak: "break-word",
                overflowWrap: "break-word",
                maxWidth: "100%",
                lineHeight: "1.1",
                hyphens: "auto",
                margin: 0,
              }}
            >
              {topMode.modeName}
            </h3>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 break-words min-w-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-base sm:text-lg md:text-xl break-words"
                style={{ maxWidth: "100%" }}
              >
                <span className="opacity-80">Played </span>
                <span className="font-bold text-lg sm:text-xl md:text-2xl">
                  {topMode.count}
                </span>
                <span className="opacity-80"> times</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-base sm:text-lg md:text-xl break-words"
                style={{ maxWidth: "100%" }}
              >
                <span className="opacity-80">
                  {formatHours(topMode.timePlayedSeconds)}
                </span>
              </motion.div>
            </div>
          </motion.div>

          {/* Right side - Circular progress */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 10,
              delay: 0.3,
            }}
            className="relative w-full max-w-[240px] md:max-w-[280px] lg:max-w-[320px] mx-auto flex-shrink-0"
          >
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-white text-opacity-30 stroke-current"
                strokeWidth="8"
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
              />
              <circle
                className="text-white stroke-current"
                strokeWidth="8"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                style={{
                  strokeDasharray: 238.76,
                  strokeDashoffset: 238.76 - (percentage / 100) * 238.76,
                  transformOrigin: "center",
                  transform: "rotate(-90deg)",
                }}
              />
            </svg>
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center px-2"
              style={{ width: "70%" }}
            >
              <motion.span
                className="font-bold block leading-tight"
                style={{ fontSize: "clamp(1.25rem, 14%, 2.25rem)" }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {percentage.toFixed(1)}%
              </motion.span>
              <p
                className="opacity-80 leading-tight"
                style={{ fontSize: "clamp(0.75rem, 7%, 1.125rem)" }}
              >
                of your time
              </p>
            </div>
          </motion.div>
        </div>
      </CardContent>
    </DestinyWrappedCard>
  );
}
