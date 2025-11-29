"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PGCRDownload } from "./PGCRDownload";
import { Sparkles, ArrowRight } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { DestinyHistoricalStatsPeriodGroup } from "bungie-net-core/models";
import { trackEvent } from "@/analytics/posthog-client";
import { getAllPGCRs } from "@/storage/idb";

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
        const existingPGCRs = await getAllPGCRs();
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
    <AuthLayout>
      {/* PGCR Download Component */}
      <div>
        <PGCRDownload
          activities={activities}
          onDownloadingChange={onDownloadingChange}
          onAllDownloaded={handleAllDownloaded}
        />
      </div>

      {/* Start Button */}
      <div className="flex flex-col items-center gap-4 pt-2">
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
                  onClick={() => {
                    trackEvent("wrapped_started", { has_advanced: true });
                    onStart();
                  }}
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
                onClick={() => {
                  trackEvent("wrapped_started", { has_advanced: false });
                  onStart();
                }}
                size="lg"
                variant="outline"
                className="text-base px-6 py-4 border-white/20 text-white/70 hover:bg-white/5 hover:border-white/30 hover:text-white/90 w-full"
              >
                Skip Advanced Stats & Start
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              {!allDownloaded && (
                <p className="text-white/50 text-sm text-center max-w-md">
                  You can download PGCRs above for enhanced stats, or start now
                  with basic stats
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
