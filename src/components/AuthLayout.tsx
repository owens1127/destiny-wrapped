"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { InfoSections } from "./InfoSections";

/**
 * Stable layout component for authentication pages.
 * The layout structure never changes - only the content inside changes.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="relative overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30 w-full max-w-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Sparkles className="w-16 h-16 text-yellow-400" />
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Sparkles className="w-16 h-16 text-yellow-400 opacity-50" />
              </motion.div>
            </div>
          </div>
          <CardTitle className="text-4xl font-bold text-white mb-2">
            Destiny Wrapped 2025
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          {/* Info Sections - Always visible, never changes */}
          <div className="mb-6">
            <InfoSections />
          </div>

          {/* Dynamic Content Area - Only this changes */}
          {children}
        </CardContent>
      </Card>
    </main>
  );
}
