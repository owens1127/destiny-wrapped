"use client";

import React from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useColor } from "@/ui/useColor";
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
      <CardContent className="relative z-10 px-5 pt-3 pb-4 text-white">
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
              className="mb-3 text-center"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 120, delay: 0.1 }}
            >
              <p className="text-lg">
                You played with{" "}
                <motion.span
                  className="font-bold text-2xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.6, delay: 0.05 }}
                >
                  {teammateStats.totalCount}
                </motion.span>{" "}
                different Guardians this year
              </p>
            </motion.div>

            <motion.div
              className="space-y-2.5"
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

                return (
                  <motion.div
                    key={teammate.membershipId}
                    className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-2.5"
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
                        className={`flex items-center justify-center ${rankColorClass}`}
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      >
                        {rank === 1 ? (
                          <motion.span
                            className="flex-shrink-0 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: index * 0.05 + 0.1, type: "spring" }}
                          >
                            <Trophy
                              className="w-5 h-5"
                              fill="currentColor"
                              strokeWidth={2}
                            />
                          </motion.span>
                        ) : rank === 2 ? (
                          <motion.span
                            className="flex-shrink-0 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: index * 0.05 + 0.1, type: "spring" }}
                          >
                            <Trophy
                              className="w-4 h-4"
                              fill="currentColor"
                              strokeWidth={2}
                            />
                          </motion.span>
                        ) : rank === 3 ? (
                          <motion.span
                            className="flex-shrink-0 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: index * 0.05 + 0.1, type: "spring" }}
                          >
                            <Trophy
                              className="w-3.5 h-3.5"
                              fill="currentColor"
                              strokeWidth={2}
                            />
                          </motion.span>
                        ) : (
                          <motion.span
                            className="flex-shrink-0 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm tabular-nums"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: index * 0.05 + 0.1, type: "spring" }}
                          >
                            {rank}
                          </motion.span>
                        )}
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold">
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
