import { useQuery } from "@tanstack/react-query";
import { useBungie } from "./useBungie";
import { useDestinyManifest } from "./useDestinyManifest";
import { AllDestinyManifestComponents } from "bungie-net-core/manifest";

export const useDestinyManifestComponent = <
  T extends keyof AllDestinyManifestComponents
>(
  tableName: T
) => {
  const bungie = useBungie();
  const manifestQuery = useDestinyManifest();

  return useQuery({
    enabled: !!manifestQuery.data,
    queryKey: ["Destiny2ManifestComponent", tableName],
    queryFn: () => bungie.getManifestComponent(tableName, manifestQuery.data!),
    staleTime: 3600_000,
  });
};
