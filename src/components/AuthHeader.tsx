"use client";

import { Button } from "@/components/ui/button";
import { useDestinyMembership } from "@/characters/useDestinyMembership";
import { useBungieSession } from "next-bungie-auth/client";
import { Skeleton } from "./ui/skeleton";
import { clearPGCRs } from "@/storage/idb";
import { useToast } from "@/ui/useToast";
import posthog from "posthog-js";

export const AuthHeader = () => {
  const session = useBungieSession();
  const profileQuery = useDestinyMembership();
  const { toast } = useToast();

  const handleSignOut = async () => {
    // Clear the database before signing out
    try {
      await clearPGCRs();
    } catch (error) {
      toast({
        title: "Failed to clear local storage on sign out",
        description: (error as Error).message,
        variant: "destructive",
      });
      console.error("Failed to clear database on sign out:", error);
    }

    // Reset PostHog identification on sign out
    if (typeof window !== "undefined") {
      try {
        posthog.reset();
      } catch (error) {
        console.debug("PostHog not available for reset:", error);
      }
    }

    session.kill();
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {profileQuery.isSuccess ? (
        <div>
          {profileQuery.data.bungieGlobalDisplayName}#
          {profileQuery.data.bungieGlobalDisplayNameCode}
        </div>
      ) : (
        <Skeleton className="h-6 w-20" />
      )}
      <Button disabled={session.isPending} onClick={handleSignOut}>
        Sign Out
      </Button>
    </div>
  );
};
