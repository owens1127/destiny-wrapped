"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBungie } from "@/api/useBungie";
import { useAuthorizedBungieSession } from "next-bungie-auth/client";
import {
  getStorageSize,
  storePGCRs,
  getActivitiesWithPGCRs,
  clearPGCRs,
} from "@/api/idb";
import { useToast } from "@/ui/useToast";
import { Download, Trash2, Loader2, Sparkles } from "lucide-react";
import {
  DestinyHistoricalStatsPeriodGroup,
  DestinyPostGameCarnageReportData,
} from "bungie-net-core/models";
import { motion } from "framer-motion";
import { trackEvent } from "@/lib/posthog-client";

interface PGCRDownloadProps {
  activities: (DestinyHistoricalStatsPeriodGroup & {
    characterId: string;
  })[];
  onDownloadingChange?: (isDownloading: boolean) => void;
  onStorageCleared?: () => void;
  onAllDownloaded?: () => void;
}

export function PGCRDownload({
  activities,
  onDownloadingChange,
  onStorageCleared,
  onAllDownloaded,
}: PGCRDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const justCompletedRef = React.useRef(false);
  const [storageInfo, setStorageInfo] = useState<{
    used: number;
    estimated: number;
    count: number;
  } | null>(null);
  const [downloadStats, setDownloadStats] = useState<{
    alreadyDownloaded: number;
    needsDownload: number;
    estimatedSize: number;
    estimatedTime: number; // in seconds
  } | null>(null);
  const [isLoadingStorage, setIsLoadingStorage] = useState(true);
  const [storedPGCRsForActivities, setStoredPGCRsForActivities] = useState(0);
  const session = useAuthorizedBungieSession();
  const bungie = useBungie();
  const { toast } = useToast();

  const activityIds = useMemo(
    () => activities.map((a) => a.activityDetails.instanceId),
    [activities]
  );

  const loadStorageInfo = async () => {
    try {
      setIsLoadingStorage(true);
      const info = await getStorageSize();
      setStorageInfo(info);

      // Calculate how many stored PGCRs match the current activities
      if (activityIds.length > 0) {
        const existingPGCRs = await getActivitiesWithPGCRs();
        const matchingCount = activityIds.filter((id) =>
          existingPGCRs.has(id)
        ).length;
        setStoredPGCRsForActivities(matchingCount);
      } else {
        setStoredPGCRsForActivities(0);
      }
    } catch (error) {
      console.error("Failed to load storage info:", error);
    } finally {
      setIsLoadingStorage(false);
    }
  };

  const checkExistingPGCRs = React.useCallback(async () => {
    if (activityIds.length === 0) {
      return;
    }

    setIsChecking(true);
    try {
      const existingPGCRs = await getActivitiesWithPGCRs();
      const alreadyDownloaded = activityIds.filter((id) =>
        existingPGCRs.has(id)
      ).length;
      const needsDownload = activityIds.length - alreadyDownloaded;

      // Update the stored count for display
      setStoredPGCRsForActivities(alreadyDownloaded);

      // Estimate: 16KB per PGCR
      const avgSizePerPGCR = 16 * 1024;
      const estimatedSize = needsDownload * avgSizePerPGCR;
      // Rate limit: 30 requests/second, 30 concurrent max
      // Account for network latency and rate limiting - more conservative estimate
      const estimatedTime = Math.ceil(needsDownload / 20); // ~20 requests/second effective rate

      setDownloadStats({
        alreadyDownloaded,
        needsDownload,
        estimatedSize,
        estimatedTime,
      });

      // If all PGCRs are already downloaded, unlock stats automatically
      if (needsDownload === 0 && activityIds.length > 0) {
        onAllDownloaded?.();
      }
    } catch (error) {
      console.error("Failed to check existing PGCRs:", error);
    } finally {
      setIsChecking(false);
    }
  }, [activityIds, onAllDownloaded]);

  const estimatedSize = useMemo(() => {
    // Rough estimate: ~50KB per PGCR on average
    const avgSizePerPGCR = 50 * 1024;
    return activityIds.length * avgSizePerPGCR;
  }, [activityIds.length]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  useEffect(() => {
    loadStorageInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityIds.length]);

  // Listen for PGCR storage events to update count in real-time
  useEffect(() => {
    const handlePGCRsStored = () => {
      loadStorageInfo();
    };

    window.addEventListener("pgcrs-stored", handlePGCRsStored);

    return () => {
      window.removeEventListener("pgcrs-stored", handlePGCRsStored);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Notify parent when downloading state changes
  useEffect(() => {
    onDownloadingChange?.(isDownloading);
  }, [isDownloading, onDownloadingChange]);

  // Cleanup: abort any ongoing downloads when component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Notify parent that downloading has stopped
      onDownloadingChange?.(false);
    };
  }, [onDownloadingChange]);

  useEffect(() => {
    // Auto-check existing PGCRs when activities change
    // Don't check if we just completed a download (prevents infinite loop)
    if (
      activityIds.length > 0 &&
      !isChecking &&
      !downloadStats &&
      !justCompletedRef.current
    ) {
      checkExistingPGCRs();
    }
  }, [activityIds.length, isChecking, downloadStats, checkExistingPGCRs]);

  const handleDownload = async () => {
    if (!session.data?.accessToken) {
      toast({
        title: "Authentication required",
        description: "Please sign in to download PGCRs",
        variant: "destructive",
      });
      return;
    }

    if (activityIds.length === 0) {
      toast({
        title: "No activities",
        description: "No activities available to download",
        variant: "destructive",
      });
      return;
    }

    // First check which ones are already downloaded
    if (!downloadStats) {
      await checkExistingPGCRs();
      return;
    }

    if (downloadStats.needsDownload === 0) {
      toast({
        title: "Already downloaded",
        description: "All PGCRs are already stored locally",
      });
      return;
    }

    setIsDownloading(true);
    setProgress(0);

    // Track download start
    const downloadStartTime = Date.now();
    const existingPGCRs = await getActivitiesWithPGCRs();
    const missingIds = activityIds.filter((id) => !existingPGCRs.has(id));

    trackEvent("pgcr_download_started", { count: missingIds.length });

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      // Initialize the counter with current stored count
      const currentStoredCount = activityIds.filter((id) =>
        existingPGCRs.has(id)
      ).length;
      setStoredPGCRsForActivities(currentStoredCount);

      // Create period map for storage
      const periodMap = new Map<string, string>();
      activities.forEach((activity) => {
        periodMap.set(activity.activityDetails.instanceId, activity.period);
      });

      // Download in batches (client handles rate limiting at 60/s)
      let downloaded = 0;
      let failed = 0;

      // Send all missing IDs at once - client will batch internally
      // Each PGCR will be stored as it's received
      try {
        const pgcrs = await bungie.getPostGameCarnageReports({
          accessToken: session.data.accessToken,
          activityIds: missingIds,
          onProgress: (progress) => setProgress(progress),
          signal,
          periodMap,
          onPGCRReceived: async (pgcrs, periodMap) => {
            // Filter PGCRs to only store those from 2025
            const pgcrsToStore = new Map<
              string,
              DestinyPostGameCarnageReportData
            >();
            const filteredPeriodMap = new Map<string, string>();

            pgcrs.forEach((pgcr, activityId) => {
              const period = pgcr.period || periodMap?.get(activityId);
              if (period) {
                const date = new Date(period);
                if (date.getFullYear() === 2025) {
                  pgcrsToStore.set(activityId, pgcr);
                  if (periodMap?.has(activityId)) {
                    filteredPeriodMap.set(
                      activityId,
                      periodMap.get(activityId)!
                    );
                  }
                }
              }
            });

            // Store batch of PGCRs (only 2025 ones)
            if (pgcrsToStore.size > 0) {
              await storePGCRs(
                pgcrsToStore,
                filteredPeriodMap.size > 0 ? filteredPeriodMap : undefined
              );
            }

            // Update count directly for the activities we just stored
            const storedIds = Array.from(pgcrsToStore.keys());
            const newlyStoredCount = storedIds.filter((id) =>
              activityIds.includes(id)
            ).length;
            if (newlyStoredCount > 0) {
              setStoredPGCRsForActivities((prev) => {
                const newCount = prev + newlyStoredCount;
                // Also update downloadStats if it exists
                if (downloadStats) {
                  const updatedNeedsDownload = activityIds.length - newCount;
                  setDownloadStats((prevStats) => {
                    if (!prevStats) return null;
                    return {
                      ...prevStats,
                      alreadyDownloaded: newCount,
                      needsDownload: updatedNeedsDownload,
                    };
                  });
                }
                return newCount;
              });
            }
            // Also refresh storage info for the total count (without blocking)
            getStorageSize().then((info) => {
              setStorageInfo(info);
            });
          },
        });

        downloaded = pgcrs.size;
        failed = missingIds.length - pgcrs.size;
      } catch (error) {
        // Check if it was cancelled
        if (
          signal.aborted ||
          (error instanceof Error && error.message === "Download cancelled")
        ) {
          toast({
            title: "Download cancelled",
            description: "PGCR download was cancelled",
          });
          return;
        }
        console.error("Failed to download PGCRs:", error);
        failed = missingIds.length;
      }

      // Track download completion with metrics
      const downloadEndTime = Date.now();
      const downloadTimeSeconds = (downloadEndTime - downloadStartTime) / 1000;

      trackEvent("pgcr_download_completed", {
        count: downloaded,
        failed: failed,
        time_seconds: downloadTimeSeconds,
        avg_time_per_pgcr:
          downloaded > 0 ? downloadTimeSeconds / downloaded : 0,
      });

      if (failed > 0) {
        toast({
          title: "Download completed with errors",
          description: `Downloaded ${downloaded} PGCRs, ${failed} failed`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Download complete",
          description: `Downloaded ${downloaded} PGCRs`,
        });
      }

      await loadStorageInfo();
      // Re-check stats after download completes instead of clearing
      await checkExistingPGCRs();
      // Check if all PGCRs are now downloaded and unlock stats
      const finalStats = await getActivitiesWithPGCRs();
      const finalDownloaded = activityIds.filter((id) =>
        finalStats.has(id)
      ).length;
      if (finalDownloaded === activityIds.length && activityIds.length > 0) {
        onAllDownloaded?.();
      }
    } catch (error) {
      console.error("Failed to download PGCRs:", error);
      toast({
        title: "Download failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to download PGCRs. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
      setProgress(0);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsDownloading(false);
    setProgress(0);
  };

  const handleClear = async () => {
    if (
      !confirm(
        "Are you sure you want to clear all stored PGCRs? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await clearPGCRs();
      toast({
        title: "Storage cleared",
        description: "All PGCRs have been removed",
      });
      await loadStorageInfo();
      // Re-check existing PGCRs after clearing
      await checkExistingPGCRs();
      // Notify parent that storage was cleared (reset state)
      onStorageCleared?.();
    } catch (error) {
      console.error("Failed to clear storage:", error);
      toast({
        title: "Failed to clear storage",
        description: "An error occurred while clearing storage",
        variant: "destructive",
      });
    }
  };

  const storagePercentage = storageInfo
    ? (storageInfo.used / storageInfo.estimated) * 100
    : 0;

  return (
    <Card className="mb-4 relative overflow-hidden">
      {/* Subtle sparkle decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-yellow-400 opacity-40"
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
            }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
            style={{
              fontSize: "12px",
            }}
          >
            ✨
          </motion.div>
        ))}
      </div>
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </motion.div>
          Download PGCRs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs sm:text-sm text-amber-500 dark:text-amber-400">
          ⚠️ Not recommended for poor data connections or slow devices. This
          will download significant amounts of data.
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground">
          You only need to do this once - data is stored locally in your
          browser.
        </p>

        {isChecking && (
          <div className="text-center py-4">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Checking which PGCRs are already downloaded...
            </p>
          </div>
        )}

        {downloadStats && !isDownloading && downloadStats.needsDownload > 0 && (
          <div className="space-y-1.5 p-3 bg-muted rounded-lg text-xs sm:text-sm">
            <div className="flex justify-between text-sm">
              <span>Already downloaded:</span>
              <span className="font-semibold">
                {downloadStats.alreadyDownloaded}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Needs download:</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {downloadStats.needsDownload}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Estimated download size:</span>
              <span className="font-semibold">
                {formatBytes(downloadStats.estimatedSize)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Estimated time:</span>
              <span className="font-semibold">
                {downloadStats.estimatedTime < 60
                  ? `${downloadStats.estimatedTime} seconds`
                  : `${Math.floor(downloadStats.estimatedTime / 60)} minutes ${
                      downloadStats.estimatedTime % 60
                    } seconds`}
              </span>
            </div>
          </div>
        )}

        {!downloadStats && !isChecking && (
          <div className="space-y-1.5 text-xs sm:text-sm">
            <div className="flex justify-between text-sm">
              <span>Activities available:</span>
              <span className="font-semibold">{activityIds.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Estimated download size (if all new):</span>
              <span className="font-semibold">
                {formatBytes(estimatedSize)}
              </span>
            </div>
          </div>
        )}

        {isDownloading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Downloading {Math.round(progress)}%...</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {storageInfo && (
          <div className="space-y-1.5 text-xs sm:text-sm">
            <div className="flex justify-between text-sm">
              <span>Stored PGCRs:</span>
              <span
                className={`font-semibold ${
                  activityIds.length > 0
                    ? storedPGCRsForActivities === activityIds.length
                      ? "text-green-500 dark:text-green-400"
                      : (activityIds.length - storedPGCRsForActivities) /
                          activityIds.length <=
                        0.05
                      ? "text-yellow-500 dark:text-yellow-400"
                      : "text-white"
                    : "text-white"
                }`}
              >
                {storedPGCRsForActivities}/{activityIds.length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Storage used by this website:</span>
              <span className="font-semibold">
                {formatBytes(storageInfo.used)} /{" "}
                {formatBytes(storageInfo.estimated)} (
                {storagePercentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${Math.min(storagePercentage, 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 flex-wrap">
          <Button
            onClick={handleDownload}
            disabled={
              isDownloading ||
              isLoadingStorage ||
              isChecking ||
              (downloadStats !== null && downloadStats.needsDownload === 0)
            }
            className="w-full"
          >
            {isChecking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Downloading...
              </>
            ) : downloadStats && downloadStats.needsDownload === 0 ? (
              <>
                <Download className="w-4 h-4 mr-2" />
                All Downloaded
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                {downloadStats
                  ? `Download ${downloadStats.needsDownload} PGCRs`
                  : "Check & Download PGCRs"}
              </>
            )}
          </Button>
          <div className="flex gap-2 flex-wrap">
            {isDownloading && (
              <Button
                onClick={handleCancel}
                variant="destructive"
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            {storageInfo && storageInfo.count > 0 && (
              <Button
                onClick={handleClear}
                disabled={isDownloading || isLoadingStorage}
                variant="destructive"
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Storage
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
