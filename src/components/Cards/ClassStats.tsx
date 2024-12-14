"use client";

import React from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHours } from "./utils";
import { useColor } from "@/hooks/useColor";
import { DestinyWrappedCard } from "../DestinyWrappedCard";
import { DestinyClass } from "bungie-net-core/models";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { destinyClassName, destinyClassSvg } from "@/lib/maps";

interface ClassStatsCardProps {
  idx: number;
  sortedClassEntries: (readonly [
    DestinyClass,
    {
      readonly count: number;
      readonly timePlayedSeconds: number;
      readonly percentTimePlayed: number;
    }
  ])[];
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
];

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

  return (
    <DestinyWrappedCard className={`bg-gradient-to-br ${colorClass}`}>
      <CardHeader className="relative z-10">
        <CardTitle className="text-4xl font-bold text-center text-white drop-shadow-lg">
          Your class choices say a lot about you
        </CardTitle>
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
          <ChartContainer config={{}} className="flex-1">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#FFFFFF"
                  strokeWidth={1}
                >
                  {pieData.map(({ classType }, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[classType]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
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
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[classType] }}
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
