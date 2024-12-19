"use client";

import React from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHours } from "./utils";
import { useColor } from "@/hooks/useColor";
import { DestinyWrappedCard } from "../DestinyWrappedCard";
import Image from "next/image";
import { useGetActivityDefinition } from "@/hooks/useGetActivityDefinition";
import { newDungeonHashes, newRaidHashes } from "@/lib/maps";

interface ActivityStats {
  completed: number;
  count: number;
  timePlayed: number;
}

interface NewChallengesCardProps {
  idx: number;
  newDungeonActivities: ActivityStats;
  newRaidActivities: ActivityStats;
}

const ChallengeBlock = ({
  title,
  stats,
  isLeft,
}: {
  title: string;
  stats: ActivityStats;
  isLeft: boolean;
}) => (
  <motion.div
    className={`bg-white/10 backdrop-blur-sm rounded-lg p-6 flex flex-col ${
      isLeft ? "items-start" : "items-end"
    }`}
    initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-xl md:text-2xl font-bold mb-4">{title}</h3>
    <div className={isLeft ? "text-left" : "text-right"}>
      <p className="text-4xl font-bold">{stats.completed}</p>
      <p className="text-sm opacity-80 mt-[-0.5rem] mb-2">Completions</p>
      <p className="text-lg">
        <strong>{stats.count}</strong> attempts
      </p>
      <p className="text-lg">
        <strong>{formatHours(stats.timePlayed)}</strong> played
      </p>
    </div>
  </motion.div>
);

export function NewChallengesCard({
  newDungeonActivities,
  newRaidActivities,
  idx,
}: NewChallengesCardProps) {
  const colorClass = useColor(idx);
  const getActivityDefinition = useGetActivityDefinition();

  return (
    <DestinyWrappedCard className={`bg-gradient-to-br ${colorClass}`}>
      <CardHeader className="relative z-10">
        <CardTitle className="text-4xl font-bold text-center text-white drop-shadow-lg">
          You tackled some new Challenges
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 p-6 text-white">
        <div className="grid grid-cols-2 gap-6 items-center">
          <ChallengeBlock
            title="Vesper's Host"
            stats={newDungeonActivities}
            isLeft={true}
          />
          <Image
            src={
              "https://www.bungie.net" +
              (getActivityDefinition(newDungeonHashes[0])?.pgcrImage ?? "")
            }
            alt="Vesper's Host"
            width={200}
            height={200}
            className="rounded-lg"
          />
        </div>
        <div className="grid grid-cols-2 gap-6 items-center">
          <Image
            src={
              "https://www.bungie.net" +
              (getActivityDefinition(newRaidHashes[0])?.pgcrImage ?? "")
            }
            alt="Salvation's Edge"
            width={200}
            height={200}
            className="rounded-lg"
          />
          <ChallengeBlock
            title="Salvation's Edge"
            stats={newRaidActivities}
            isLeft={false}
          />
        </div>
      </CardContent>
    </DestinyWrappedCard>
  );
}
