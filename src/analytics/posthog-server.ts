import { PostHog } from "posthog-node";

let posthogClient: PostHog | null = null;

export function getPostHogClient(): PostHog | null {
  if (posthogClient) {
    return posthogClient;
  }

  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost =
    process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  if (!posthogKey) {
    return null;
  }

  posthogClient = new PostHog(posthogKey, {
    host: posthogHost,
  });

  return posthogClient;
}

/**
 * Internal helper to track server-side events
 */
async function trackServerEvent(
  eventName: string,
  membershipId?: string
): Promise<void> {
  const client = getPostHogClient();
  if (!client) return;

  client.capture({
    distinctId: membershipId || "anonymous",
    event: eventName,
    properties: {
      timestamp: new Date().toISOString(),
      ...(membershipId && { membershipId }), // Only include if available
    },
  });

  // Flush events to ensure they're sent
  await client.shutdown();
}

export async function trackSignIn(membershipId?: string) {
  await trackServerEvent("user_signed_in", membershipId);
}

export async function trackSignOut(membershipId?: string) {
  await trackServerEvent("user_signed_out", membershipId);
}
