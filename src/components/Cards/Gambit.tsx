"use client";

import React from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHours } from "./utils";
import { useColor } from "@/hooks/useColor";
import { DestinyWrappedCard } from "../DestinyWrappedCard";
import { Clock, Trophy, Swords, MonitorPlay } from "lucide-react";

interface GambitStats {
  games: number;
  wins: number;
  kills: number;
  deaths: number;
  assists: number;
  timePlayed: number;
}

interface GambitStatsCardProps {
  idx: number;
  gambitStats: GambitStats;
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
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    {icon}
    <div>
      <p className="text-sm opacity-80">{label}</p>
      <p className="text-xl font-bold">{value}</p>
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
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <p className="text-3xl font-bold">{value}</p>
    <p className="text-sm opacity-80">{label}</p>
  </motion.div>
);

export function GambitStatsCard({ gambitStats, idx }: GambitStatsCardProps) {
  const colorClass = useColor(idx);
  const winRate = ((gambitStats.wins / gambitStats.games) * 100).toFixed(2);
  const kd = (gambitStats.kills / gambitStats.deaths).toFixed(2);

  return (
    <DestinyWrappedCard className={`bg-gradient-to-br ${colorClass}`}>
      <CardHeader className="relative z-10">
        <CardTitle className="text-4xl font-bold text-center text-white drop-shadow-lg">
          You even played some Gambit
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 p-6 text-white">
        <motion.div
          className="mb-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xl">
            You&apos;ve won{" "}
            <span className="font-bold text-3xl">{gambitStats.wins}</span>{" "}
            matches this year!
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          <StatItem
            icon={<Trophy className="w-8 h-8 text-yellow-400" />}
            label="Win Rate"
            value={`${winRate}%`}
            delay={0.1}
          />
          <StatItem
            icon={<Swords className="w-8 h-8 text-red-400" />}
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
            icon={<MonitorPlay className="w-6 h-6 text-gray-800" />}
            label="Games Played"
            value={gambitStats.games.toString()}
            delay={0.1}
          />
          <StatItem
            icon={<Clock className="w-6 h-6 text-green-400" />}
            label="Time Played"
            value={formatHours(gambitStats.timePlayed)}
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
            value={gambitStats.kills.toLocaleString()}
            delay={0.1}
          />
          <AltStatItem
            label="Deaths"
            value={gambitStats.deaths.toLocaleString()}
            delay={0.2}
          />
          <AltStatItem
            label="Assists"
            value={gambitStats.assists.toLocaleString()}
            delay={0.3}
          />
        </motion.div>
      </CardContent>
    </DestinyWrappedCard>
  );
}
