"use client";

import React from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useColor } from "@/hooks/useColor";
import { DestinyWrappedCard } from "../DestinyWrappedCard";
import { useGetItemDefinition } from "@/hooks/useGetItemDefinition";
import Image from "next/image";

interface WeaponUsageStats {
  weaponKills: Map<number, number>;
  topWeapons: Array<{ hash: number; kills: number }>;
}

interface WeaponCardProps {
  idx: number;
  weaponStats: WeaponUsageStats | null;
  hasPGCRData: boolean;
  title: React.ReactNode;
  headerText: string;
  headerSuffix?: string;
  killLabel: string;
  noDataMessage: string;
  noDataDownloadMessage: string;
}

export function WeaponCard({
  weaponStats,
  idx,
  hasPGCRData,
  title,
  headerText,
  headerSuffix,
  killLabel,
  noDataMessage,
  noDataDownloadMessage,
}: WeaponCardProps) {
  const colorClass = useColor(idx);
  const getItemDefinition = useGetItemDefinition();

  const hasData =
    weaponStats &&
    weaponStats.weaponKills.size > 0 &&
    weaponStats.topWeapons.length > 0;
  const topWeapons = hasData ? weaponStats.topWeapons.slice(0, 5) : [];
  const totalKills = hasData
    ? Array.from(weaponStats.weaponKills.values()).reduce(
        (sum, kills) => sum + kills,
        0
      )
    : 0;

  return (
    <DestinyWrappedCard className={`bg-gradient-to-br ${colorClass}`}>
      <CardHeader className="relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 150 }}
        >
          <CardTitle className="text-4xl font-bold text-center text-white drop-shadow-lg">
            {title}
          </CardTitle>
        </motion.div>
      </CardHeader>
      <CardContent className="relative z-10 px-4 py-6 text-white">
        {!hasData ? (
          <motion.div
            className="flex flex-col items-center justify-center py-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xl opacity-75">
              {hasPGCRData ? noDataMessage : noDataDownloadMessage}
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
                {headerText}{" "}
                <motion.span
                  className="font-bold text-3xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  {totalKills.toLocaleString()}
                </motion.span>
                {headerSuffix && ` ${headerSuffix}`}
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
              {topWeapons.map((weapon, index) => {
                const weaponDef = getItemDefinition(weapon.hash);
                const percentage = totalKills
                  ? ((weapon.kills / totalKills) * 100).toFixed(1)
                  : "0";

                // Generate a consistent random rotation based on weapon hash (-10 to 10 degrees)
                const randomRotation = ((5 + weapon.hash) % 20) - 10;

                return (
                  <motion.div
                    key={weapon.hash}
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
                        className="text-2xl font-bold text-yellow-400 min-w-[1rem]"
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      >
                        {index + 1}
                      </motion.div>
                      {weaponDef?.displayProperties.icon && (
                        <div
                          className="relative w-12 h-12 flex-shrink-0"
                          style={{ transform: `rotate(${randomRotation}deg)` }}
                        >
                          <Image
                            src={`https://www.bungie.net${weaponDef.displayProperties.icon}`}
                            alt={weaponDef.displayProperties.name || "Weapon"}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">
                          {weaponDef?.displayProperties.name ||
                            "Unknown Weapon"}
                        </h3>
                        <p className="text-sm opacity-80">
                          {weapon.kills.toLocaleString()} {killLabel} •{" "}
                          {percentage}% of total
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
