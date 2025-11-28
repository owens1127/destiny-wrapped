"use client";

import { BungieSession } from "next-bungie-auth/types";
import { Button } from "./ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthLayout } from "./AuthLayout";

/**
 * Content component for unauthorized state.
 * Only renders the dynamic content - layout is handled by AuthLayout.
 */
export function Unauthorized(
  props: BungieSession & {
    status: "unauthorized" | "unavailable" | "stale" | "pending";
  }
) {
  const params = useSearchParams();
  const error = params.get("error");

  const getMessage = () => {
    switch (props.status) {
      case "unauthorized":
        return "You must authorize this tool in order to proceed";
      case "unavailable":
        return "This tool is currently unavailable. Please try again later.";
      default:
        return "An unknown error occurred.";
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-4 pt-2">
        {props.isPending ? (
          <div className="text-center">
            <p className="text-sm text-white/60">
              Checking authentication status...
            </p>
          </div>
        ) : (
          <>
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-400 font-semibold mb-1">
                  Authorization Error: {error}
                </p>
                <p className="text-red-300 text-sm">
                  An error occurred while authorizing your session. Please try
                  again.
                </p>
              </div>
            )}

            {/* Sign In Section */}
            <div className="text-center">
              <p className="text-sm text-white/70 mb-4">{getMessage()}</p>
            </div>
            <Button
              className="w-full"
              size="lg"
              disabled={props.status === "unavailable"}
            >
              <Link
                prefetch={false}
                href="/api/auth/authorize"
                className="w-full h-full py-2 px-4 flex items-center justify-center"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = "/api/auth/authorize";
                }}
              >
                Sign In with Bungie
              </Link>
            </Button>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
