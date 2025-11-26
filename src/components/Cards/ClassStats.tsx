"use client";

import React from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHours } from "./utils";
import { useColor } from "@/hooks/useColor";
import { DestinyWrappedCard } from "../DestinyWrappedCard";
import { DestinyClass } from "bungie-net-core/enums";
import { DestinyClass as DestinyClassEnum } from "bungie-net-core/models";
import { PieChart, Pie, Cell } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { destinyClassName, destinyClassSvg } from "@/lib/classes";

interface ClassStatsCardProps {
  idx: number;
  sortedClassEntries: (readonly [
    DestinyClassEnum,
    {
      readonly count: number;
      readonly timePlayedSeconds: number;
      readonly percentTimePlayed: number;
    }
  ])[];
}

// Class colors: Warlock = yellow, Titan = red, Hunter = blue
const CLASS_COLORS: { [key: number]: string } = {
  [DestinyClass.Warlock]: "#fbbf24", // yellow-400
  [DestinyClass.Titan]: "#ef4444", // red-500
  [DestinyClass.Hunter]: "#3b82f6", // blue-500
};

export function ClassStatsCard({
  sortedClassEntries,
  idx,
}: ClassStatsCardProps) {
  const colorClass = useColor(idx);
  const pieData = sortedClassEntries.map(
    ([classType, { percentTimePlayed }]) => ({
      name: destinyClassName[classType],
      value: percentTimePlayed,
      classType,
    })
  );

  const [mostPlayedClass] = sortedClassEntries[0];
  const ClassIcon = destinyClassSvg[mostPlayedClass];

  // Dynamic title based on the most played class
  const getTitle = () => {
    switch (mostPlayedClass) {
      case DestinyClass.Titan:
        return (
          <>
            You <i>punch</i> first, ask questions later
          </>
        );
      case DestinyClass.Hunter:
        return (
          <>
            You <i>danced</i> your way to victory
          </>
        );
      case DestinyClass.Warlock:
        return (
          <>
            You <i>floated</i> above the competition
          </>
        );
      default:
        return <>Guardian classes</>;
    }
  };

  return (
    <DestinyWrappedCard className={`bg-gradient-to-br ${colorClass}`}>
      <CardHeader className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 150 }}
        >
          <CardTitle className="text-4xl font-bold text-center text-white drop-shadow-lg">
            {getTitle()}
          </CardTitle>
        </motion.div>
      </CardHeader>
      <CardContent className="relative z-10 p-6 text-white">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-stretch justify-center mb-4"
        >
          <div className="flex-1 flex flex-col items-center justify-center">
            <ClassIcon className="w-36 h-36 text-white fill-current" />
            <div className="text-center text-4xl">
              {destinyClassName[mostPlayedClass]}
            </div>
            <div className="text-center text-md">was your favorite class</div>
          </div>
          <div
            className="flex-1 min-w-0"
            style={{ width: "100%", height: "300px" }}
          >
            <ChartContainer config={{}} className="w-full h-full">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#FFFFFF"
                  strokeWidth={1}
                >
                  {pieData.map(({ classType }, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CLASS_COLORS[classType] || "#8884d8"}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>
        </motion.div>
        <motion.div
          className="space-y-4 mt-8"
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
          {sortedClassEntries.map(
            ([classType, { count, timePlayedSeconds, percentTimePlayed }]) => (
              <motion.div
                key={classType}
                className="flex items-center justify-between space-x-4 bg-white/10 backdrop-blur-sm rounded-lg p-4"
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
                <div className="flex items-center space-x-4">
                  <motion.div
                    className="w-4 h-4 rounded-full"
                    style={{
                      backgroundColor: CLASS_COLORS[classType] || "#8884d8",
                    }}
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  />
                  <div>
                    <h3 className="text-xl font-bold">
                      {destinyClassName[classType]}
                    </h3>
                    <p className="text-sm opacity-80">
                      {formatHours(timePlayedSeconds)} • {count} activities
                    </p>
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  {percentTimePlayed.toFixed(1)}%
                </div>
              </motion.div>
            )
          )}
        </motion.div>
      </CardContent>
    </DestinyWrappedCard>
  );
}
