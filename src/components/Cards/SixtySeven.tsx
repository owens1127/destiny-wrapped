"use client";

import React from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useColor } from "@/hooks/useColor";
import { DestinyWrappedCard } from "../DestinyWrappedCard";
import { Skull, Target, Handshake } from "lucide-react";

interface SixtySevenStats {
  counts: {
    kills: number;
    assists: number;
    deaths: number;
  };
  totalKills: number;
  totalAssists: number;
  totalDeaths: number;
}

interface SixtySevenCardProps {
  idx: number;
  sixtySevenStats: SixtySevenStats | null;
}

export function SixtySevenCard({ sixtySevenStats, idx }: SixtySevenCardProps) {
  const colorClass = useColor(idx);
  const hasData =
    sixtySevenStats !== null &&
    (sixtySevenStats.counts.kills > 0 ||
      sixtySevenStats.counts.assists > 0 ||
      sixtySevenStats.counts.deaths > 0);

  const getIcon = (type: string) => {
    switch (type) {
      case "kills":
        return (
          <Target
            className="w-8 h-8 text-red-400"
            fill="currentColor"
            stroke="white"
            strokeWidth={2}
          />
        );
      case "assists":
        return (
          <Handshake
            className="w-8 h-8 text-blue-400"
            fill="currentColor"
            stroke="white"
            strokeWidth={2}
          />
        );
      case "deaths":
        return (
          <Skull
            className="w-8 h-8 text-gray-400"
            fill="currentColor"
            stroke="white"
            strokeWidth={2}
          />
        );
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "kills":
        return "Kills";
      case "assists":
        return "Assists";
      case "deaths":
        return "Deaths";
      default:
        return type;
    }
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
            Your <i>67</i> <i>moments</i>
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
            <p className="text-xl opacity-75">No perfect 67s this year</p>
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
                Times your stats hit exactly{" "}
                <motion.span
                  className="font-bold text-2xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  67
                </motion.span>
              </p>
            </motion.div>

            <motion.div
              className="space-y-4"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {[
                {
                  type: "kills",
                  count: sixtySevenStats.counts.kills,
                  total: sixtySevenStats.totalKills,
                },
                {
                  type: "assists",
                  count: sixtySevenStats.counts.assists,
                  total: sixtySevenStats.totalAssists,
                },
                {
                  type: "deaths",
                  count: sixtySevenStats.counts.deaths,
                  total: sixtySevenStats.totalDeaths,
                },
              ]
                .filter((stat) => stat.count > 0)
                .map((stat, index) => {
                  const isPerfectTotal = stat.total === 67;
                  return (
                    <motion.div
                      key={stat.type}
                      className={`flex items-center justify-between backdrop-blur-sm rounded-lg p-4 ${
                        isPerfectTotal
                          ? "bg-yellow-500/30 ring-2 ring-yellow-400"
                          : "bg-white/10"
                      }`}
                      variants={{
                        hidden: { opacity: 0, scale: 0.8 },
                        visible: {
                          opacity: 1,
                          scale: 1,
                          transition: {
                            type: "spring",
                            stiffness: 100,
                            damping: 10,
                          },
                        },
                      }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div
                          style={{
                            transform: `rotate(${index * 8 - 8}deg)`,
                          }}
                        >
                          {getIcon(stat.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold">
                            {getTypeLabel(stat.type)}:{" "}
                            <span className="text-3xl">{stat.count}</span>{" "}
                            {stat.count === 1 ? "time" : "times"}
                          </h3>
                          {isPerfectTotal && (
                            <p className="text-sm font-bold text-yellow-300">
                              ✨ Total is also 67! ✨
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </motion.div>
          </>
        )}
      </CardContent>
    </DestinyWrappedCard>
  );
}
