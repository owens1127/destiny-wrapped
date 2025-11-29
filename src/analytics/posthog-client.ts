import posthog from "posthog-js";

/**
 * Identify a user in PostHog (for DAU tracking)
 * Call this when you have the user's membershipId
 */
export function identifyUser(membershipId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    posthog.identify(membershipId);
  } catch (error) {
    console.debug("PostHog not available for user identification:", error);
  }
}

/**
 * Safely capture a PostHog event on the client side
 * Handles window checks and error catching
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    posthog.capture(eventName, {
      timestamp: new Date().toISOString(),
      ...properties,
    });
  } catch (error) {
    // Silently fail if PostHog not available
    console.debug("PostHog not available for tracking:", eventName, error);
  }
}
