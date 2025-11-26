"use client";

import React from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHours } from "./utils";
import { useColor } from "@/hooks/useColor";
import { DestinyWrappedCard } from "../DestinyWrappedCard";
import Image from "next/image";
import { useGetActivityDefinition } from "@/hooks/useGetActivityDefinition";
import { new2025Challenges } from "@/lib/challenges";

interface ActivityStats {
  name: string;
  completed: number;
  count: number;
  timePlayed: number;
}

interface NewChallengesCardProps {
  idx: number;
  newDungeonActivities: Record<number, ActivityStats>;
  newRaidActivities: Record<number, ActivityStats>;
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
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: "spring", stiffness: 100, damping: 12 }}
    whileHover={{ scale: 1.02 }}
  >
    <h3 className="text-xl md:text-2xl font-bold mb-4">{title}</h3>
    <div className={isLeft ? "text-left" : "text-right"}>
      <motion.p 
        className="text-4xl font-bold"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
      >
        {stats.completed}
      </motion.p>
      <p className="text-sm opacity-80 mt-[-0.5rem] mb-2">Completions</p>
      <p className="text-lg">
        <strong>{stats.count}</strong> total attempts
      </p>
      <p className="text-lg">
        <strong>{formatHours(stats.timePlayed)}</strong> time invested
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

  // Get all dungeons and raids that have activities
  const dungeonsWithActivities = new2025Challenges.dungeons
    .map((dungeon) => ({
      ...dungeon,
      stats: newDungeonActivities[dungeon.hash],
    }))
    .filter((d) => d.stats && d.stats.count > 0);

  const raidsWithActivities = new2025Challenges.raids
    .map((raid) => ({
      ...raid,
      stats: newRaidActivities[raid.hash],
    }))
    .filter((r) => r.stats && r.stats.count > 0);

  const totalChallenges = dungeonsWithActivities.length + raidsWithActivities.length;

  if (totalChallenges === 0) {
    return null;
  }

  return (
    <DestinyWrappedCard className={`bg-gradient-to-br ${colorClass}`}>
      <CardHeader className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 150 }}
        >
        <CardTitle className="text-4xl font-bold text-center text-white drop-shadow-lg">
            You <i>conquered</i> new challenges
        </CardTitle>
        </motion.div>
      </CardHeader>
      <CardContent className="relative z-10 p-6 text-white space-y-6">
        {/* Dungeons */}
        {dungeonsWithActivities.map((dungeon, index) => (
          <motion.div
            key={dungeon.hash}
            className="grid grid-cols-2 gap-6 items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <ChallengeBlock
              title={dungeon.name}
              stats={dungeon.stats!}
              isLeft={index % 2 === 0}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0, rotate: 90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: index * 0.1 + 0.3 }}
            >
            <Image
              src={
                "https://www.bungie.net" +
                (getActivityDefinition(dungeon.hash)?.pgcrImage ?? "")
              }
              alt={dungeon.name}
              width={200}
              height={200}
              className="rounded-lg"
                unoptimized
            />
            </motion.div>
          </motion.div>
        ))}

        {/* Raids */}
        {raidsWithActivities.map((raid, index) => (
          <motion.div
            key={raid.hash}
            className="grid grid-cols-2 gap-6 items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: (dungeonsWithActivities.length + index) * 0.1,
            }}
          >
            {index % 2 === 0 ? (
              <>
                <ChallengeBlock
                  title={raid.name}
                  stats={raid.stats!}
                  isLeft={true}
                />
                <Image
                  src={
                    "https://www.bungie.net" +
                    (getActivityDefinition(raid.hash)?.pgcrImage ?? "")
                  }
                  alt={raid.name}
                  width={200}
                  height={200}
                  className="rounded-lg"
                  unoptimized
                />
              </>
            ) : (
              <>
                <Image
                  src={
                    "https://www.bungie.net" +
                    (getActivityDefinition(raid.hash)?.pgcrImage ?? "")
                  }
                  alt={raid.name}
                  width={200}
                  height={200}
                  className="rounded-lg"
                  unoptimized
                />
                <ChallengeBlock
                  title={raid.name}
                  stats={raid.stats!}
                  isLeft={false}
                />
              </>
            )}
          </motion.div>
        ))}
      </CardContent>
    </DestinyWrappedCard>
  );
}
