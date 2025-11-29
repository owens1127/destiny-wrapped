import "server-only";
import { createNextBungieAuth } from "next-bungie-auth/server";
import { trackSignIn, trackSignOut } from "@/analytics/posthog-server";

export const {
  catchAllHandler,
  serverSideHelpers: { getServerSession },
} = createNextBungieAuth({
  clientId: process.env.BUNGIE_CLIENT_ID!,
  clientSecret: process.env.BUNGIE_CLIENT_SECRET!,
  baseCookieName: "__destiny-wrapped",
  generateState: () => crypto.randomUUID(),
  generateCallbackUrl: (req) => new URL("/", req.nextUrl.origin).toString(),
  onSignIn: (bungieMembershipId) => {
    console.log("SIGN IN", bungieMembershipId);
    trackSignIn(bungieMembershipId).catch((error) => {
      console.error("Failed to track sign-in:", error);
    });
  },
  onSignOut: (bungieMembershipId) => {
    console.log("SIGN OUT", bungieMembershipId);
    trackSignOut(bungieMembershipId).catch((error) => {
      console.error("Failed to track sign-out:", error);
    });
  },
});
