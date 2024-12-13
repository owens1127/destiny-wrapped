"use client";

import { ActivityWrapper } from "@/components/ActivityWrapper";
import { DestinyWrapped } from "@/components/DestinyWrapped";
import { PageSkeleton } from "@/components/PageSkeleton";

import { useDestinyCharacters } from "@/hooks/useDestinyCharacters";
import { useDestinyManifestComponent } from "@/hooks/useDestinyManifestComponent";
import { useDestinyProfile } from "@/hooks/useDestinyProfile";

export default function Home() {
  // preloading
  useDestinyManifestComponent("DestinyActivityDefinition");

  const profileQuery = useDestinyProfile();
  const charactersQuery = useDestinyCharacters(
    profileQuery.isSuccess
      ? {
          destinyMembershipId: profileQuery.data.membershipId,
          membershipType: profileQuery.data.membershipType,
        }
      : {
          destinyMembershipId: "",
          membershipType: 0,
        }
  );

  if (profileQuery.isPending || charactersQuery.isPending) {
    return <PageSkeleton />;
  }

  if (profileQuery.isError || charactersQuery.isError) {
    return null;
  }

  return (
    <ActivityWrapper
      destinyMembershipId={profileQuery.data.membershipId}
      membershipType={profileQuery.data.membershipType}
      characterIds={charactersQuery.data.characterIds}
      fallback={<PageSkeleton />}
      render={(activities) => (
        <DestinyWrapped
          activities={activities}
          characterMap={charactersQuery.data.characterClasses}
          displayName={
            <>
              <span>{profileQuery.data.displayName}</span>
              <span className="text-gray-300">
                #{profileQuery.data.bungieGlobalDisplayNameCode}
              </span>
            </>
          }
        />
      )}
    />
  );
}
