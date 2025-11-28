"use client";

import React from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useColor } from "@/ui/useColor";
import { DestinyWrappedCard } from "../DestinyWrappedCard";
import { useGetItemDefinition } from "@/items/useGetItemDefinition";
import { Award } from "lucide-react";
import Image from "next/image";

interface FavoriteEmblem {
  hash: number;
  count: number;
}

interface FavoriteEmblemCardProps {
  idx: number;
  favoriteEmblems: FavoriteEmblem[] | null;
  hasPGCRData: boolean;
}

export function FavoriteEmblemCard({
  favoriteEmblems,
  idx,
  hasPGCRData,
}: FavoriteEmblemCardProps) {
  const colorClass = useColor(idx);
  const getItemDefinition = useGetItemDefinition();

  const hasData = favoriteEmblems !== null && favoriteEmblems.length > 0;

  return (
    <DestinyWrappedCard className={`bg-gradient-to-br ${colorClass}`}>
      <CardHeader className="relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 150 }}
        >
          <CardTitle className="text-4xl font-bold text-center text-white drop-shadow-lg">
            Your <i>signature</i> look
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
            <Award
              className="w-16 h-16 mb-4 opacity-50"
              fill="currentColor"
              stroke="white"
              strokeWidth={2}
            />
            <p className="text-xl opacity-75">
              {hasPGCRData
                ? "No emblem data available"
                : "Download PGCR data to see your favorite emblem"}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {favoriteEmblems!.map((emblem, index) => {
              const emblemDef = getItemDefinition(emblem.hash);
              return (
                <motion.div
                  key={emblem.hash}
                  className="flex flex-col items-center space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", delay: index * 0.2 }}
                >
                  {/* Emblem container with reflection and overlay */}
                  <div className="relative mb-2">
                    {/* Long form (secondaryIcon) - background */}
                    {emblemDef?.secondaryIcon && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 100,
                          damping: 10,
                          delay: 0.05 + index * 0.2,
                        }}
                        className="relative w-full max-w-[280px]"
                        style={{
                          width:
                            index === 0
                              ? "min(400px, 90vw)"
                              : index === 1
                              ? "min(320px, 75vw)"
                              : "min(260px, 65vw)",
                          aspectRatio: "474 / 96",
                          transform: `rotate(${(emblem.hash % 20) - 10}deg)`,
                        }}
                      >
                        <Image
                          src={`https://www.bungie.net${emblemDef.secondaryIcon}`}
                          alt={emblemDef.displayProperties.name || "Emblem"}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                        {/* Reflection effect */}
                        <div
                          className="absolute top-full left-0 right-0 overflow-hidden"
                          style={{
                            width: "100%",
                            aspectRatio: "474 / 96",
                            transform: "scaleY(-1)",
                            opacity: 0.3,
                            maskImage:
                              "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)",
                            WebkitMaskImage:
                              "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)",
                          }}
                        >
                          <Image
                            src={`https://www.bungie.net${emblemDef.secondaryIcon}`}
                            alt=""
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </motion.div>
                    )}
                    {/* Short form (secondaryOverlay) - transparent overlay on top, slightly off-center */}
                    {emblemDef?.secondaryOverlay && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          type: "spring",
                          delay: 0.05 + index * 0.2,
                        }}
                        className="absolute"
                        style={{
                          opacity: 0.6,
                          top: "15%",
                          left: "55%",
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        <div
                          className="relative"
                          style={{
                            width:
                              index === 0
                                ? "min(100px, 22vw)"
                                : index === 1
                                ? "min(80px, 18vw)"
                                : "min(60px, 15vw)",
                            aspectRatio: "1 / 1",
                          }}
                        >
                          <Image
                            src={`https://www.bungie.net${emblemDef.secondaryOverlay}`}
                            alt={`${
                              emblemDef.displayProperties.name || "Emblem"
                            } overlay`}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 + index * 0.2 }}
                  >
                    <motion.h3
                      className={`font-bold mb-1 ${
                        index === 0
                          ? "text-2xl"
                          : index === 1
                          ? "text-xl"
                          : "text-lg"
                      }`}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3,
                      }}
                    >
                      {emblemDef?.displayProperties.name || "Unknown Emblem"}
                    </motion.h3>
                    <p
                      className={`opacity-80 ${
                        index === 0 ? "text-lg" : "text-base"
                      }`}
                    >
                      {emblem.count}{" "}
                      {emblem.count === 1 ? "activity" : "activities"}
                    </p>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </DestinyWrappedCard>
  );
}
