"use client";
import React from "react";
import { motion } from "framer-motion";
import { formatHours } from "./utils";
import { useColor } from "@/hooks/useColor";
import { DestinyWrappedCard } from "../DestinyWrappedCard";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LeastFavoriteSeasonProps {
  idx: number;
  leastPopularSeason: {
    name: string;
    count: number;
    timePlayedSeconds: number;
  };
  totalStats: {
    playTime: number;
  };
}

export function LeastFavoriteSeasonCard({
  leastPopularSeason,
  idx,
}: LeastFavoriteSeasonProps) {
  const colorClass = useColor(idx);

  return (
    <DestinyWrappedCard className={`bg-gradient-to-br ${colorClass}`}>
      <CardHeader className="relative z-10">
        <CardTitle className="text-4xl font-bold text-center text-white drop-shadow-lg">
          Sometimes it&apos;s good to take a break
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 flex flex-col items-center justify-center p-6 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <p className="text-xl mb-2">
            Your <i>least</i> favorite season was
          </p>
          <h3 className="text-4xl font-bold">{leastPopularSeason.name}</h3>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-8"
        >
          <p className="text-lg mb-2">Where you only played</p>
          <div className="grid grid-cols-2 gap-8">
            <motion.div
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h4 className="text-3xl font-semibold">
                {formatHours(leastPopularSeason.timePlayedSeconds)}
              </h4>
              <p className="text-xl">hours</p>
            </motion.div>
            <motion.div
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h4 className="text-3xl font-semibold">
                {leastPopularSeason.count}
              </h4>
              <p className="text-xl">activities</p>
            </motion.div>
          </div>
        </motion.div>
      </CardContent>
    </DestinyWrappedCard>
  );
}
