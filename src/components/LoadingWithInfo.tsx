"use client";

import React from "react";
import { AuthLayout } from "./AuthLayout";

export type LoadingState =
  | "auth"
  | "profile"
  | "characters"
  | "activities"
  | "pgcrs";

const loadingMessages: Record<LoadingState, string> = {
  auth: "Checking authentication status...",
  profile: "Loading your profile...",
  characters: "Loading your characters...",
  activities: "Loading your activity history...",
  pgcrs: "Loading detailed activity data...",
};

const stepProgress: Record<LoadingState, number> = {
  auth: 0,
  profile: 25,
  characters: 50,
  activities: 75,
  pgcrs: 90,
};

/**
 * Loading state using the stable AuthLayout.
 * Only the content changes, layout stays stable.
 */
export const LoadingWithInfo = ({ state }: { state: LoadingState }) => {
  const displayMessage = loadingMessages[state];
  const progress = stepProgress[state] || 0;

  return (
    <AuthLayout>
      <div className="text-center pt-8 pb-6 space-y-6">
        <div className="space-y-4">
          <p className="text-lg font-medium text-white">{displayMessage}</p>
          <div className="px-8">
            {/* Progress bar */}
            <div className="relative w-full h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};
