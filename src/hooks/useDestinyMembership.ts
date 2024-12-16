import { useQuery } from "@tanstack/react-query";
import { useBungie } from "./useBungie";
import { useAuthorizedBungieSession } from "next-bungie-auth/client";

export const useDestinyMembership = () => {
  const session = useAuthorizedBungieSession();
  const bungie = useBungie();

  return useQuery({
    queryKey: ["membershipData", session.data.bungieMembershipId],
    queryFn: () => bungie.getMembershipData(session.data),
    select: (data) =>
      data.destinyMemberships.find(
        (membership) =>
          membership.membershipId === data.primaryMembershipId ||
          !!membership.applicableMembershipTypes.length
      ) ?? data.destinyMemberships[0],
  });
};
