import { useActivityHistory } from "@/hooks/useActivityHistory";
import {
  BungieMembershipType,
  DestinyHistoricalStatsPeriodGroup,
} from "bungie-net-core/models";

export const ActivityWrapper = (props: {
  destinyMembershipId: string;
  membershipType: BungieMembershipType;
  characterIds: string[];
  fallback?: React.ReactNode;
  render: (
    data: (DestinyHistoricalStatsPeriodGroup & {
      characterId: string;
    })[]
  ) => React.ReactNode;
}) => {
  const { data, isSuccess } = useActivityHistory({
    destinyMembershipId: props.destinyMembershipId,
    membershipType: props.membershipType,
    characterIds: props.characterIds,
  });

  if (isSuccess) {
    return props.render(data);
  }

  return props.fallback;
};
