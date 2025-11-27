"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useColor } from "@/ui/useColor";
import { DestinyWrappedCard } from "../DestinyWrappedCard";
import {
  Skull,
  Target,
  Handshake,
  Crosshair,
  Users,
  Trophy,
  Sparkles,
  Star,
  Award,
  Bomb,
  Zap,
  Sword,
} from "lucide-react";

type SixtySevenStatType =
  | "kills"
  | "assists"
  | "deaths"
  | "precisionKills"
  | "opponentsDefeated"
  | "score"
  | "orbsDropped"
  | "orbsGathered"
  | "standing"
  | "weaponKillsGrenade"
  | "weaponKillsMelee"
  | "weaponKillsSuper"
  | "weaponKillsAbility";

interface SixtySevenStats {
  counts: {
    kills: number;
    assists: number;
    deaths: number;
    precisionKills: number;
    opponentsDefeated: number;
    score: number;
    orbsDropped: number;
    orbsGathered: number;
    standing: number;
    weaponKillsGrenade: number;
    weaponKillsMelee: number;
    weaponKillsSuper: number;
    weaponKillsAbility: number;
  };
  totalCount: number;
}

interface SixtySevenCardProps {
  idx: number;
  sixtySevenStats: SixtySevenStats | null;
}

export function SixtySevenCard({ sixtySevenStats, idx }: SixtySevenCardProps) {
  const colorClass = useColor(idx);

  const hasData = sixtySevenStats !== null && sixtySevenStats.totalCount > 0;

  const getIcon = (type: SixtySevenStatType, size = "w-5 h-5") => {
    const iconClass = `${size}`;
    switch (type) {
      case "kills":
        return (
          <Target
            className={`${iconClass} text-red-400`}
            fill="currentColor"
            stroke="white"
            strokeWidth={2}
          />
        );
      case "assists":
        return (
          <Handshake
            className={`${iconClass} text-blue-400`}
            fill="currentColor"
            stroke="white"
            strokeWidth={2}
          />
        );
      case "deaths":
        return (
          <Skull
            className={`${iconClass} text-gray-400`}
            fill="currentColor"
            stroke="white"
            strokeWidth={2}
          />
        );
      case "precisionKills":
        return (
          <Crosshair
            className={`${iconClass} text-yellow-400`}
            fill="currentColor"
            stroke="white"
            strokeWidth={2}
          />
        );
      case "opponentsDefeated":
        return (
          <Users
            className={`${iconClass} text-green-400`}
            fill="currentColor"
            stroke="white"
            strokeWidth={2}
          />
        );
      case "score":
        return (
          <Trophy
            className={`${iconClass} text-purple-400`}
            fill="currentColor"
            stroke="white"
            strokeWidth={2}
          />
        );
      case "orbsDropped":
        return (
          <Sparkles
            className={`${iconClass} text-cyan-400`}
            fill="currentColor"
            stroke="white"
            strokeWidth={2}
          />
        );
      case "orbsGathered":
        return (
          <Star
            className={`${iconClass} text-orange-400`}
            fill="currentColor"
            stroke="white"
            strokeWidth={2}
          />
        );
      case "standing":
        return (
          <Award
            className={`${iconClass} text-pink-400`}
            fill="currentColor"
            stroke="white"
            strokeWidth={2}
          />
        );
      case "weaponKillsGrenade":
        return (
          <Bomb
            className={`${iconClass} text-emerald-400`}
            fill="currentColor"
            stroke="white"
            strokeWidth={2}
          />
        );
      case "weaponKillsMelee":
        return (
          <Sword
            className={`${iconClass} text-amber-400`}
            fill="currentColor"
            stroke="white"
            strokeWidth={2}
          />
        );
      case "weaponKillsSuper":
        return (
          <Zap
            className={`${iconClass} text-indigo-400`}
            fill="currentColor"
            stroke="white"
            strokeWidth={2}
          />
        );
      case "weaponKillsAbility":
        return (
          <Zap
            className={`${iconClass} text-violet-400`}
            fill="currentColor"
            stroke="white"
            strokeWidth={2}
          />
        );
    }
  };

  const getTypeLabel = (type: SixtySevenStatType) => {
    switch (type) {
      case "kills":
        return "Kills";
      case "assists":
        return "Assists";
      case "deaths":
        return "Deaths";
      case "precisionKills":
        return "Precision Kills";
      case "opponentsDefeated":
        return "Opponents Defeated";
      case "score":
        return "Score";
      case "orbsDropped":
        return "Orbs Dropped";
      case "orbsGathered":
        return "Orbs Gathered";
      case "standing":
        return "Standing";
      case "weaponKillsGrenade":
        return "Grenade Kills";
      case "weaponKillsMelee":
        return "Melee Kills";
      case "weaponKillsSuper":
        return "Super Kills";
      case "weaponKillsAbility":
        return "Ability Kills";
    }
  };

  const getTypeColor = (type: SixtySevenStatType) => {
    switch (type) {
      case "kills":
        return "bg-red-500/20 border-red-400/50";
      case "assists":
        return "bg-blue-500/20 border-blue-400/50";
      case "deaths":
        return "bg-gray-500/20 border-gray-400/50";
      case "precisionKills":
        return "bg-yellow-500/20 border-yellow-400/50";
      case "opponentsDefeated":
        return "bg-green-500/20 border-green-400/50";
      case "score":
        return "bg-purple-500/20 border-purple-400/50";
      case "orbsDropped":
        return "bg-cyan-500/20 border-cyan-400/50";
      case "orbsGathered":
        return "bg-orange-500/20 border-orange-400/50";
      case "standing":
        return "bg-pink-500/20 border-pink-400/50";
      case "weaponKillsGrenade":
        return "bg-emerald-500/20 border-emerald-400/50";
      case "weaponKillsMelee":
        return "bg-amber-500/20 border-amber-400/50";
      case "weaponKillsSuper":
        return "bg-indigo-500/20 border-indigo-400/50";
      case "weaponKillsAbility":
        return "bg-violet-500/20 border-violet-400/50";
    }
  };

  // Get all stat types that have counts > 0
  const statTypesWithCounts = useMemo(() => {
    if (!sixtySevenStats?.counts) return [];
    return (
      Object.entries(sixtySevenStats.counts) as [SixtySevenStatType, number][]
    )
      .filter(([, count]) => count > 0)
      .sort(([, a], [, b]) => b - a);
  }, [sixtySevenStats]);

  return (
    <DestinyWrappedCard className={`bg-gradient-to-br ${colorClass}`}>
      <CardHeader className="relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 150 }}
        >
          <CardTitle className="text-3xl font-bold text-center text-white drop-shadow-lg">
            Six Seven
          </CardTitle>
        </motion.div>
      </CardHeader>
      <CardContent className="relative z-10 p-4 text-white overflow-y-auto flex-1">
        {/* Floating Shrug Emoji */}
        {hasData && (
          <motion.div
            className="absolute top-4 right-4 z-20 pointer-events-none"
            initial={{ scale: 0, rotate: -45, opacity: 0 }}
            animate={{
              scale: 1,
              rotate: -15,
              opacity: 0.8,
              y: [0, -15, 0],
            }}
            transition={{
              scale: { type: "spring", stiffness: 200, delay: 0.3 },
              rotate: { type: "spring", stiffness: 150, delay: 0.3 },
              opacity: { delay: 0.3 },
              y: {
                duration: 3,
                repeat: Infinity,
                repeatDelay: 0.5,
                ease: "easeInOut",
              },
            }}
          >
            <div className="text-6xl">🤷</div>
          </motion.div>
        )}

        {!hasData ? (
          <motion.div
            className="flex flex-col items-center justify-center py-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-8xl mb-4"
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              😔
            </motion.div>
            <p className="text-xl opacity-75">No perfect 67s this year</p>
            <p className="text-sm opacity-60 mt-2">
              The meme gods were not with you
            </p>
          </motion.div>
        ) : (
          <>
            {/* Hero Number Display */}
            <motion.div
              className="mb-6 text-center relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 120, delay: 0.1 }}
            >
              <div className="relative inline-block">
                <motion.div
                  className="text-8xl font-black mb-2 relative z-10"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  style={{
                    background:
                      "linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    textShadow: "0 0 30px rgba(251, 191, 36, 0.5)",
                  }}
                >
                  {sixtySevenStats.totalCount}
                </motion.div>
                <motion.div
                  className="absolute inset-0 text-8xl font-black opacity-20 blur-xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {sixtySevenStats.totalCount}
                </motion.div>
              </div>
              <motion.p
                className="text-lg opacity-90 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                times your stats hit the magic number{" "}
                <motion.span
                  className="font-black text-3xl inline-block relative"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 0.6,
                    delay: 0.6,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                  style={{
                    background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  67
                </motion.span>
              </motion.p>
            </motion.div>

            {/* Stat Type Counters - More Playful Layout */}
            <motion.div
              className="grid grid-cols-2 gap-2.5"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.03,
                  },
                },
              }}
            >
              {statTypesWithCounts.map(([type, count], index) => (
                <motion.div
                  key={type}
                  className={`backdrop-blur-md rounded-xl p-3 border-2 ${getTypeColor(
                    type
                  )} relative overflow-hidden group`}
                  variants={{
                    hidden: { opacity: 0, scale: 0.5, rotate: -10 },
                    visible: {
                      opacity: 1,
                      scale: 1,
                      rotate: 0,
                      transition: {
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      },
                    },
                  }}
                  whileHover={{
                    scale: 1.08,
                    y: -4,
                    rotate: [0, -2, 2, 0],
                    transition: { duration: 0.3 },
                  }}
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Animated background glow */}
                  <motion.div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-30 blur-xl ${
                      getTypeColor(type).split(" ")[0]
                    }`}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0, 0.2, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                  />

                  {/* Icon with rotation */}
                  <motion.div
                    className="flex items-center justify-center mb-2"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    {getIcon(type, "w-6 h-6")}
                  </motion.div>

                  {/* Count with bounce */}
                  <motion.div
                    className="text-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.3 + index * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 15,
                    }}
                  >
                    <motion.div
                      className="text-2xl font-black mb-0.5"
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 0.5 + index * 0.1,
                      }}
                    >
                      {count}
                    </motion.div>
                    <div className="text-[10px] font-semibold opacity-80 leading-tight">
                      {getTypeLabel(type)}
                    </div>
                  </motion.div>

                  {/* Decorative 67 badge */}
                  <motion.div
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-[10px] font-black border border-white/30"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.4 + index * 0.05, type: "spring" }}
                  >
                    67
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>

            {/* Fun footer message */}
            {statTypesWithCounts.length > 0 && (
              <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <p className="text-sm opacity-60 italic">
                  {statTypesWithCounts.length === 1
                    ? "One stat, infinite meme potential"
                    : `${statTypesWithCounts.length} different stats hitting 67? That's dedication`}
                </p>
              </motion.div>
            )}
          </>
        )}
      </CardContent>
    </DestinyWrappedCard>
  );
}
