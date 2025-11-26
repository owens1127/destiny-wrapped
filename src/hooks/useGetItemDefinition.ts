import { DestinyInventoryItemDefinition } from "bungie-net-core/models";
import { useCallback } from "react";
import { useDestinyManifestComponent } from "./useDestinyManifestComponent";

export const useGetItemDefinition = () => {
  const { isSuccess, data } = useDestinyManifestComponent(
    "DestinyInventoryItemDefinition"
  );

  return useCallback(
    (hash: number): DestinyInventoryItemDefinition | null => {
      if (!isSuccess) {
        return null;
      }

      return data[hash] ?? null;
    },
    [isSuccess, data]
  );
};

