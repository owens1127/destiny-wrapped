"use client";

import { ActivityWrapper } from "@/components/ActivityWrapper";
import { DestinyWrapped } from "@/components/DestinyWrapped";
import { PageSkeleton } from "@/components/PageSkeleton";

import { useDestinyCharacters } from "@/hooks/useDestinyCharacters";
import { useDestinyManifestComponent } from "@/hooks/useDestinyManifestComponent";
import { useDestinyMembership } from "@/hooks/useDestinyMembership";
import { useToast } from "@/hooks/useToast";
import { useEffect } from "react";

export default function Home() {
  // preloading
  useDestinyManifestComponent("DestinyActivityDefinition");
  const { toast } = useToast();

  const membershipQuery = useDestinyMembership();
  const charactersQuery = useDestinyCharacters(
    membershipQuery.isSuccess
      ? {
          destinyMembershipId: membershipQuery.data.membershipId,
          membershipType: membershipQuery.data.membershipType,
        }
      : {
          destinyMembershipId: "",
          membershipType: 0,
        }
  );

  useEffect(() => {
    if (membershipQuery.isError) {
      toast({
        title: "Error fetching membership data",
        description: membershipQuery.error.message,
        variant: "destructive",
      });
    }
  }, [toast, membershipQuery.isError, membershipQuery.error]);

  useEffect(() => {
    if (charactersQuery.isError) {
      toast({
        title: "Error fetching character data",
        description: charactersQuery.error.message,
        variant: "destructive",
      });
    }
  }, [toast, charactersQuery.isError, charactersQuery.error]);

  if (membershipQuery.isPending || charactersQuery.isPending) {
    return <PageSkeleton />;
  }

  if (membershipQuery.isError || charactersQuery.isError) {
    return null;
  }

  return (
    <ActivityWrapper
      destinyMembershipId={membershipQuery.data.membershipId}
      membershipType={membershipQuery.data.membershipType}
      characterIds={charactersQuery.data.characterIds}
      fallback={<PageSkeleton />}
      noActivities={<div className="text-center">{":("}</div>}
      render={(activities) => (
        <DestinyWrapped
          activities={activities}
          characterMap={charactersQuery.data.characterClasses}
          displayName={
            <>
              <span>{membershipQuery.data.bungieGlobalDisplayName}</span>
              <span className="text-gray-300 opacity-80">
                #{membershipQuery.data.bungieGlobalDisplayNameCode}
              </span>
            </>
          }
        />
      )}
    />
  );
}
