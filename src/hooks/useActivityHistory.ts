import { useQueries } from "@tanstack/react-query";
import { useBungie } from "./useBungie";
import { useAuthorizedBungieSession } from "next-bungie-auth/client";
import {
  BungieMembershipType,
  DestinyHistoricalStatsPeriodGroup,
} from "bungie-net-core/models";
// Note: We no longer store activity history separately - PGCRs are the single source of truth.
// Activity history is only fetched to determine which activities exist, not stored.

export const useActivityHistory = (params: {
  destinyMembershipId: string;
  membershipType: BungieMembershipType;
  characterIds: string[];
}) => {
  const session = useAuthorizedBungieSession();
  const bungie = useBungie();

  const result = useQueries({
    combine: (results) => {
      const reduced = results.reduce(
        (acc, result) => ({
          data: new Map([
            ...acc.data,
            ...(result.data?.map(
              (a) => [a.activityDetails.instanceId, a] as const
            ) ?? []),
          ]),
          isError: acc.isError || result.isError,
          error: acc.error ?? result.error,
          isPending: acc.isPending || result.isPending,
          isSuccess: acc.isSuccess && result.isSuccess,
        }),
        {
          data: new Map<
            string,
            DestinyHistoricalStatsPeriodGroup & {
              characterId: string;
            }
          >(),
          isError: false,
          error: null as Error | null,
          isPending: false,
          isSuccess: true,
        }
      );

      return {
        ...reduced,
        data: Array.from(reduced.data.values()).sort(
          (a, b) => new Date(b.period).getTime() - new Date(a.period).getTime()
        ),
      };
    },
    queries: params.characterIds.map((characterId) => ({
      staleTime: 300_000,
      retry: 2,
      retryDelay: (attemptIndex: number) =>
        Math.min(1000 * 2 ** attemptIndex, 30000),
      enabled: !!params.characterIds.length && !!session.data?.accessToken,
      queryKey: [
        "activity history",
        params.membershipType,
        params.destinyMembershipId,
        characterId,
      ],
      queryFn: async () => {
        if (!session.data?.accessToken) {
          throw new Error("Authentication required");
        }
        return bungie.getActivityHistory({
          accessToken: session.data.accessToken,
          destinyMembershipId: params.destinyMembershipId,
          membershipType: params.membershipType,
          characterId,
        });
      },
    })),
  });

  // Note: We no longer store activity history separately.
  // Activity history is only used to determine which activities exist.
  // PGCRs are downloaded separately and stored as the single source of truth.

  return result;
};
