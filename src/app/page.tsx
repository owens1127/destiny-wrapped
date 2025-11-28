"use client";

import { ActivityWrapper } from "@/components/ActivityWrapper";
import { IntroScreen } from "@/components/IntroScreen";
import { LoadingWithInfo } from "@/components/LoadingWithInfo";

import { useDestinyCharacters } from "@/characters/useDestinyCharacters";
import { useDestinyManifestComponent } from "@/manifest/useDestinyManifestComponent";
import { useDestinyMembership } from "@/characters/useDestinyMembership";
import { useToast } from "@/ui/useToast";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
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

  if (membershipQuery.isPending) {
    return <LoadingWithInfo state="profile" />;
  }

  if (charactersQuery.isPending) {
    return <LoadingWithInfo state="characters" />;
  }

  if (membershipQuery.isError || charactersQuery.isError) {
    return null;
  }

  return (
    <ActivityWrapper
      destinyMembershipId={membershipQuery.data.membershipId}
      membershipType={membershipQuery.data.membershipType}
      characterIds={charactersQuery.data.characterIds}
      fallback={<LoadingWithInfo state="activities" />}
      noActivities={<div className="text-center">{":("}</div>}
      render={(activities) => (
        <IntroScreen
          activities={activities}
          onStart={() => {
            sessionStorage.setItem("wrapped-started", "true");
            router.push("/wrapped");
          }}
        />
      )}
    />
  );
}
