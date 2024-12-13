"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useColor } from "@/hooks/useColor";
import { DestinyWrappedCard } from "../DestinyWrappedCard";
import { useGetActivityDefinition } from "@/hooks/useGetActivityDefinition";
import Image from "next/image";

interface SummaryCardProps {
  idx: number;
  displayName: React.ReactNode;
  totalStats: {
    playTime: number;
    count: number;
    kills: number;
    deaths: number;
  };
  topActivity: {
    hash: number;
  };
  topMode: {
    mode: number;
  };
  pvePvpSplit: {
    ratio: number;
  };
  activityModeNames: Record<number, string>;
}

export function SummaryCard({
  idx,
  displayName,
  totalStats,
  topActivity,
  topMode,
  pvePvpSplit,
  activityModeNames,
}: SummaryCardProps) {
  const colorClass = useColor(idx);
  const getActivityDefinition = useGetActivityDefinition();

  const getPvePvpSplit = useMemo(() => {
    if (pvePvpSplit.ratio >= 1.05) {
      return {
        value: (Math.round(pvePvpSplit.ratio * 10) / 10).toFixed(1) + "x",
        bottom: (
          <span>
            as much <i>PvE</i> as <i>PvP</i>
          </span>
        ),
      };
    } else if (1 / pvePvpSplit.ratio >= 1.05) {
      return {
        value: (Math.round((1 / pvePvpSplit.ratio) * 10) / 10).toFixed(1) + "x",
        bottom: (
          <span>
            as much <i>PvP</i> as <i>PvE</i>
          </span>
        ),
      };
    } else {
      return {
        value: "Equal",
        bottom: (
          <span>
            amounts of <i>PvE</i> and <i>PvP</i>
          </span>
        ),
      };
    }
  }, [pvePvpSplit.ratio]);

  return (
    <DestinyWrappedCard className={`bg-gradient-to-br ${colorClass}`}>
      <CardHeader className="relative z-10">
        <CardTitle className="text-4xl font-bold text-center text-white drop-shadow-lg">
          <div className="text-2xl font-normal">
            <i>Destiny 2</i> Wrapped 2024
          </div>
          <h4>{displayName}</h4>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 flex flex-col items-center justify-center p-6 pt-0 text-white">
        <motion.div
          className="grid grid-cols-2 gap-x-6 gap-y-4 w-full mb-4"
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
          <BubbledStat
            idx={idx + 1}
            value={Math.round(totalStats.playTime / 3600).toLocaleString()}
            label="Hours"
          />
          <BubbledStat
            idx={idx + 3}
            value={totalStats.count.toLocaleString()}
            label="Activities"
          />
          <BubbledStat
            idx={idx + 4}
            value={totalStats.kills.toLocaleString()}
            label="Kills"
          />
          <BubbledStat
            idx={idx + 2}
            value={totalStats.deaths.toLocaleString()}
            label="Deaths"
          />
        </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [1.2, 1] }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-around items-center mb-4 w-full"
        >
          <div className="text-center">
            <div className="text-md">Played</div>
            <div className="text-6xl font-bold mb-2">
              {getPvePvpSplit.value}
            </div>
            <div className="text-md">{getPvePvpSplit.bottom}</div>
          </div>
          <div className="text-center">
            <div className="text-m mb-2">Favorite category</div>
            <div className="text-5xl font-bold">
              {activityModeNames[topMode.mode]}
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [1.2, 1] }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center relative aspect-w-16 aspect-h-9 min-w-full"
        >
          <Image
            className="rounded-lg"
            src={
              "https://www.bungie.net" +
              (getActivityDefinition(topActivity.hash)?.pgcrImage ?? "")
            }
            width={400}
            height={225}
            alt={
              getActivityDefinition(topActivity.hash)?.displayProperties.name ??
              ""
            }
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-75 text-white text-lg py-3 w-full">
              Favorite activity
              <br />
              <div className="text-2xl font-semibold italic">
                {
                  getActivityDefinition(topActivity.hash)?.displayProperties
                    .name
                }
              </div>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </DestinyWrappedCard>
  );
}

const BubbledStat = ({
  value,
  label,
  idx,
}: {
  value: string | number;
  label: string;
  idx: number;
}) => {
  const colorClass = useColor(idx);
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      className={`text-center rounded-md px-4 py-2 bg-gradient-to-b ${colorClass} drop-shadow-2xl`}
    >
      <div className="text-md font-medium mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </motion.div>
  );
};
