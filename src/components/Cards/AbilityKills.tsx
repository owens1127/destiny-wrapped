"use client";

import React from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useColor } from "@/hooks/useColor";
import { DestinyWrappedCard } from "../DestinyWrappedCard";
import { Zap, Bomb, Hand } from "lucide-react";

interface AbilityStats {
  superKills: number;
  grenadeKills: number;
  meleeKills: number;
}

interface AbilityKillsCardProps {
  idx: number;
  abilityStats: AbilityStats | null;
  hasPGCRData: boolean;
}

export function AbilityKillsCard({
  abilityStats,
  idx,
  hasPGCRData,
}: AbilityKillsCardProps) {
  const colorClass = useColor(idx);
  const hasData = abilityStats && (abilityStats.superKills > 0 || abilityStats.grenadeKills > 0 || abilityStats.meleeKills > 0);
  
  const totalAbilityKills = hasData
    ? abilityStats.superKills + abilityStats.grenadeKills + abilityStats.meleeKills
    : 0;

  const stats = hasData
    ? [
        {
          label: "Super Kills",
          value: abilityStats.superKills,
          icon: Zap,
          color: "text-yellow-400",
          percentage: totalAbilityKills > 0 ? ((abilityStats.superKills / totalAbilityKills) * 100).toFixed(1) : "0",
        },
        {
          label: "Grenade Kills",
          value: abilityStats.grenadeKills,
          icon: Bomb,
          color: "text-green-400",
          percentage: totalAbilityKills > 0 ? ((abilityStats.grenadeKills / totalAbilityKills) * 100).toFixed(1) : "0",
        },
        {
          label: "Melee Kills",
          value: abilityStats.meleeKills,
          icon: Hand,
          color: "text-red-400",
          percentage: totalAbilityKills > 0 ? ((abilityStats.meleeKills / totalAbilityKills) * 100).toFixed(1) : "0",
        },
      ].filter((stat) => stat.value > 0)
    : [];

  return (
    <DestinyWrappedCard className={`bg-gradient-to-br ${colorClass}`}>
      <CardHeader className="relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 150 }}
        >
          <CardTitle className="text-4xl font-bold text-center text-white drop-shadow-lg">
            <i>Power</i> <i>unleashed</i>
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
            <Zap className="w-16 h-16 mb-4 opacity-50" fill="currentColor" stroke="white" strokeWidth={2} />
            <p className="text-xl opacity-75">
              {hasPGCRData
                ? "No ability kill data available"
                : "Download PGCR data to see your ability stats"}
            </p>
          </motion.div>
        ) : (
          <>
            {/* Hero stat */}
            <motion.div
              className="mb-8 text-center"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 120, delay: 0.1 }}
            >
              <p className="text-lg opacity-80 mb-2">Total ability eliminations</p>
              <motion.span
                className="font-bold text-5xl block"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {totalAbilityKills.toLocaleString()}
              </motion.span>
            </motion.div>

            {/* Grid layout for ability stats */}
            <div className="grid grid-cols-1 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 100,
                      damping: 10,
                      delay: 0.2 + index * 0.1
                    }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div
                          style={{ transform: `rotate(${(index * 15) - 15}deg)` }}
                        >
                          <Icon className={`w-10 h-10 ${stat.color}`} fill="currentColor" stroke="white" strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold">{stat.label}</h3>
                          <p className="text-sm opacity-80">
                            {stat.percentage}% of total
                          </p>
                        </div>
                      </div>
                      <motion.div
                        className={`text-3xl font-bold ${stat.color}`}
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      >
                        {stat.value.toLocaleString()}
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </DestinyWrappedCard>
  );
}

