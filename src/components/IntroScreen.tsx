"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PGCRDownload } from "./PGCRDownload";
import {
  Sparkles,
  BarChart3,
  Download,
  ArrowRight,
  Share2,
} from "lucide-react";
import { DestinyHistoricalStatsPeriodGroup } from "bungie-net-core/models";
import { getActivitiesWithPGCRs } from "@/api/idb";

interface IntroScreenProps {
  activities: (DestinyHistoricalStatsPeriodGroup & {
    characterId: string;
  })[];
  onStart: () => void;
  onDownloadingChange?: (isDownloading: boolean) => void;
}

export function IntroScreen({
  activities,
  onStart,
  onDownloadingChange,
}: IntroScreenProps) {
  const [allDownloaded, setAllDownloaded] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const activityIds = activities.map((a) => a.activityDetails.instanceId);

  useEffect(() => {
    const checkPGCRStatus = async () => {
      if (activityIds.length === 0) {
        setIsChecking(false);
        return;
      }

      try {
        const existingPGCRs = await getActivitiesWithPGCRs();
        const downloadedCount = activityIds.filter((id) =>
          existingPGCRs.has(id)
        ).length;
        const allComplete = downloadedCount === activityIds.length;
        setAllDownloaded(allComplete);
      } catch (error) {
        console.error("Failed to check PGCR status:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkPGCRStatus();

    window.addEventListener("pgcrs-stored", checkPGCRStatus);
    return () => {
      window.removeEventListener("pgcrs-stored", checkPGCRStatus);
    };
  }, [activityIds]);

  const handleAllDownloaded = () => {
    setAllDownloaded(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-4"
            >
              <div className="relative">
                <Sparkles className="w-16 h-16 text-yellow-400" />
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Sparkles className="w-16 h-16 text-yellow-400 opacity-50" />
                </motion.div>
              </div>
            </motion.div>
            <CardTitle className="text-4xl sm:text-5xl font-bold text-white mb-2">
              Destiny Wrapped 2025
            </CardTitle>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-white/80 mt-2"
            >
              Your year in review
            </motion.p>
          </CardHeader>

          <CardContent className="space-y-2">
            {/* Explanation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4 mb-6"
            >
              <div className="flex items-start gap-3">
                <BarChart3 className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">
                    Discover Your Stats
                  </h3>
                  <p className="text-white/70">
                    See your most played activities, favorite classes, longest
                    streaks, and more from your Destiny 2 journey in 2025.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Download className="w-6 h-6 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">
                    Enhanced Stats Available
                  </h3>
                  <p className="text-white/70">
                    Download Post-Game Carnage Reports (PGCRs) to unlock
                    detailed insights like weapon usage, favorite teammates,
                    ability kills, and more.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Share2 className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">
                    Share Your Journey
                  </h3>
                  <p className="text-white/70">
                    Celebrate your year in Destiny 2 and share your wrapped
                    stats with the community using{" "}
                    <span className="font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      #Destiny2Wrapped2025
                    </span>
                    .
                  </p>
                </div>
              </div>
            </motion.div>

            {/* PGCR Download Component */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <PGCRDownload
                activities={activities}
                onDownloadingChange={onDownloadingChange}
                onAllDownloaded={handleAllDownloaded}
              />
            </motion.div>

            {/* Start Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col items-center gap-4 pt-2"
            >
              {isChecking ? (
                <div className="text-white/60 text-sm">Checking status...</div>
              ) : (
                <>
                  {allDownloaded && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-400 text-sm font-medium flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      All advanced stats ready!
                    </motion.div>
                  )}
                  <div className="flex flex-col items-center gap-3 w-full">
                    <div className="relative w-full group">
                  <Button
                    onClick={onStart}
                        disabled={!allDownloaded}
                    size="lg"
                        className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                  >
                        Start Your Wrapped
                        {allDownloaded ? (
                          <motion.div
                            animate={{ x: [0, 4, 0, -4, 0] }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className="ml-2 inline-block"
                          >
                            <ArrowRight className="w-5 h-5" />
                          </motion.div>
                        ) : (
                    <ArrowRight className="ml-2 w-5 h-5" />
                        )}
                      </Button>
                      {!allDownloaded && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          Use the download tool above or skip stats below
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={onStart}
                      size="lg"
                      variant="outline"
                      className="text-base px-6 py-4 border-white/20 text-white/70 hover:bg-white/5 hover:border-white/30 hover:text-white/90 w-full"
                    >
                      Skip Advanced Stats & Start
                      <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                    {!allDownloaded && (
                    <p className="text-white/50 text-sm text-center max-w-md">
                        You can download PGCRs above for enhanced stats, or
                        start now with basic stats
                    </p>
                  )}
                  </div>
                </>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
