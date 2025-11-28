"use client";

import React from "react";
import { WeaponCard } from "./WeaponCard";

interface WeaponUsageStats {
  weaponKills: Map<number, number>;
  topWeapons: Array<{ hash: number; kills: number }>;
}

interface WeaponUsageCardProps {
  idx: number;
  weaponStats: WeaponUsageStats | null;
  hasPGCRData: boolean;
}

export function WeaponUsageCard({
  weaponStats,
  idx,
  hasPGCRData,
}: WeaponUsageCardProps) {
  return (
    <WeaponCard
      idx={idx}
      weaponStats={weaponStats}
      hasPGCRData={hasPGCRData}
      title={<>Guess the meta</>}
      headerText="You eliminated"
      headerSuffix="enemies with your weapons"
      killLabel="kills"
      noDataMessage="No weapon usage data available"
      noDataDownloadMessage="Download PGCR data to see your weapon stats"
    />
  );
}
