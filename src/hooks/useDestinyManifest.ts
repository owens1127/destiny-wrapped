import { useQuery } from "@tanstack/react-query";
import { useBungie } from "./useBungie";

export const useDestinyManifest = () => {
  const bungie = useBungie();
  return useQuery({
    queryKey: ["Destiny2Manifest"],
    queryFn: () => bungie.getManifest(),
    staleTime: 3600_000,
  });
};
