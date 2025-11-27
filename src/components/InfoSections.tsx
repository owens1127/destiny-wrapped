"use client";

import React from "react";
import { BarChart3, Download, Share2 } from "lucide-react";

export const InfoSections = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <BarChart3 className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">
            Discover Your Stats
          </h3>
          <p className="text-white/70">
            See your most played activities, favorite classes, longest
            streaks, and more from your Destiny 2 journey in 2025.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Download className="w-6 h-6 text-purple-400 mt-1 flex-shrink-0" />
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">
            NEW: Enhanced Stats Available
          </h3>
          <p className="text-white/70">
            Download Post-Game Carnage Reports (PGCRs) to unlock
            detailed insights like weapon usage, favorite teammates,
            ability kills, and more.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Share2 className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">
            Share Your Journey
          </h3>
          <p className="text-white/70">
            Celebrate your year in Destiny 2 and share your wrapped
            stats with the community using{" "}
            <span className="font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              #Destiny2Wrapped2025
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

