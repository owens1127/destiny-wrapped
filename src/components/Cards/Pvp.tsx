"use client";

import React from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHours } from "./utils";
import { useColor } from "@/hooks/useColor";
import { DestinyWrappedCard } from "../DestinyWrappedCard";
import { Swords, Clock, Trophy, MonitorPlay } from "lucide-react";

interface PvpStats {
  games: number;
  wins: number;
  kills: number;
  deaths: number;
  assists: number;
  timePlayed: number;
}

interface PvpStatsCardProps {
  idx: number;
  pvpStats: PvpStats;
}

const StatItem = ({
  icon,
  label,
  value,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay: number;
}) => (
  <motion.div
    className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-4"
    initial={{ opacity: 0, y: 20, scale: 0.8 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ type: "spring", stiffness: 100, damping: 10, delay }}
    whileHover={{ scale: 1.02 }}
  >
    <div style={{ transform: `rotate(${delay * 10 - 10}deg)` }}>{icon}</div>
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

const AltStatItem = ({
  label,
  value,
  delay,
}: {
  label: string;
  value: string;
  delay: number;
}) => (
  <motion.div
    className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center"
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: "spring", stiffness: 120, damping: 12, delay }}
    whileHover={{ scale: 1.02 }}
  >
    <motion.p
      className="text-3xl font-bold"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
    >
      {value}
    </motion.p>
    <p className="text-sm opacity-80">{label}</p>
  </motion.div>
);

export function PvpStatsCard({ pvpStats, idx }: PvpStatsCardProps) {
  const colorClass = useColor(idx);
  const winRateNum = (pvpStats.wins / pvpStats.games) * 100;
  const kdNum = pvpStats.kills / pvpStats.deaths;
  const winRate = winRateNum.toFixed(2);
  const kd = kdNum.toFixed(2);

  // Dynamic title based on performance
  const getTitle = () => {
    // Less than 24 hours in Crucible
    const hoursInCrucible = pvpStats.timePlayed / 3600;
    if (hoursInCrucible < 24) {
      return (
        <>
          You were <i>afraid</i> of the Crucible
        </>
      );
    }

    // High performer: >60% win rate AND >1.5 K/D
    if (winRateNum >= 60 && kdNum >= 1.5) {
      return (
        <>
          You <i>owned</i> the Trials
        </>
      );
    }
    // Strong performer: >55% win rate OR >1.3 K/D
    if (winRateNum >= 55 || kdNum >= 1.3) {
      return (
        <>
          You <i>slayed</i> guardians
        </>
      );
    }
    // Solid performer: >50% win rate OR >1.0 K/D
    if (winRateNum >= 50 || kdNum >= 1.0) {
      return (
        <>
          You <i>held your own</i>
        </>
      );
    }
    // Many games played but lower stats
    if (pvpStats.games >= 100) {
      return (
        <>
          You <i>never backed down</i>
        </>
      );
    }
    // High kill count
    if (pvpStats.kills >= 5000) {
      return (
        <>
          You <i>stacked bodies</i>
        </>
      );
    }
    // Default
    return (
      <>
        You <i>answered the call</i>
      </>
    );
  };

  return (
    <DestinyWrappedCard className={`bg-gradient-to-br ${colorClass}`}>
      <CardHeader className="relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 150 }}
        >
          <CardTitle className="text-4xl font-bold text-center text-white drop-shadow-lg">
            {getTitle()}
          </CardTitle>
        </motion.div>
      </CardHeader>
      <CardContent className="relative z-10 p-6 text-white">
        <motion.div
          className="mb-6 text-center"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, delay: 0.1 }}
        >
          <p className="text-xl">
            You claimed victory{" "}
            <motion.span
              className="font-bold text-3xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {pvpStats.wins}
            </motion.span>{" "}
            times this year
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
              <Trophy
                className="w-8 h-8 text-yellow-400"
                fill="currentColor"
                stroke="white"
                strokeWidth={2}
              />
            }
            label="Win Rate"
            value={`${winRate}%`}
            delay={0.1}
          />
          <StatItem
            icon={
              <Swords
                className="w-8 h-8 text-red-400"
                fill="currentColor"
                stroke="white"
                strokeWidth={2}
              />
            }
            label="K/D Ratio"
            value={kd}
            delay={0.2}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          <StatItem
            icon={
              <MonitorPlay
                className="w-6 h-6 text-gray-800"
                fill="currentColor"
                stroke="white"
                strokeWidth={2}
              />
            }
            label="Matches Played"
            value={pvpStats.games.toString()}
            delay={0.1}
          />
          <StatItem
            icon={
              <Clock
                className="w-6 h-6 text-green-400"
                fill="currentColor"
                stroke="white"
                strokeWidth={2}
              />
            }
            label="Time Played"
            value={formatHours(pvpStats.timePlayed)}
            delay={0.2}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="grid grid-cols-3 gap-4"
        >
          <AltStatItem
            label="Kills"
            value={pvpStats.kills.toLocaleString()}
            delay={0.1}
          />
          <AltStatItem
            label="Deaths"
            value={pvpStats.deaths.toLocaleString()}
            delay={0.2}
          />
          <AltStatItem
            label="Assists"
            value={pvpStats.assists.toLocaleString()}
            delay={0.3}
          />
        </motion.div>
      </CardContent>
    </DestinyWrappedCard>
  );
}
