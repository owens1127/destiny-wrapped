"use client";

import { useActivityHistory } from "@/hooks/useActivityHistory";
import { useToast } from "@/hooks/useToast";
import {
  BungieMembershipType,
  DestinyHistoricalStatsPeriodGroup,
} from "bungie-net-core/models";
import { useEffect } from "react";

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
  noActivities: React.ReactNode;
}) => {
  const { data, isSuccess, isError, error } = useActivityHistory({
    destinyMembershipId: props.destinyMembershipId,
    membershipType: props.membershipType,
    characterIds: props.characterIds,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isError) {
      toast({
        title: "Error fetching activity history",
        description:
          error?.message ||
          "Failed to load your activity history. Please try refreshing the page.",
        variant: "destructive",
      });
    }
  }, [toast, isError, error]);

  if (isSuccess) {
    if (!data.length) {
      return props.noActivities;
    }

    return props.render(data);
  }

  return props.fallback;
};
