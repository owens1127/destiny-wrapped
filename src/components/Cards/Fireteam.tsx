"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useColor } from "@/ui/useColor";
import { DestinyWrappedCard } from "../DestinyWrappedCard";
import { Users, User, Clock, BarChart3 } from "lucide-react";
import { formatHours } from "./utils";

interface FireteamStats {
  soloActivities: number;
  teamActivities: number;
  soloTimePlayed: number;
  teamTimePlayed: number;
  averageFireteamSize: number;
  mostCommonFireteamSize: number;
  largestFireteamSize: number;
  fireteamSizeDistribution: Array<{ size: number; count: number }>;
}

interface FireteamCardProps {
  idx: number;
  fireteamStats: FireteamStats | null;
  totalActivities: number;
  hasPGCRData: boolean;
}


export function FireteamCard({
  fireteamStats,
  totalActivities,
  idx,
  hasPGCRData,
}: FireteamCardProps) {
  const colorClass = useColor(idx);
  const hasData = fireteamStats && fireteamStats.teamActivities > 0;

  const stats = useMemo(() => {
    if (!hasData || !fireteamStats) return null;
    
    const totalTime = fireteamStats.soloTimePlayed + fireteamStats.teamTimePlayed;
    const soloTimePercent = totalTime > 0 
      ? ((fireteamStats.soloTimePlayed / totalTime) * 100).toFixed(1)
      : "0";
    const teamTimePercent = totalTime > 0
      ? ((fireteamStats.teamTimePlayed / totalTime) * 100).toFixed(1)
      : "0";
    
    const totalActivitiesWithPGCR = fireteamStats.soloActivities + fireteamStats.teamActivities;
    const soloActivityPercent = totalActivitiesWithPGCR > 0
      ? ((fireteamStats.soloActivities / totalActivitiesWithPGCR) * 100).toFixed(1)
      : "0";
    const teamActivityPercent = totalActivitiesWithPGCR > 0
      ? ((fireteamStats.teamActivities / totalActivitiesWithPGCR) * 100).toFixed(1)
      : "0";
    
    // Sort distribution by size
    const sortedDistribution = [...fireteamStats.fireteamSizeDistribution]
      .sort((a, b) => a.size - b.size)
      .slice(0, 6); // Show top 6 sizes
    
    const maxCount = Math.max(...sortedDistribution.map(d => d.count), 1);
    
    return {
      soloTimePercent,
      teamTimePercent,
      soloActivityPercent,
      teamActivityPercent,
      sortedDistribution,
      maxCount,
      totalTime,
    };
  }, [hasData, fireteamStats]);

  return (
    <DestinyWrappedCard className={`bg-gradient-to-br ${colorClass}`}>
      <CardHeader className="relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 150 }}
        >
          <CardTitle className="text-4xl font-bold text-center text-white drop-shadow-lg">
            Solo or <i>squad</i>?
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
            <Users
              className="w-16 h-16 mb-4 opacity-50"
              fill="currentColor"
              stroke="white"
              strokeWidth={2}
            />
            <p className="text-xl opacity-75">
              {hasPGCRData
                ? "No fireteam data available"
                : "Download PGCR data to see your fireteam stats"}
            </p>
          </motion.div>
        ) : stats ? (
          <>
            {/* Time breakdown - main focus */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="mb-6"
            >
              <p className="text-sm opacity-70 mb-3 uppercase tracking-wider text-center">
                Time Played
              </p>
              <div className="grid grid-cols-2 gap-3">
                <motion.div
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 text-blue-400" />
                    <p className="text-xs opacity-80 uppercase tracking-wider">Solo</p>
                  </div>
                  <p className="text-2xl font-bold mb-1">
                    {formatHours(fireteamStats.soloTimePlayed)}
                  </p>
                  <p className="text-xs opacity-70">{stats.soloTimePercent}% of time</p>
                </motion.div>
                <motion.div
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-green-400" />
                    <p className="text-xs opacity-80 uppercase tracking-wider">Team</p>
                  </div>
                  <p className="text-2xl font-bold mb-1">
                    {formatHours(fireteamStats.teamTimePlayed)}
                  </p>
                  <p className="text-xs opacity-70">{stats.teamTimePercent}% of time</p>
                </motion.div>
              </div>
            </motion.div>

            {/* Activity counts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", delay: 0.3 }}
              className="mb-6"
            >
              <p className="text-sm opacity-70 mb-3 uppercase tracking-wider text-center">
                Activities
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 text-center">
                  <p className="text-lg font-bold">{fireteamStats.soloActivities.toLocaleString()}</p>
                  <p className="text-xs opacity-70">solo ({stats.soloActivityPercent}%)</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 text-center">
                  <p className="text-lg font-bold">{fireteamStats.teamActivities.toLocaleString()}</p>
                  <p className="text-xs opacity-70">team ({stats.teamActivityPercent}%)</p>
                </div>
              </div>
            </motion.div>

            {/* Fireteam size distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", delay: 0.4 }}
              className="mb-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 opacity-70" />
                <p className="text-sm opacity-70 uppercase tracking-wider">
                  Fireteam Size Distribution
                </p>
              </div>
              <div className="space-y-2">
                {stats.sortedDistribution.map(({ size, count }, index) => {
                  const widthPercent = (count / stats.maxCount) * 100;
                  const isSolo = size === 1;
                  const isFull = size === 6;
                  
                  return (
                    <motion.div
                      key={size}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-12 text-sm font-semibold flex items-center gap-1">
                        {isSolo ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Users className="w-4 h-4" />
                        )}
                        <span>{size}</span>
                      </div>
                      <div className="flex-1 bg-white/10 rounded-full h-6 overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${
                            isSolo
                              ? "bg-blue-400"
                              : isFull
                              ? "bg-purple-400"
                              : "bg-green-400"
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${widthPercent}%` }}
                          transition={{ delay: 0.6 + index * 0.05, duration: 0.5 }}
                        />
                      </div>
                      <div className="w-16 text-right text-sm font-semibold">
                        {count.toLocaleString()}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Additional stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", delay: 0.5 }}
              className="grid grid-cols-2 gap-3"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 text-center">
                <p className="text-xs opacity-70 mb-1 uppercase tracking-wider">Average Size</p>
                <p className="text-xl font-bold">
                  {fireteamStats.averageFireteamSize.toFixed(1)}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 text-center">
                <p className="text-xs opacity-70 mb-1 uppercase tracking-wider">Largest Squad</p>
                <p className="text-xl font-bold">
                  {fireteamStats.largestFireteamSize}
                </p>
              </div>
            </motion.div>
          </>
        ) : null}
      </CardContent>
    </DestinyWrappedCard>
  );
}
