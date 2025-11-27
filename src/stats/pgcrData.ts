import { useEffect, useState } from "react";
import { DestinyPostGameCarnageReportData } from "bungie-net-core/models";
import { getPGCRs } from "@/api/idb";
import { DestinyHistoricalStatsPeriodGroup } from "bungie-net-core/models";

/**
 * Hook to load and manage PGCR data for activities
 */
export function usePGCRData(
  activities: (DestinyHistoricalStatsPeriodGroup & {
    characterId: string;
  })[]
) {
  const [pgcrData, setPgcrData] = useState<
    Map<string, DestinyPostGameCarnageReportData>
  >(new Map());
  const [isLoadingPGCRs, setIsLoadingPGCRs] = useState(true);

  useEffect(() => {
    const loadPGCRs = async () => {
      try {
        setIsLoadingPGCRs(true);
        const activityIds = activities.map((a) => a.activityDetails.instanceId);
        const pgcrs = await getPGCRs(activityIds);
        setPgcrData(pgcrs);
      } catch (error) {
        console.error("Failed to load PGCRs:", error);
      } finally {
        setIsLoadingPGCRs(false);
      }
    };

    loadPGCRs();

    // Listen for PGCR events to refresh data
    const handlePGCRsChanged = () => {
      loadPGCRs();
    };

    window.addEventListener("pgcrs-cleared", handlePGCRsChanged);
    window.addEventListener("pgcrs-stored", handlePGCRsChanged);

    return () => {
      window.removeEventListener("pgcrs-cleared", handlePGCRsChanged);
      window.removeEventListener("pgcrs-stored", handlePGCRsChanged);
    };
  }, [activities]);

  return { pgcrData, isLoadingPGCRs };
}

