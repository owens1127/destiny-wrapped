import { catchAllHandler, getServerSession } from "..";
import { NextRequest } from "next/server";
import { trackSignIn, trackSignOut } from "@/lib/posthog-server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const response = await catchAllHandler.GET(req);

  // Track sign-in only on successful OAuth callback (GET with code parameter)
  const url = new URL(req.url);
  const isCallback =
    url.searchParams.has("code") && url.pathname.includes("/callback");

  if (isCallback && response.status === 200) {
    // This is a successful OAuth callback - track sign-in server-side
    // Get session to extract membershipId
    const c = await cookies();
    const session = getServerSession(c);
    const membershipId = session?.data?.bungieMembershipId;

    // Don't await to avoid blocking the response
    trackSignIn(membershipId).catch((error) => {
      console.error("Failed to track sign-in:", error);
    });
  }

  return response;
}

export async function POST(req: NextRequest) {
  // Get session before it's killed to extract membershipId
  const c = await cookies();
  const session = getServerSession(c);
  const membershipId = session?.data?.bungieMembershipId;

  const response = await catchAllHandler.POST(req);

  // Track sign-out if this is a kill request (session.kill() calls POST)
  // Check if the response indicates the session was killed
  if (response.status === 200 && membershipId) {
    // Don't await to avoid blocking the response
    trackSignOut(membershipId).catch((error) => {
      console.error("Failed to track sign-out:", error);
    });
  }

  return response;
}
