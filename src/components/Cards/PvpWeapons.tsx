"use client";

import React from "react";
import { WeaponCard } from "./WeaponCard";

interface WeaponUsageStats {
  weaponKills: Map<number, number>;
  topWeapons: Array<{ hash: number; kills: number }>;
}

interface PvpWeaponsCardProps {
  idx: number;
  pvpWeaponStats: WeaponUsageStats | null;
  hasPGCRData: boolean;
}

export function PvpWeaponsCard({
  pvpWeaponStats,
  idx,
  hasPGCRData,
}: PvpWeaponsCardProps) {
  return (
    <WeaponCard
      idx={idx}
      weaponStats={pvpWeaponStats}
      hasPGCRData={hasPGCRData}
      title={
        <>
          Your personal <i>Crucible</i> meta
        </>
      }
      headerText="You eliminated"
      headerSuffix="Guardians in the Crucible"
      killLabel="PvP kills"
      noDataMessage="No PvP weapon usage data available"
      noDataDownloadMessage="Download PGCR data to see your PvP weapon stats"
    />
  );
}
