"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useBungieSession } from "next-bungie-auth/client";
import posthog from "posthog-js";
import { identifyUser } from "@/analytics/posthog-client";

/**
 * Integrates PostHog with Next.js App Router for automatic page view tracking
 * Identifies user when session becomes available (after sign-in)
 */
export function PostHogRouter() {
  const pathname = usePathname();
  const session = useBungieSession();

  useEffect(() => {
    // Identify user when session becomes available (after sign-in)
    if (session.data?.bungieMembershipId) {
      const membershipId = session.data.bungieMembershipId;
      if (typeof window !== "undefined" && posthog.__loaded) {
        identifyUser(membershipId);
        if (process.env.NODE_ENV === "development") {
          console.log("PostHog identified user", membershipId);
        }
      }
    }
  }, [session.data?.bungieMembershipId]);

  useEffect(() => {
    // Track page views for Next.js App Router (client-side navigation)
    // PostHog's automatic page view tracking works on initial load,
    // but we need to manually track route changes in App Router
    if (typeof window !== "undefined" && pathname) {
      posthog.capture("$pageview");
    }
  }, [pathname]);

  return null;
}
