import { useQuery } from "@tanstack/react-query";
import { useBungie } from "@/api/useBungie";
import { useAuthorizedBungieSession } from "next-bungie-auth/client";
import { BungieMembershipType } from "bungie-net-core/models";

export const useDestinyCharacters = (params: {
  destinyMembershipId: string;
  membershipType: BungieMembershipType;
}) => {
  const session = useAuthorizedBungieSession();
  const bungie = useBungie();

  return useQuery({
    enabled: params.destinyMembershipId !== "",
    queryKey: [
      "getBasicProfile",
      params.membershipType,
      params.destinyMembershipId,
    ],
    queryFn: () =>
      bungie.getBasicProfile({
        accessToken: session.data.accessToken,
        destinyMembershipId: params.destinyMembershipId,
        membershipType: params.membershipType,
      }),
    select: (data) => ({
      characterIds: data.profile.data?.characterIds ?? [],
      characterClasses: Object.fromEntries(
        Object.entries(data.characters.data ?? {}).map(([id, c]) => [
          id,
          c.classType,
        ])
      ),
    }),
  });
};
