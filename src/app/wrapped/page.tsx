"use client";

import { ActivityWrapper } from "@/components/ActivityWrapper";
import { DestinyWrappedView } from "@/components/DestinyWrappedView";
import { LoadingWithInfo } from "@/components/LoadingWithInfo";
import { useDestinyCharacters } from "@/characters/useDestinyCharacters";
import { useDestinyManifestComponent } from "@/manifest/useDestinyManifestComponent";
import { useDestinyMembership } from "@/characters/useDestinyMembership";
import { useToast } from "@/ui/useToast";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBungieSession } from "next-bungie-auth/client";

export default function WrappedPage() {
  const router = useRouter();
  const session = useBungieSession();

  // Redirect to home if unauthenticated
  useEffect(() => {
    if (!session.isPending && session.status !== "authorized") {
      router.replace("/");
    }
  }, [router, session.isPending, session.status]);

  // Redirect to home if accessed directly (check sessionStorage)
  useEffect(() => {
    const hasStarted = sessionStorage.getItem("wrapped-started");
    if (!hasStarted) {
      router.replace("/");
    }
  }, [router]);

  // preloading
  useDestinyManifestComponent("DestinyActivityDefinition");
  useDestinyManifestComponent("DestinyInventoryItemDefinition");
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

  // Scroll to just below header on load
  useEffect(() => {
    if (!membershipQuery.isPending && !charactersQuery.isPending) {
      // Wait for next tick to ensure DOM is ready
      setTimeout(() => {
        const header = document.querySelector("header");
        if (header) {
          const headerHeight = header.offsetHeight;
          window.scrollTo({
            top: headerHeight + 16, // 16px padding below header
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }, [membershipQuery.isPending, charactersQuery.isPending]);

  // Don't render if unauthenticated (will redirect)
  if (!session.isPending && session.status !== "authorized") {
    return null;
  }

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
        <DestinyWrappedView
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
