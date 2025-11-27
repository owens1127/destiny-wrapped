"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

interface SplashScreenProps {
  showSignIn?: boolean;
  disabled?: boolean;
  compact?: boolean;
}

export const SplashScreen = ({
  showSignIn = false,
  disabled = false,
  compact = false,
}: SplashScreenProps = {}) => {
  return (
    <div
      className={
        compact
          ? "flex items-center justify-center p-4"
          : "min-h-screen flex items-center justify-center p-4"
      }
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-6"
        >
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
        </motion.div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-bold text-white mb-2"
        >
          Destiny Wrapped 2025
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-lg text-white/80 mb-6"
        >
          {showSignIn ? "Sign in to get started" : "Loading..."}
        </motion.p>
        {showSignIn && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button className="w-full max-w-xs" disabled={disabled} size="lg">
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
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
