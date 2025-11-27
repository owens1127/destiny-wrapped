import posthog from "posthog-js";
import { identifyUser } from "@/lib/posthog-client";

/**
 * Gets a cookie value by name
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split("=");
    if (key === name) return value;
  }
  return null;
}

if (typeof window !== "undefined") {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost =
    process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  if (posthogKey) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      // Enable automatic page view tracking for DAU calculation
      // Filter for /wrapped in PostHog dashboard
      capture_pageview: true,
      capture_pageleave: false,
      // Don't capture PII
      autocapture: false,
      // Respect Do Not Track
      respect_dnt: true,
      loaded: () => {
        // Automatically identify user from cookie when PostHog loads
        const membershipId = getCookie("__destiny-wrapped.membershipid");
        if (membershipId) {
          identifyUser(membershipId);
        }

        if (process.env.NODE_ENV === "development") {
          console.log(
            "PostHog initialized",
            membershipId ? `(identified: ${membershipId})` : ""
          );
        }
      },
    });
  }
}
