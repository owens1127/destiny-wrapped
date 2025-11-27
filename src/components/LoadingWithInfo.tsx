"use client";

import React from "react";
import { AuthLayout } from "./AuthLayout";

/**
 * Loading state using the stable AuthLayout.
 * Only the content changes, layout stays stable.
 */
export const LoadingWithInfo = ({
  message = "Loading...",
}: {
  message?: string;
}) => {
  return (
    <AuthLayout>
      <div className="text-center pt-2">
        <p className="text-sm text-white/60">{message}</p>
      </div>
    </AuthLayout>
  );
};
