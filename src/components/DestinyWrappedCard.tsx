"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/ui/utils";
import { Globe } from "lucide-react";
import Link from "next/link";

interface DestinyWrappedCardProps {
  className?: string;
  children: React.ReactNode;
}

export function DestinyWrappedCard({
  className,
  children,
}: DestinyWrappedCardProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <Card
        className={cn(
          className,
          "overflow-hidden shadow-lg shadow-gray-700/50 dark:shadow-lg dark:shadow-gray-600/50 h-[768px] lg:h-[960px] flex flex-col"
        )}
      >
        <div className="flex-1 overflow-hidden">{children}</div>
        {/* Footer Watermarks */}
        <div className="mt-auto px-4 pb-3 pt-2 border-t border-white/20 flex items-center justify-between text-xs text-white/70">
          <Link
            href="https://wrapped.report"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity flex items-center gap-1.5"
            aria-label="wrapped.report"
          >
            <Globe className="w-4 h-4" />
            <span className="font-medium">wrapped.report</span>
          </Link>
          <Link
            href="https://x.com/kneewoah"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity flex items-center gap-1.5"
            aria-label="X.com"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="font-medium">@kneewoah</span>
          </Link>
        </div>
      </Card>
    </div>
  );
}
