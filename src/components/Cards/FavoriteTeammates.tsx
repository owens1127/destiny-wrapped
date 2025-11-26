"use client";

import React from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useColor } from "@/hooks/useColor";
import { DestinyWrappedCard } from "../DestinyWrappedCard";
import { Trophy } from "lucide-react";

interface Teammate {
  displayName: string;
  membershipId: string;
  activityCount: number;
  bungieGlobalDisplayNameCode?: number;
}

interface FavoriteTeammatesCardProps {
  idx: number;
  teammateStats: { teammates: Teammate[]; totalCount: number } | null;
  hasPGCRData: boolean;
}

export function FavoriteTeammatesCard({
  teammateStats,
  idx,
  hasPGCRData,
}: FavoriteTeammatesCardProps) {
  const colorClass = useColor(idx);
  const hasData = teammateStats && teammateStats.teammates.length > 0;
  const topTeammates = hasData ? teammateStats.teammates.slice(0, 7) : [];

  return (
    <DestinyWrappedCard className={`bg-gradient-to-br ${colorClass}`}>
      <CardHeader className="relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 150 }}
        >
          <CardTitle className="text-4xl font-bold text-center text-white drop-shadow-lg">
            Your best friends
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
            <p className="text-xl opacity-75">
              {hasPGCRData
                ? "No teammate data available"
                : "Download PGCR data to see your favorite teammates"}
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
                You played with{" "}
                <motion.span
                  className="font-bold text-3xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  {teammateStats.totalCount}
                </motion.span>{" "}
                different Guardians this year
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
              {topTeammates.map((teammate, index) => {
                const rank = index + 1;
                const rankColorClass =
                  rank === 1
                    ? "text-yellow-400" // Gold
                    : rank === 2
                    ? "text-gray-300" // Silver
                    : rank === 3
                    ? "text-orange-600" // Bronze
                    : "text-white"; // Default white
                const rankSizeClass =
                  rank === 1
                    ? "text-4xl" // Largest
                    : rank === 2
                    ? "text-3xl" // Medium
                    : rank === 3
                    ? "text-2xl" // Smaller
                    : "text-xl"; // Smallest

                return (
                  <motion.div
                    key={teammate.membershipId}
                    className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-4"
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
                      <motion.div
                        className={`flex items-center justify-center ${rankSizeClass} font-bold ${rankColorClass}`}
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      >
                        {rank === 1 ? (
                          <div className="flex items-center gap-2">
                            <Trophy
                              className={`${
                                rank === 1
                                  ? "w-8 h-8"
                                  : rank === 2
                                  ? "w-6 h-6"
                                  : "w-5 h-5"
                              }`}
                              fill="currentColor"
                              strokeWidth={2}
                            />
                            <span>{rank}</span>
                          </div>
                        ) : rank === 2 ? (
                          <div className="flex items-center gap-2">
                            <Trophy
                              className="w-6 h-6"
                              fill="currentColor"
                              strokeWidth={2}
                            />
                            <span>{rank}</span>
                          </div>
                        ) : rank === 3 ? (
                          <div className="flex items-center gap-2">
                            <Trophy
                              className="w-5 h-5"
                              fill="currentColor"
                              strokeWidth={2}
                            />
                            <span>{rank}</span>
                          </div>
                        ) : (
                          rank
                        )}
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">
                          {teammate.displayName}
                          {teammate.bungieGlobalDisplayNameCode !==
                            undefined && (
                            <span className="text-sm font-normal opacity-70">
                              #{teammate.bungieGlobalDisplayNameCode}
                            </span>
                          )}
                        </h3>
                        <p className="text-sm opacity-80">
                          {teammate.activityCount} activities together
                        </p>
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
