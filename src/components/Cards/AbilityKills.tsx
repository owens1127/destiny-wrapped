"use client";

import React from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useColor } from "@/ui/useColor";
import { DestinyWrappedCard } from "../DestinyWrappedCard";
import { Sparkles, Bomb, Zap } from "lucide-react";

interface AbilityStats {
  superKills: number;
  grenadeKills: number;
  meleeKills: number;
  abilityKills: number;
}

interface AbilityKillsCardProps {
  idx: number;
  abilityStats: AbilityStats | null;
  hasPGCRData: boolean;
  totalActivities?: number;
}

export function AbilityKillsCard({
  abilityStats,
  idx,
  hasPGCRData,
  totalActivities = 0,
}: AbilityKillsCardProps) {
  const colorClass = useColor(idx);
  const hasData =
    abilityStats &&
    (abilityStats.superKills > 0 ||
      abilityStats.grenadeKills > 0 ||
      abilityStats.meleeKills > 0 ||
      abilityStats.abilityKills > 0);

  const totalAbilityKills = hasData
    ? abilityStats.superKills +
      abilityStats.grenadeKills +
      abilityStats.meleeKills +
      abilityStats.abilityKills
    : 0;

  const stats = hasData
    ? [
        {
          label: "Super Kills",
          value: abilityStats.superKills,
          color: "#fbbf24",
          icon: Sparkles,
          perActivity:
            totalActivities > 0
              ? (abilityStats.superKills / totalActivities).toFixed(1)
              : "0",
        },
        {
          label: "Grenade Kills",
          value: abilityStats.grenadeKills,
          color: "#10b981",
          icon: Bomb,
          perActivity:
            totalActivities > 0
              ? (abilityStats.grenadeKills / totalActivities).toFixed(1)
              : "0",
        },
        {
          label: "Melee Kills",
          value: abilityStats.meleeKills,
          color: "#ef4444",
          icon: Zap,
          perActivity:
            totalActivities > 0
              ? (abilityStats.meleeKills / totalActivities).toFixed(1)
              : "0",
        },
      ].filter((stat) => stat.value > 0)
    : [];

  // Calculate rotations and positions for creative layout
  const getRotation = (index: number) => {
    const rotations = [-6, 4, -8];
    return rotations[index % 3];
  };

  const getOffset = (index: number) => {
    const offsets = [
      { x: "-3%", y: "0%" },
      { x: "5%", y: "0%" },
      { x: "-2%", y: "0%" },
    ];
    return offsets[index % 3];
  };

  return (
    <DestinyWrappedCard className={`bg-gradient-to-br ${colorClass} relative`}>
      <CardHeader className="relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 150 }}
        >
          <CardTitle className="text-4xl font-bold text-center text-white drop-shadow-lg">
            <i>What&apos;s &ldquo;power creep&rdquo;?</i>
          </CardTitle>
        </motion.div>
      </CardHeader>
      <CardContent className="relative z-10 p-3 sm:p-4 text-white h-full flex flex-col">
        {!hasData ? (
          <motion.div
            className="flex flex-col items-center justify-center py-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xl opacity-75">
              {hasPGCRData
                ? "No ability kill data available"
                : "Download PGCR data to see your ability stats"}
            </p>
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col relative">
            {/* Hero stat - off-center, tilted */}
            <motion.div
              className="relative mb-2"
              initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: -2 }}
              transition={{ type: "spring", stiffness: 120, delay: 0.1 }}
              style={{ transformOrigin: "top left" }}
            >
              <div className="relative" style={{ left: "5%", top: "10px" }}>
                <motion.p
                  className="text-xs opacity-60 mb-0.5 font-medium tracking-wider uppercase"
                  style={{ transform: "rotate(-1deg)" }}
                >
                  Total ability eliminations
                </motion.p>
                <motion.span
                  className="font-black text-2xl sm:text-3xl block leading-none"
                  style={{
                    textShadow: "2px 2px 0px rgba(0,0,0,0.3)",
                    transform: "rotate(-2deg)",
                  }}
                  animate={{
                    scale: [1, 1.01, 1],
                    rotate: [-2, -1, -2],
                  }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  {totalAbilityKills.toLocaleString()}
                </motion.span>
              </div>
            </motion.div>

            {/* Creative tilted card layout */}
            <div className="flex-1 relative space-y-1.5 sm:space-y-2  mt-2">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                const rotation = getRotation(index);
                const offset = getOffset(index);
                const isLeft = index % 2 === 0;

                return (
                  <motion.div
                    key={stat.label}
                    className="relative"
                    initial={{
                      opacity: 0,
                      y: 50,
                      rotate: rotation + (isLeft ? -5 : 5),
                      scale: 0.8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      rotate: rotation,
                      scale: 1,
                    }}
                    transition={{
                      type: "spring",
                      delay: 0.2 + index * 0.2,
                      stiffness: 80,
                      damping: 12,
                    }}
                    style={{
                      left: isLeft ? offset.x : "auto",
                      right: !isLeft ? offset.x : "auto",
                      top: offset.y,
                    }}
                  >
                    {/* Tilted card background */}
                    <motion.div
                      className="relative bg-white/10 backdrop-blur-md rounded-lg p-1.5 sm:p-2 border-2 border-white/20 max-w-[85%] mx-auto"
                      style={{
                        transform: `rotate(${rotation}deg)`,
                        transformOrigin: "center",
                        boxShadow: `0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`,
                      }}
                      whileHover={{
                        scale: 1.02,
                        rotate: rotation + (rotation > 0 ? 1 : -1),
                        borderColor: `rgba(255,255,255,0.4)`,
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {/* Glow effect */}
                      <div
                        className="absolute inset-0 rounded-lg opacity-20 blur-md"
                        style={{
                          backgroundColor: stat.color,
                          transform: `rotate(${-rotation}deg)`,
                        }}
                      />

                      <div className="relative z-10 flex flex-col items-center">
                        {/* Icon - tilted, off-center */}
                        <motion.div
                          className="relative mb-0.5"
                          style={{
                            width: "28px",
                            height: "28px",
                            transform: `rotate(${
                              -rotation + (isLeft ? -10 : 10)
                            }deg)`,
                          }}
                          animate={{
                            rotate: [
                              -rotation + (isLeft ? -10 : 10),
                              -rotation + (isLeft ? -6 : 6),
                              -rotation + (isLeft ? -10 : 10),
                            ],
                            scale: [1, 1.06, 1],
                          }}
                          transition={{
                            duration: 3,
                            delay: index * 0.5,
                            repeat: Infinity,
                            repeatDelay: 2,
                          }}
                        >
                          <div
                            className="absolute inset-0 blur-lg opacity-30"
                            style={{ backgroundColor: stat.color }}
                          />
                          <Icon
                            className="relative z-10 w-full h-full"
                            style={{ color: stat.color }}
                            fill="currentColor"
                            stroke="white"
                            strokeWidth={1.5}
                          />
                        </motion.div>

                        {/* Label - tilted text */}
                        <motion.h3
                          className="text-xs font-bold uppercase tracking-wider mb-0.5 opacity-80 text-center"
                          style={{
                            transform: `rotate(${
                              -rotation + (isLeft ? 1 : -1)
                            }deg)`,
                          }}
                        >
                          {stat.label}
                        </motion.h3>

                        {/* Value - bold, tilted */}
                        <motion.div
                          className="mb-0.5 text-center"
                          style={{
                            transform: `rotate(${-rotation}deg)`,
                          }}
                        >
                          <motion.span
                            className="text-xl sm:text-2xl font-black block leading-none"
                            style={{
                              color: stat.color,
                              textShadow: `1px 1px 0px rgba(0,0,0,0.5), 0 0 12px ${stat.color}40`,
                            }}
                            animate={{
                              scale: [1, 1.03, 1],
                            }}
                            transition={{
                              duration: 2,
                              delay: 0.5 + index * 0.3,
                              repeat: Infinity,
                              repeatDelay: 3,
                            }}
                          >
                            {stat.value.toLocaleString()}
                          </motion.span>
                        </motion.div>

                        {/* Per activity badge - tilted */}
                        <motion.div
                          className="inline-block"
                          style={{
                            transform: `rotate(${
                              -rotation + (isLeft ? 1.5 : -1.5)
                            }deg)`,
                          }}
                        >
                          <div
                            className="bg-white/20 rounded-full px-1.5 py-0.5 border border-white/30"
                            style={{
                              boxShadow: `0 1px 4px rgba(0,0,0,0.2)`,
                            }}
                          >
                            <span className="text-xs font-semibold opacity-90">
                              {stat.perActivity} per activity
                            </span>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            {/* Decorative elements - floating numbers */}
            <motion.div
              className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 opacity-10 pointer-events-none"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.08, scale: 1 }}
              transition={{ delay: 1 }}
            >
              <motion.span
                className="text-4xl sm:text-5xl font-black"
                style={{ transform: "rotate(8deg)" }}
                animate={{ rotate: [8, 10, 8] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                {totalAbilityKills.toLocaleString().slice(0, 1)}
              </motion.span>
            </motion.div>
          </div>
        )}
      </CardContent>
    </DestinyWrappedCard>
  );
}
