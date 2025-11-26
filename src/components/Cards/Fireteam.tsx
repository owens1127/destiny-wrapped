"use client";

import React from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useColor } from "@/hooks/useColor";
import { DestinyWrappedCard } from "../DestinyWrappedCard";
import { Users, User, TrendingUp } from "lucide-react";

interface FireteamStats {
  soloActivities: number;
  teamActivities: number;
  averageFireteamSize: number;
  mostCommonFireteamSize: number;
}

interface FireteamCardProps {
  idx: number;
  fireteamStats: FireteamStats | null;
  totalActivities: number;
  hasPGCRData: boolean;
}

const StatItem = ({
  icon,
  label,
  value,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  delay: number;
}) => (
  <motion.div
    className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-4"
    initial={{ opacity: 0, y: 20, scale: 0.8 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ type: "spring", stiffness: 100, damping: 10, delay }}
    whileHover={{ scale: 1.02 }}
  >
    <div style={{ transform: `rotate(${delay * 12 - 12}deg)` }}>{icon}</div>
    <div>
      <p className="text-sm opacity-80">{label}</p>
      <motion.p
        className="text-xl font-bold"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.2, type: "spring" }}
      >
        {value}
      </motion.p>
    </div>
  </motion.div>
);

export function FireteamCard({
  fireteamStats,
  totalActivities,
  idx,
  hasPGCRData,
}: FireteamCardProps) {
  const colorClass = useColor(idx);
  const hasData = fireteamStats && fireteamStats.teamActivities > 0;

  const soloPercentage =
    hasData && totalActivities
      ? ((fireteamStats.soloActivities / totalActivities) * 100).toFixed(1)
      : "0";
  const teamPercentage =
    hasData && totalActivities
      ? ((fireteamStats.teamActivities / totalActivities) * 100).toFixed(1)
      : "0";

  return (
    <DestinyWrappedCard className={`bg-gradient-to-br ${colorClass}`}>
      <CardHeader className="relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 150 }}
        >
          <CardTitle className="text-4xl font-bold text-center text-white drop-shadow-lg">
            Solo or <i>squad</i>??
          </CardTitle>
        </motion.div>
      </CardHeader>
      <CardContent className="relative z-10 p-6 text-white">
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
        ) : (
          <>
            <motion.div
              className="mb-6 text-center"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 120, delay: 0.1 }}
            >
              <p className="text-xl">
                {fireteamStats.teamActivities > fireteamStats.soloActivities
                  ? "You preferred the company of Guardians"
                  : "You walked the path alone"}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="grid grid-cols-2 gap-4 mb-6"
            >
              <StatItem
                icon={
                  <User
                    className="w-8 h-8 text-blue-400"
                    fill="currentColor"
                    stroke="white"
                    strokeWidth={2}
                  />
                }
                label="Solo Activities"
                value={`${fireteamStats.soloActivities} (${soloPercentage}%)`}
                delay={0.1}
              />
              <StatItem
                icon={
                  <Users
                    className="w-8 h-8 text-green-400"
                    fill="currentColor"
                    stroke="white"
                    strokeWidth={2}
                  />
                }
                label="Team Activities"
                value={`${fireteamStats.teamActivities} (${teamPercentage}%)`}
                delay={0.2}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-2 gap-4"
            >
              <StatItem
                icon={
                  <TrendingUp
                    className="w-6 h-6 text-yellow-400"
                    fill="currentColor"
                    stroke="white"
                    strokeWidth={2}
                  />
                }
                label="Average Fireteam Size"
                value={fireteamStats.averageFireteamSize.toFixed(1)}
                delay={0.1}
              />
              <StatItem
                icon={
                  <Users
                    className="w-6 h-6 text-purple-400"
                    fill="currentColor"
                    stroke="white"
                    strokeWidth={2}
                  />
                }
                label="Most Common Size"
                value={fireteamStats.mostCommonFireteamSize}
                delay={0.2}
              />
            </motion.div>
          </>
        )}
      </CardContent>
    </DestinyWrappedCard>
  );
}
