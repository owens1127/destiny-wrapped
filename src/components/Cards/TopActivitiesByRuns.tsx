"use client";

import React from "react";
import { TopActivitiesCard } from "./TopActivities";

interface Activity {
  hash: number;
  count: number;
  timePlayedSeconds: number;
}

interface TopActivitiesByRunsCardProps {
  idx: number;
  topActivities: Activity[];
}

export function TopActivitiesByRunsCard({
  topActivities,
  idx,
}: TopActivitiesByRunsCardProps) {
  return (
    <TopActivitiesCard
      topActivities={topActivities}
      idx={idx}
      sortBy="runs"
      title={<>Launch bug?</>}
      headerText="You played these the most"
    />
  );
}
